'use client'

import { X, MessageSquare, Calendar, ThumbsUp, ThumbsDown, Package, Folder } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { formatDate } from '@/lib/utils'
import { Question, Pack, Category } from '@/types'

interface QuestionWithRelations extends Question {
  packs?: { name: string } | null
  categories?: { name: string } | null
}

interface QuestionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  question: QuestionWithRelations | null
  packs?: Pack[]
  categories?: Category[]
}

export function QuestionDetailModal({
  isOpen,
  onClose,
  question,
  packs = [],
  categories = []
}: QuestionDetailModalProps) {
  if (!isOpen || !question) return null

  // Get pack and category names
  const getPackName = (packId: string | null | undefined) => {
    if (!packId) return 'Chưa gán'
    const pack = packs.find(p => p.id === packId)
    return pack ? pack.name : 'Không xác định'
  }

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Chưa gán'
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Không xác định'
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
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Chi tiết câu hỏi</h2>
              <p className="text-sm text-gray-600">Thông tin chi tiết về câu hỏi</p>
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
            {/* Nội dung câu hỏi */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Nội dung câu hỏi
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-900 leading-relaxed">{question.content}</p>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gói */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Gói
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-gray-900 font-medium">
                    {question.packs?.name || getPackName(question.pack_id)}
                  </p>
                </div>
              </div>

              {/* Danh mục */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Folder className="w-4 h-4 mr-2" />
                  Danh mục
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <p className="text-gray-900 font-medium">
                    {question.categories?.name || getCategoryName(question.category_id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Trạng thái</h3>
              <div className="bg-white border rounded-lg p-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  question.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {question.is_active ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>
            </div>

            {/* Thống kê tương tác */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Thống kê tương tác</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Lượt thích</p>
                      <p className="text-2xl font-bold text-green-600">{question.likes || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ThumbsDown className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Lượt không thích</p>
                      <p className="text-2xl font-bold text-red-600">{question.dislikes || 0}</p>
                    </div>
                  </div>
                </div>
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
                    <p className="text-sm text-gray-600">Danh mục</p>
                    <p className="text-sm font-medium text-gray-900">
                      {question.categories?.name || getCategoryName(question.category_id) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {question.categories?.name || getCategoryName(question.category_id)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa chọn danh mục</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gói</p>
                    <p className="text-sm font-medium text-gray-900">
                      {question.packs?.name || getPackName(question.pack_id) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.packs?.name || getPackName(question.pack_id)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa chọn gói</span>
                      )}
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