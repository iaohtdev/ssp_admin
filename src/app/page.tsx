'use client'

import { useState, useEffect } from 'react'
import { supabaseHelpers } from '@/lib/supabase'
import { Gamepad2, FolderOpen, Package, MessageCircleQuestion } from 'lucide-react'
import { Game, Question } from '@/types'

export default function Dashboard() {
  const [stats, setStats] = useState({
    games: 0,
    categories: 0,
    packs: 0,
    questions: 0
  })
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [popularQuestions, setPopularQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Step 1: Load statistics
      const statsData = await supabaseHelpers.getStats()
      setStats(statsData)
      
      // Step 2: Load recent games
      const gamesData = await supabaseHelpers.getGames()
      setRecentGames(gamesData.slice(0, 3))
      
      // Step 3: Load popular questions
      const questionsData = await supabaseHelpers.getQuestions()
      const sortedQuestions = questionsData
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3)
      setPopularQuestions(sortedQuestions)
      
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Trò chơi',
      value: stats.games,
      icon: Gamepad2,
      color: 'bg-blue-500'
    },
    {
      title: 'Danh mục',
      value: stats.categories,
      icon: FolderOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Gói nội dung',
      value: stats.packs,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Câu hỏi',
      value: stats.questions,
      icon: MessageCircleQuestion,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Tổng quan về hệ thống quản lý Ét Ô Ét</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Games */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Trò chơi gần đây</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{game.name}</p>
                    <p className="text-sm text-gray-500">{game.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    game.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {game.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Câu hỏi phổ biến</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularQuestions.map((question) => (
                <div key={question.id} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 line-clamp-2">{question.content}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        👍 {question.likes}
                      </span>
                      <span className="text-xs text-gray-500">
                        👎 {question.dislikes}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full ml-2 bg-blue-100 text-blue-800">
                    Câu hỏi
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
