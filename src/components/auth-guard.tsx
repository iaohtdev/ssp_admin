'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!isLoading) {
      // Step 1: Nếu chưa đăng nhập và không phải trang login
      if (!user && !isLoginPage) {
        router.push('/login')
        return
      }
      
      // Step 2: Nếu đã đăng nhập và đang ở trang login
      if (user && isLoginPage) {
        router.push('/')
        return
      }
    }
  }, [user, isLoading, isLoginPage, router])

  // Step 3: Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Step 4: Nếu là trang login, hiển thị trực tiếp
  if (isLoginPage) {
    return <>{children}</>
  }

  // Step 5: Nếu chưa đăng nhập, không hiển thị gì (sẽ redirect)
  if (!user) {
    return null
  }

  // Step 6: Hiển thị layout dashboard cho user đã đăng nhập
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}