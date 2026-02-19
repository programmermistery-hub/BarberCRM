import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'The Lord Barber',
  description: 'Sistema de gerenciamento - The Lord Barber',
  icons: {
    icon: '/images/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'oklch(0.17 0.005 250)',
              border: '1px solid oklch(0.28 0.01 250)',
              color: 'oklch(0.93 0.005 90)',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
