"use client"

import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Authentication Disabled</h1>
        <p className="text-muted-foreground">
          This project no longer uses account login. Jump straight into creating music.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">Go to Create</Link>
          <Link href="/trends" className="btn-ghost">View Trends</Link>
        </div>
      </div>
    </div>
  )
}
