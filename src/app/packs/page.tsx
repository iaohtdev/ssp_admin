'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { supabaseHelpers } from '@/lib/supabase'
import { Pack, Game, PackFormData } from '@/types'
import { PackFormModal } from '@/components/packs/pack-form-modal'
import { DeletePackModal } from '@/components/packs/delete-pack-modal'
import { PackDetailModal } from '@/components/packs/pack-detail-modal'
import { useToast } from '@/hooks/use-toast'

interface PackWithRelations extends Pack {
  games?: { name: string } | null
}

export default function PacksPage() {
  const [packs, setPacks] = useState<PackWithRelations[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [gameFilter, setGameFilter] = useState<string>('all')
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'premium' | 'free'>('all')
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPack, setSelectedPack] = useState<PackWithRelations | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isDeleting, setIsDeleting] = useState(false)
  // Xóa dòng: const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  // Load data from Supabase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load packs and games in parallel
      const [packsResult, gamesResult] = await Promise.all([
        supabaseHelpers.getPacks(),
        supabaseHelpers.getGames()
      ])
      
      // Enhance packs with game information
      const packsWithGames = packsResult.map(pack => ({
        ...pack,
        games: gamesResult.find(game => game.id === pack.game_id) ? 
               { name: gamesResult.find(game => game.id === pack.game_id)!.name } : null
      }))
      
      setPacks(packsWithGames)
      setGames(gamesResult)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Filter packs
  const filteredPacks = packs.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pack.description && pack.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pack.is_active) ||
                         (statusFilter === 'inactive' && !pack.is_active)
    
    const matchesGame = gameFilter === 'all' || pack.game_id === gameFilter
    
    const matchesPremium = premiumFilter === 'all' ||
                          (premiumFilter === 'premium' && pack.is_premium) ||
                          (premiumFilter === 'free' && !pack.is_premium)
    
    return matchesSearch && matchesStatus && matchesGame && matchesPremium
  })

  // Get game name
  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game ? game.name : 'Không xác định'
  }

  // Handle create pack
  const handleCreatePack = () => {
    setFormMode('create')
    setSelectedPack(null)
    setIsFormModalOpen(true)
  }

  // Handle edit pack
  const handleEditPack = (pack: PackWithRelations) => {
    setFormMode('edit')
    setSelectedPack(pack)
    setIsFormModalOpen(true)
  }

  // Handle view pack
  const handleViewPack = (pack: PackWithRelations) => {
    setSelectedPack(pack)
    setIsDetailModalOpen(true)
  }

  // Handle delete pack
  const handleDeletePack = (pack: PackWithRelations) => {
    setSelectedPack(pack)
    setIsDeleteModalOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: PackFormData) => {
    try {
      // Xóa dòng: setIsSubmitting(true)
      setError(null)
      
      if (formMode === 'create') {
        const newPack = await supabaseHelpers.createPack(data)
        const packWithGame = {
          ...newPack,
          games: games.find(game => game.id === newPack.game_id) ? 
                 { name: games.find(game => game.id === newPack.game_id)!.name } : null
        }
        setPacks(prev => [packWithGame, ...prev])
        toast.success('Thành công!', 'Gói đã được tạo thành công')
      } else if (selectedPack) {
        const updatedPack = await supabaseHelpers.updatePack(selectedPack.id, data)
        const packWithGame = {
          ...updatedPack,
          games: games.find(game => game.id === updatedPack.game_id) ? 
                 { name: games.find(game => game.id === updatedPack.game_id)!.name } : null
        }
        setPacks(prev => prev.map(pack => 
          pack.id === selectedPack.id ? packWithGame : pack
        ))
        toast.success('Thành công!', 'Gói đã được cập nhật thành công')
      }
      
      setIsFormModalOpen(false)
      setSelectedPack(null)
    } catch (err) {
      console.error('Lỗi khi lưu gói:', err)
      setError('Không thể lưu gói. Vui lòng thử lại.')
      toast.error('Lỗi!', 'Không thể lưu gói. Vui lòng thử lại.')
    } // Xóa finally block vì không cần thiết
  }

  // Handle delete pack
  const handleDeleteConfirm = async () => {
    if (!selectedPack) return
    
    try {
      await supabaseHelpers.deletePack(selectedPack.id)
      setPacks(prev => prev.filter(p => p.id !== selectedPack.id))
      setIsDeleteModalOpen(false)
      setSelectedPack(null)
      toast.success('Thành công!', 'Gói đã được xóa thành công')
    } catch (err) {
      console.error('Lỗi khi xóa gói:', err)
      toast.error('Lỗi!', 'Không thể xóa gói. Vui lòng thử lại.')
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedPack) return
    
    try {
      setIsDeleting(true)
      setError(null)
      
      await supabaseHelpers.deletePack(selectedPack.id)
      setPacks(prev => prev.filter(pack => pack.id !== selectedPack.id))
      setIsDeleteModalOpen(false)
      setSelectedPack(null)
    } catch (err) {
      console.error('Lỗi khi xóa gói:', err)
      setError('Không thể xóa gói. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách gói...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Gói</h1>
          <p className="text-gray-600 mt-2">Quản lý các gói nội dung trong hệ thống</p>
        </div>
        <button 
          onClick={handleCreatePack}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm gói
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <input
                type="text"
                placeholder="Tìm kiếm gói..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Game Filter */}
            <div>
              <select 
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="filter-select w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trò chơi</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>
            
            {/* Premium Filter */}
            <div>
              <select 
                value={premiumFilter}
                onChange={(e) => setPremiumFilter(e.target.value as 'all' | 'premium' | 'free')}
                className="filter-select w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả loại</option>
                <option value="premium">Premium</option>
                <option value="free">Miễn phí</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="filter-select w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị {filteredPacks.length} / {packs.length} gói
          </div>
        </div>
      </div>

      {/* Packs Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Tên gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Trò chơi
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Loại
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
              {filteredPacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || gameFilter !== 'all' || premiumFilter !== 'all'
                      ? 'Không tìm thấy gói nào phù hợp'
                      : 'Chưa có gói nào'
                    }
                  </td>
                </tr>
              ) : (
                filteredPacks.map((pack) => (
                  <tr key={pack.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {pack.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {pack.games?.name || getGameName(pack.game_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={pack.description || ''}>
                        {pack.description || <span className="text-gray-400 text-xs">Chưa có mô tả</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pack.is_premium 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pack.is_premium ? 'Premium' : 'Miễn phí'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        pack.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pack.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pack.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewPack(pack)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditPack(pack)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePack(pack)}
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
      <PackFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedPack}
        mode={formMode}
        games={games}
      />

      <DeletePackModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        packName={selectedPack?.name || ''}
        isDeleting={isDeleting}
      />

      <PackDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        pack={selectedPack}
        games={games}
      />
    </div>
  )
}