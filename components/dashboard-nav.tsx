"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserAvatar } from "@/components/user-avatar"

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 header-gradient px-6">
      <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
        <span className="font-bold">TontineHub</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link 
          className={`text-sm font-medium ${
            pathname === "/dashboard" ? "" : "font-semibold"
          }`} 
          href="/dashboard"
        >
          Tableau de bord
        </Link>
        <UserAvatar />
      </nav>
    </header>
  )
}
