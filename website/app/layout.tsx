import type { Metadata } from 'next'
import { GeistPixelSquare } from 'geist/font/pixel'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { SlugtreeProvider } from 'slugtree/react'
import themeEffect from '@/lib/theme-effect'

const sans = GeistSans
const mono = GeistMono

const pixel = GeistPixelSquare

export const metadata: Metadata = {
  title: 'Slugtree',
  description: 'Documentation built with slugtree',
  icons: {
    icon: '/favicon.svg'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SlugtreeProvider>
      <html
        lang="en"
        className={`
            ${sans.variable}
            ${mono.variable}
            ${pixel.variable}
            `}
        suppressHydrationWarning
      >
        <head>
          <script
            async
            dangerouslySetInnerHTML={{
              __html: `(${themeEffect.toString()})();`
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </SlugtreeProvider>
  )
}
