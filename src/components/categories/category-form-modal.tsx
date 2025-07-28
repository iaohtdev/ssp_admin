'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, Save, FolderPlus } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { CategoryFormData } from '@/types'

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  game_ids: z.array(z.string()).min(1, 'Phải chọn ít nhất một trò chơi'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  is_active: z.boolean()
})

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => void
  initialData?: CategoryFormData
  mode: 'create' | 'edit'
  games?: { id: string; name: string }[]
}

export function CategoryFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode,
  games = []
}: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      game_ids: [],
      slug: '',
      is_active: true
    }
  })

  const watchName = watch('name')

  // Auto generate slug from name
  useEffect(() => {
    if (watchName && mode === 'create') {
      const slug = watchName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug, { shouldDirty: true })
    }
  }, [watchName, setValue, mode])

  useEffect(() => {
    if (isOpen && initialData) {
      const gameIds = initialData.game_ids || []
      setSelectedGameIds(gameIds)
      reset({
        name: initialData.name || '',
        game_ids: gameIds,
        slug: initialData.slug || '',
        is_active: initialData.is_active ?? true
      })
    } else if (isOpen) {
      setSelectedGameIds([])
      reset({
        name: '',
        game_ids: [],
        slug: '',
        is_active: true
      })
    }
  }, [isOpen, initialData, reset])

  const handleGameToggle = (gameId: string) => {
    const newSelectedGameIds = selectedGameIds.includes(gameId)
      ? selectedGameIds.filter(id => id !== gameId)
      : [...selectedGameIds, gameId]
    
    setSelectedGameIds(newSelectedGameIds)
    setValue('game_ids', newSelectedGameIds, { shouldDirty: true })
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    setSubmitSuccess(false)
    
    try {
      await onSubmit({ ...data, game_ids: selectedGameIds })
      
      // Show success state briefly
      setSubmitSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      onClose()
      reset()
      setSelectedGameIds([])
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error)
    } finally {
      setIsSubmitting(false)
      setSubmitSuccess(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      reset()
      setSelectedGameIds([])
    }
  }

  if (!isOpen) return null

  return (
    <ModalPortal isOpen={isOpen} onClose={handleClose}>
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với loading indicator */}
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
                <FolderPlus className="w-4 h-4 text-gray-600" />
              ) : (
                <Save className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
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

        {/* Form với scroll và overlay */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Loading overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {mode === 'create' ? 'Đang tạo danh mục...' : 'Đang cập nhật...'}
                </p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
            <div className="space-y-5">
              {/* Tên danh mục */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Nhập tên danh mục"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center animate-fadeIn">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Trò chơi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trò chơi <span className="text-red-500">*</span>
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {games.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-2">Không có trò chơi nào</p>
                  ) : (
                    games.map(game => (
                      <label key={game.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-md transition-colors duration-150 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedGameIds.includes(game.id)}
                          onChange={() => handleGameToggle(game.id)}
                          disabled={isSubmitting}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-900 font-medium">{game.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {errors.game_ids && (
                  <p className="text-red-500 text-sm mt-1 flex items-center animate-fadeIn">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.game_ids.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('slug')}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="slug-danh-muc"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1 flex items-center animate-fadeIn">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Trạng thái */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Kích hoạt danh mục</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 font-medium min-w-[120px] flex items-center justify-center ${
                  submitSuccess 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {mode === 'create' ? 'Đang tạo...' : 'Đang lưu...'}
                  </>
                ) : submitSuccess ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Thành công!
                  </>
                ) : (
                  mode === 'create' ? 'Tạo mới' : 'Cập nhật'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  )
}