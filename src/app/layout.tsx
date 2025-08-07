import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import { ToastContainer } from '@/components/ui/toast'
import AuthGuard from '@/components/auth-guard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SSP Admin | Dashboard',
  description: 'Quản lý nội dung trò chơi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
