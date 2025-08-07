'use client'

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'
import { Menu, LogOut } from 'lucide-react'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const { success } = useToast()

  /// Xử lý đăng xuất
  const handleLogout = () => {
    logout()
    success('Đăng xuất thành công', 'Hẹn gặp lại bạn!')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
              SSP Admin Dashboard
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* User info */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            <div className="text-sm">
              <p className="text-gray-700 font-medium">{user?.username}</p>
              <p className="text-gray-500 hidden lg:block">Quản trị viên</p>
            </div>
          </div>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-2 py-2 lg:px-3 lg:py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  )
}