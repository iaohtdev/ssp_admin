'use client'

import { X, Package, Calendar, Gamepad2, Crown, CheckCircle, XCircle } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { formatDate } from '@/lib/utils'
import { Pack, Game } from '@/types'

interface PackDetailModalProps {
  isOpen: boolean
  onClose: () => void
  pack: Pack | null
  games: Game[]
}

export function PackDetailModal({
  isOpen,
  onClose,
  pack,
  games
}: PackDetailModalProps) {
  if (!isOpen || !pack) return null

  // Get game name
  const getGameName = (gameId: string | null | undefined) => {
    if (!gameId) return 'Chưa gán'
    const game = games.find(g => g.id === gameId)
    return game ? game.name : 'Không xác định'
  }

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết gói</h2>
              <p className="text-sm text-gray-600">Thông tin chi tiết về gói nội dung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Tên gói */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Tên gói
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-900 leading-relaxed font-medium text-lg">{pack.name}</p>
              </div>
            </div>

            {/* Mô tả */}
            {pack.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Mô tả</h3>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-gray-900 leading-relaxed">{pack.description}</p>
                </div>
              </div>
            )}

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trò chơi */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Trò chơi áp dụng
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getGameName(pack.game_id)}
                  </span>
                </div>
              </div>

              {/* Loại gói */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Loại gói
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    pack.is_premium 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pack.is_premium ? 'Premium' : 'Miễn phí'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Trạng thái</h3>
              <div className="bg-white border rounded-lg p-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  pack.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pack.is_active ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Hoạt động
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Tạm dừng
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Thông tin thời gian */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Thông tin thời gian
              </h3>
              <div className="bg-white border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {pack.created_at ? formatDate(pack.created_at) : 'Không xác định'}
                    </p>
                  </div>
                 
                </div>
              </div>
            </div>

            {/* Tóm tắt */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Tóm tắt</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Loại</p>
                    <p className="text-lg font-bold text-blue-800">
                      {pack.is_premium ? 'Premium' : 'Miễn phí'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Trạng thái</p>
                    <p className="text-lg font-bold text-blue-800">
                      {pack.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}