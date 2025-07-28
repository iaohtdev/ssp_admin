'use client'

import { X, Folder, Calendar, Gamepad2, Tag } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { formatDate } from '@/lib/utils'
import { CategoryWithGames } from '@/types'

interface CategoryDetailModalProps {
  isOpen: boolean
  onClose: () => void
  category: CategoryWithGames | null
}

export function CategoryDetailModal({ 
  isOpen, 
  onClose, 
  category
}: CategoryDetailModalProps) {
  if (!isOpen || !category) return null

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-200 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết danh mục</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Tên danh mục */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Folder className="w-4 h-4 mr-2" />
                Tên danh mục
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-900 leading-relaxed font-medium text-lg">{category.name}</p>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slug */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Slug
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-gray-900 font-mono text-sm">{category.slug}</p>
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Trạng thái
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trò chơi */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Trò chơi áp dụng
              </h3>
              <div className="bg-white border rounded-lg p-4">
                {category.games && category.games.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {category.games.map(game => (
                      <span key={game.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {game.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa gán trò chơi nào</p>
                )}
              </div>
            </div>

            {/* Ngày tạo */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Ngày tạo
              </h3>
              <div className="bg-white border rounded-lg p-3">
                <div className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(category.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* ID (ẩn dưới cùng) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                ID
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-gray-500 font-mono text-sm break-all">{category.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}