'use client'

import { AlertTriangle, X, Loader2, Trash2 } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { useState } from 'react'

interface DeleteGameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  gameName: string
  isDeleting?: boolean
}

export function DeleteGameModal({ isOpen, onClose, onConfirm, gameName, isDeleting }: DeleteGameModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
      setDeleteSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      onClose()
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
    } finally {
      setIsProcessing(false)
      setDeleteSuccess(false)
    }
  }

  const isDisabled = isDeleting || isProcessing

  return (
    <ModalPortal isOpen={isOpen} onClose={!isDisabled ? onClose : undefined}>
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 relative">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 ${
              isProcessing ? 'bg-red-100' : deleteSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
              ) : deleteSuccess ? (
                <Trash2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isProcessing ? 'Đang xóa...' : deleteSuccess ? 'Đã xóa!' : 'Xác nhận xóa'}
            </h2>
          </div>
          
          {/* Progress bar */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
              <div className="h-full bg-red-600 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          )}
          
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 relative">
          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Đang xóa trò chơi...</p>
              </div>
            </div>
          )}
          
          <p className="text-gray-700 text-base leading-relaxed">
            Bạn có chắc chắn muốn xóa trò chơi{' '}
            <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">&quot;{gameName}&quot;</span>?
          </p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm flex items-start">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan bao gồm danh mục, gói câu hỏi và câu hỏi.
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDisabled}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium min-w-[120px] flex items-center justify-center ${
              deleteSuccess 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : deleteSuccess ? (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Đã xóa!
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa trò chơi
              </>
            )}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}