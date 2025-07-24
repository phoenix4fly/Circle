import type { Metadata } from 'next'
import './globals.css'
import ConditionalBottomNav from '@/components/Layout/ConditionalBottomNav'

export const metadata: Metadata = {
  title: 'Circle - Путешествия с единомышленниками',
  description: 'Найди свою компанию для незабываемых путешествий',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="telegram-webapp" suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 pb-20">
            {children}
          </main>
          <ConditionalBottomNav />
        </div>
      </body>
    </html>
  )
} 