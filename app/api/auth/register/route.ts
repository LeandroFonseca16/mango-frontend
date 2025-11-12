import { NextResponse } from 'next/server'

// Registration disabled: auth was removed from the app.
export async function POST() {
  return NextResponse.json(
    { error: 'Registration disabled (auth removed).' },
    { status: 404 }
  )
}
