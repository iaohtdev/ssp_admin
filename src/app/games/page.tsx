'use client'

import { useState, useEffect } from 'react'
import { supabaseHelpers } from '@/lib/supabase'
import { Plus, Edit, Trash2, Eye, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { GameFormModal } from '@/components/games/game-form-modal'
import { DeleteGameModal } from '@/components/games/delete-game-modal'
import { GameDetailModal } from '@/components/games/game-detail-modal'
import { Game, GameFormData } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isDeleting, setIsDeleting] = useState(false)
  // Xóa dòng: const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadGames()
  }, [])

  // Step 1: Load games from Supabase
  const loadGames = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseHelpers.getGames()
      setGames(data)
    } catch (err) {
      console.error('Error loading games:', err)
      setError('Không thể tải danh sách trò chơi')
    } finally {
      setLoading(false)
    }
  }

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && game.is_active) ||
                         (statusFilter === 'inactive' && !game.is_active)
    
    return matchesSearch && matchesStatus
  })

  // Handle create game
  const handleCreateGame = () => {
    setFormMode('create')
    setSelectedGame(null)
    setIsFormModalOpen(true)
  }

  // Handle edit game
  const handleEditGame = (game: Game) => {
    setFormMode('edit')
    setSelectedGame(game)
    setIsFormModalOpen(true)
  }

  // Handle view game
  const handleViewGame = (game: Game) => {
    setSelectedGame(game)
    setIsDetailModalOpen(true)
  }

  // Handle delete game
  const handleDeleteGame = (game: Game) => {
    setSelectedGame(game)
    setIsDeleteModalOpen(true)
  }

  // Step 2: Handle form submit with Supabase
  const handleFormSubmit = async (data: GameFormData) => {
    try {
      // Xóa dòng: setIsSubmitting(true)
      
      if (formMode === 'create') {
        const newGame = await supabaseHelpers.createGame({
          name: data.name,
          description: data.description,
          is_active: data.is_active ?? true
        })
        setGames(prev => [newGame, ...prev])
        toast.success('Thành công!', 'Trò chơi đã được tạo thành công')
      } else if (selectedGame) {
        const updatedGame = await supabaseHelpers.updateGame(selectedGame.id, {
          name: data.name,
          description: data.description,
          is_active: data.is_active
        })
        setGames(prev => prev.map(game => 
          game.id === selectedGame.id ? updatedGame : game
        ))
        toast.success('Thành công!', 'Trò chơi đã được cập nhật thành công')
      }
      
      setIsFormModalOpen(false)
      setSelectedGame(null)
    } catch (err) {
      console.error('Error saving game:', err)
      setError('Không thể lưu trò chơi')
      toast.error('Lỗi!', 'Không thể lưu trò chơi. Vui lòng thử lại.')
    } // Xóa finally block vì không cần thiết
  }

  // Step 5: Handle confirm delete with Supabase
  const handleConfirmDelete = async () => {
    if (!selectedGame) return
    
    try {
      setIsDeleting(true)
      await supabaseHelpers.deleteGame(selectedGame.id)
      setGames(prev => prev.filter(game => game.id !== selectedGame.id))
      setIsDeleteModalOpen(false)
      setSelectedGame(null)
    } catch (err) {
      console.error('Error deleting game:', err)
      setError('Không thể xóa trò chơi')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách trò chơi...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Trò chơi</h1>
          <p className="text-gray-600 mt-2">Quản lý các trò chơi trong hệ thống</p>
        </div>
        <button 
          onClick={handleCreateGame}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm trò chơi
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm trò chơi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị {filteredGames.length} / {games.length} trò chơi
          </div>
        </div>
      </div>

      {/* Games Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên trò chơi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Không tìm thấy trò chơi nào phù hợp'
                      : 'Chưa có trò chơi nào'
                    }
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{game.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {game.description || 'Không có mô tả'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        game.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {game.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(game.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewGame(game)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditGame(game)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game)}
                          className="text-red-600 hover:text-red-900"
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
      <GameFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={selectedGame ? {
          name: selectedGame.name,
          description: selectedGame.description,
          is_active: selectedGame.is_active
        } : undefined}
      />

      <DeleteGameModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        gameName={selectedGame?.name || ''}
        isDeleting={isDeleting}
      />

      <GameDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        game={selectedGame}
      />
    </div>
  )
}