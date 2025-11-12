"use client"

import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Account Registration Disabled</h1>
        <p className="text-muted-foreground">
          Accounts are not required. You can create tracks without signing up.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Start Creating</Link>
          <Link href="/trends" className="btn-ghost">Explore Trends</Link>
        </div>
      </div>
    </div>
  )
}
