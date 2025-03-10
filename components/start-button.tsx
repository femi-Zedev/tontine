"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function StartButton() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleStart = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }

  return (
    <Button size="lg" className="gap-1.5" onClick={handleStart}>
      Commencer
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}
