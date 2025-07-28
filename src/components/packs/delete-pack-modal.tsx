'use client'

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'

interface DeletePackModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  packName: string
  isDeleting?: boolean
}

export function DeletePackModal({
  isOpen,
  onClose,
  onConfirm,
  packName,
  isDeleting = false
}: DeletePackModalProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  if (!isOpen) return null

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h2>
            <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa gói này không?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-400">
            <p className="text-sm font-medium text-gray-900 mb-1">Tên gói:</p>
            <p className="text-sm text-gray-700 italic">
              &quot;{packName}&quot;
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Gói sẽ bị xóa vĩnh viễn khỏi hệ thống</li>
                  <li>Tất cả câu hỏi trong gói sẽ bị ảnh hưởng</li>
                  <li>Không thể khôi phục sau khi xóa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xóa gói</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}