'use client'

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/contexts/toast-context'

export function Header() {
  const { user, logout } = useAuth()
  const { success } = useToast()

  /// Xử lý đăng xuất
  const handleLogout = () => {
    logout()
    success('Đăng xuất thành công', 'Hẹn gặp lại bạn!')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            SSP Admin Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <p className="text-gray-700 font-medium">{user?.username}</p>
              <p className="text-gray-500">Quản trị viên</p>
            </div>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}