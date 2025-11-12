import { NextResponse } from 'next/server'

export default function middleware() {
  // No auth enforcement; pass through all requests
  return NextResponse.next()
}

// No matchers -> middleware effectively disabled
export const config = {}
