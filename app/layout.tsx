import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradeSource - Montgomery County Painting Network',
  description: 'Verified painters network for Montgomery County, PA. Connect with trusted painting contractors.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
