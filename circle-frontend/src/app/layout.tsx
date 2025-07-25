import type { Metadata } from 'next'
import './globals.css'
import ConditionalBottomNav from '../components/Layout/ConditionalBottomNav'
import Providers from '@/components/Providers'

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
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-20">
              {children}
            </main>
            <ConditionalBottomNav />
          </div>
        </Providers>
      </body>
    </html>
  )
} 