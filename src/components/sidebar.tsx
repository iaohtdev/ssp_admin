'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Gamepad2, 
  Tag,
  Package, 
  MessageCircleQuestion,
  BarChart3,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Trò chơi', href: '/games', icon: Gamepad2 },
  { name: 'Danh mục', href: '/categories', icon: Tag },
  { name: 'Gói nội dung', href: '/packs', icon: Package },
  { name: 'Câu hỏi', href: '/questions', icon: MessageCircleQuestion },
  { name: 'Thống kê', href: '/analytics', icon: BarChart3 },
]

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-lg">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">SSP Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <SidebarContent pathname={pathname} onItemClick={() => setSidebarOpen(false)} />
      </div>
    </>
  )
}

function SidebarContent({ pathname, onItemClick }: { pathname: string, onItemClick?: () => void }) {
  return (
    <>
      {/* Logo - chỉ hiển thị trên desktop */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:h-16 lg:px-4 lg:bg-blue-600">
        <h1 className="text-xl font-bold text-white">SSP Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}