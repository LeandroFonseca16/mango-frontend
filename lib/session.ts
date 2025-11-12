// Auth helpers removed. All endpoints now public or stubbed.
export async function getCurrentUser() {
  return null
}
export async function requireAuth() {
  throw new Error('Auth disabled')
}
