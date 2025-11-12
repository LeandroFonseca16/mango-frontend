import { Metadata } from 'next'
import { DashboardContent } from './DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Create and manage your AI-generated music tracks',
}

export default function DashboardPage() {
  const user = { name: 'Creator' }
  return <DashboardContent user={user} />
}
