'use client'

import { X, Calendar, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ModalPortal } from '@/components/ui/modal-portal'
import { Game } from '@/types'

interface GameDetailModalProps {
  isOpen: boolean
  onClose: () => void
  game: Game | null
}

export function GameDetailModal({ isOpen, onClose, game }: GameDetailModalProps) {
  if (!game) return null

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-200 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết trò chơi</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Tên trò chơi
                </label>
                <p className="text-lg font-semibold text-gray-900">{game.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Trạng thái
                </label>
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    game.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {game.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Ngày tạo
                </label>
                <div className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(game.created_at)}
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Mô tả
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {game.description || 'Không có mô tả'}
                </p>
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