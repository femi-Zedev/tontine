import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: "moderator" | "member"
    } & DefaultSession["user"]
  }
}

// Create Supabase client for direct operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      // Check if user exists in Supabase
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      
      if (findError && findError.code !== 'PGRST116') {
        console.error('Error checking for existing user:', findError)
        return false
      }
      
      // If user doesn't exist, create them
      if (!existingUser) {
        // Generate a UUID for the user
        const userId = uuidv4();
        
        // Create user directly in the users table
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: user.email,
            name: user.name,
            created_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Error creating user:', insertError)
          return false
        }
        
        // Store the UUID in the user object for later use
        user.id = userId;
      } else {
        // Use the existing user's UUID
        user.id = existingUser.id;
      }
      
      return true
    },
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at,
          user: {
            id: user.id, // This is now the UUID
            email: user.email,
            name: user.name,
            role: "member"
          }
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token.user) {
        session.user = token.user as any
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + "/dashboard"
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
