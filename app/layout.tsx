import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'mango.',
    template: '%s | mangodot'
  },
  description: 'Create AI-generated music tracks for TikTok trends and more. Professional music generation powered by advanced AI.',
  keywords: ['AI music', 'music generation', 'TikTok', 'beats', 'AI composition'],
  authors: [{ name: 'MangoBeat Team' }],
  creator: 'MangoBeat AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mangobeat.ai',
    title: 'mangodot',
    description: 'Create AI-generated music tracks for TikTok trends and more.',
    siteName: 'MangoBeat AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MangoBeat AI',
    description: 'Create AI-generated music tracks for TikTok trends and more.',
    creator: '@mangobeatai',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen`}>
        <Providers>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  )
}
