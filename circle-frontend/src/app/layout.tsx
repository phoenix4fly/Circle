import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className="telegram-webapp">
        {children}
      </body>
    </html>
  )
} 