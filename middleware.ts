import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Only allow authenticated users
      return !!token
    },
  },
})

// Protect all routes under /dashboard and /tontines
export const config = {
  matcher: ["/dashboard/:path*", "/tontines/:path*"],
}
