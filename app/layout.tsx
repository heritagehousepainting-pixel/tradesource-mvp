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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (localStorage.getItem('theme') === 'dark' || 
                    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-900">{children}</body>
    </html>
  )
}
