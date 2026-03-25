'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/store'

export default function NavBar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  return (
    <nav className="bg-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">TradeSource</Link>
        <div className="flex items-center gap-4">
          {user && user.status === 'approved' && (
            <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
          )}
          <Link href={user ? "/my-jobs" : "/login"} className="text-sm hover:underline">
            {user ? 'My Jobs' : 'Sign In'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
