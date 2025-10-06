'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CategoryFormModal } from '@/components/categories/category-form-modal'
import { DeleteCategoryModal } from '@/components/categories/delete-category-modal'
import { CategoryDetailModal } from '@/components/categories/category-detail-modal'
import { supabaseHelpers } from '@/lib/supabase'
import { CategoryWithGames, Game, CategoryFormData } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithGames[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [gameFilter, setGameFilter] = useState<string>('all')
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithGames | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isDeleting, setIsDeleting] = useState(false)
  // Xóa dòng: const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data from Supabase
  useEffect(() => {
    loadData()
  }, [])
  
  // Toast hook
  const toast = useToast()
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load categories with games and games list in parallel
      const [categoriesResult, gamesResult] = await Promise.all([
        supabaseHelpers.getCategoriesWithGames(), // Cần implement function này
        supabaseHelpers.getGames()
      ])
      
      setCategories(categoriesResult)
      setGames(gamesResult)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.is_active) ||
                         (statusFilter === 'inactive' && !category.is_active)
    
    const matchesGame = gameFilter === 'all' || 
                       (category.game_ids && category.game_ids.includes(gameFilter))
    
    return matchesSearch && matchesStatus && matchesGame
  })

  // Handle create category
  const handleCreateCategory = () => {
    setFormMode('create')
    setSelectedCategory(null)
    setIsFormModalOpen(true)
  }

  // Handle edit category
  const handleEditCategory = (category: CategoryWithGames) => {
    setFormMode('edit')
    setSelectedCategory(category)
    setIsFormModalOpen(true)
  }

  // Handle view category
  const handleViewCategory = (category: CategoryWithGames) => {
    setSelectedCategory(category)
    setIsDetailModalOpen(true)
  }

  // Handle delete category
  const handleDeleteCategory = (category: CategoryWithGames) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      // Xóa dòng: setIsSubmitting(true)
      setError(null)
      
      if (formMode === 'create') {
        const newCategory = await supabaseHelpers.createCategoryWithGames(data)
        setCategories(prev => [newCategory, ...prev])
        toast.success('Thành công!', 'Danh mục đã được tạo thành công')
      } else if (selectedCategory) {
        const updatedCategory = await supabaseHelpers.updateCategoryWithGames(selectedCategory.id, data)
        setCategories(prev => prev.map(category => 
          category.id === selectedCategory.id ? updatedCategory : category
        ))
        toast.success('Thành công!', 'Danh mục đã được cập nhật thành công')
      }
      
      setIsFormModalOpen(false)
      setSelectedCategory(null)
    } catch (err) {
      console.error('Lỗi khi lưu danh mục:', err)
      setError('Không thể lưu danh mục. Vui lòng thử lại.')
      toast.error('Lỗi!', 'Không thể lưu danh mục. Vui lòng thử lại.')
    } // Xóa finally block vì không cần thiết
  }


  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return
    
    try {
      setIsDeleting(true)
      setError(null)
      
      await supabaseHelpers.deleteCategoryWithGames(selectedCategory.id)
      setCategories(prev => prev.filter(category => category.id !== selectedCategory.id))
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err)
      setError('Không thể xóa danh mục. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách danh mục...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-600 mt-2">Quản lý các danh mục trong hệ thống</p>
        </div>
        <button 
          onClick={handleCreateCategory}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="filter-select px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trò chơi</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="filter-select px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị {filteredCategories.length} / {categories.length} danh mục
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Trò chơi
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || gameFilter !== 'all'
                      ? 'Không tìm thấy danh mục nào phù hợp'
                      : 'Chưa có danh mục nào'
                    }
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {category.games && category.games.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {category.games.map(game => (
                              <span key={game.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {game.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Chưa gán</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(category.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewCategory(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCategory(category)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        games={games}
        initialData={selectedCategory ? {
          game_ids: selectedCategory.game_ids || [],
          name: selectedCategory.name,
          slug: selectedCategory.slug,
          is_active: selectedCategory.is_active
        } : undefined}
        mode={formMode}
      />

      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={selectedCategory?.name || ''}
        isDeleting={isDeleting}
      />

      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  )
}