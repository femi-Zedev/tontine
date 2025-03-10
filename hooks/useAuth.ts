import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth(requireModeratorRole = false) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (requireModeratorRole && session?.user?.role !== "moderator") {
      router.push("/dashboard")
    }
  }, [status, session, requireModeratorRole, router])

  return {
    session,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isModerator: session?.user?.role === "moderator",
  }
}
