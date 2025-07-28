'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Save, Plus, Package } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { Pack, Game } from '@/types'

const packSchema = z.object({
  name: z.string().min(1, 'Tên gói là bắt buộc'),
  description: z.string().optional(),
  game_id: z.string().min(1, 'Vui lòng chọn trò chơi'),
  is_premium: z.boolean(),
  is_active: z.boolean()
})

interface PackFormData {
  name: string
  description?: string
  game_id: string
  is_premium: boolean
  is_active: boolean
}

interface PackFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PackFormData) => void
  initialData?: Pack | null
  mode: 'create' | 'edit'
  games?: Game[]
}

export function PackFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode,
  games = []
}: PackFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<PackFormData>({
    resolver: zodResolver(packSchema),
    defaultValues: {
      name: '',
      description: '',
      game_id: '',
      is_premium: false,
      is_active: true
    }
  })

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        game_id: initialData.game_id || '',
        is_premium: initialData.is_premium ?? false,
        is_active: initialData.is_active ?? true
      })
    } else if (isOpen) {
      reset({
        name: '',
        description: '',
        game_id: '',
        is_premium: false,
        is_active: true
      })
    }
  }, [isOpen, initialData, reset])

  const handleFormSubmit = async (data: PackFormData) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    
    try {
      await onSubmit(data)
      
      setSubmitSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      onClose()
      reset()
    } catch (error) {
      console.error('Lỗi khi lưu gói:', error)
    } finally {
      setIsSubmitting(false)
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
                <Package className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Thêm gói mới' : 'Chỉnh sửa gói'}
            </h2>
          </div>
          
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
          {isSubmitting && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {mode === 'create' ? 'Đang tạo gói...' : 'Đang cập nhật...'}
                </p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
            <div className="space-y-5">
              {/* Tên gói */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên gói <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên gói..."
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Trò chơi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trò chơi <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('game_id')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                >
                  <option value="">Chọn trò chơi</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
                {errors.game_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.game_id.message}</p>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập mô tả gói (tùy chọn)..."
                />
              </div>

              {/* Premium */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('is_premium')}
                    className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Gói Premium</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Gói premium yêu cầu thanh toán để sử dụng
                </p>
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
                  Gói sẽ hiển thị trong ứng dụng khi được kích hoạt
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
                <span>{mode === 'create' ? 'Tạo gói' : 'Cập nhật'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}