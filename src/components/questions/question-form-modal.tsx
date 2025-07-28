'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Save, Plus, MessageSquare } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { Question, Pack, Category } from '@/types'

// Cập nhật schema để loại bỏ type và làm các trường khác optional
const questionSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi là bắt buộc'),
  pack_id: z.string().optional(),
  category_id: z.string().optional(),
  is_active: z.boolean()
})

interface QuestionFormData {
  content: string
  pack_id?: string
  category_id?: string
  is_active: boolean
}

// Cập nhật interface để hỗ trợ QuestionWithRelations
interface QuestionWithRelations extends Question {
  packs?: { name: string } | null
  categories?: { name: string } | null
}

interface QuestionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuestionFormData) => void
  initialData?: QuestionWithRelations | null
  mode: 'create' | 'edit'
  packs?: Pack[]
  categories?: Category[]
}

export function QuestionFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode,
  packs = [],
  categories = []
}: QuestionFormModalProps) {
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: '',
      pack_id: '',
      category_id: '',
      is_active: true
    }
  })

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        content: initialData.content || '',
        pack_id: initialData.pack_id || '',
        category_id: initialData.category_id || '',
        is_active: initialData.is_active ?? true
      })
    } else if (isOpen) {
      reset({
        content: '',
        pack_id: '',
        category_id: '',
        is_active: true
      })
    }
  }, [isOpen, initialData, reset])

  const handleFormSubmit = async (data: QuestionFormData) => {
    setSubmitSuccess(false)
    
    try {
      await onSubmit(data)
      
      // Show success state briefly
      setSubmitSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      onClose()
      reset()
    } catch (error) {
      console.error('Lỗi khi lưu câu hỏi:', error)
    } finally {
      setSubmitSuccess(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      reset()
    }
  }

  if (!isOpen) return null

  return (
    <ModalPortal isOpen={isOpen} onClose={handleClose}>
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 relative">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors duration-200 ${
              isSubmitting ? 'bg-blue-100' : submitSuccess ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : submitSuccess ? (
                <Save className="w-4 h-4 text-green-600" />
              ) : mode === 'create' ? (
                <Plus className="w-4 h-4 text-gray-600" />
              ) : (
                <MessageSquare className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Thêm câu hỏi mới' : 'Chỉnh sửa câu hỏi'}
            </h2>
          </div>
          
          {/* Progress bar */}
          {isSubmitting && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
              <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          )}
          
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Loading overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {mode === 'create' ? 'Đang tạo câu hỏi...' : 'Đang cập nhật...'}
                </p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
            <div className="space-y-5">
              {/* Nội dung câu hỏi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('content')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập nội dung câu hỏi, thử thách hoặc hình phạt..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              {/* Danh mục (Optional) - Đưa lên trước */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <select
                  {...register('category_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                >
                  <option value="">Chọn danh mục (tùy chọn)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                )}
              </div>

              {/* Gói (Optional) - Đưa xuống dưới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gói <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <select
                  {...register('pack_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                >
                  <option value="">Chọn gói (tùy chọn)</option>
                  {packs.map(pack => (
                    <option key={pack.id} value={pack.id}>{pack.name}</option>
                  ))}
                </select>
                {errors.pack_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.pack_id.message}</p>
                )}
              </div>

              {/* Trạng thái */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Câu hỏi sẽ hiển thị trong ứng dụng khi được kích hoạt
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting || !isDirty}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
              submitSuccess 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...'}</span>
              </>
            ) : submitSuccess ? (
              <>
                <Save className="w-4 h-4" />
                <span>Thành công!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mode === 'create' ? 'Tạo câu hỏi' : 'Cập nhật'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}