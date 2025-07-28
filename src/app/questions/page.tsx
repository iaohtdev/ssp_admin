'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye, Upload } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { supabaseHelpers } from '@/lib/supabase'
import { Question, Pack, Category } from '@/types'
import { QuestionFormModal } from '@/components/questions/question-form-modal'
import { DeleteQuestionModal } from '@/components/questions/delete-question-modal'
import { QuestionDetailModal } from '@/components/questions/question-detail-modal'
import { QuestionUploadModal } from '@/components/questions/question-upload-modal'

import { useToast } from '@/hooks/use-toast'

interface QuestionFormData {
  content: string
  pack_id?: string | null
  category_id?: string | null
  is_active: boolean
}

interface QuestionWithRelations extends Question {
  packs?: { name: string } | null
  categories?: { name: string } | null
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithRelations[]>([])
  const [packs, setPacks] = useState<Pack[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [packFilter, setPackFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Toast hook
  const toast = useToast()
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithRelations | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [isDeleting, setIsDeleting] = useState(false)
  // Xóa dòng: const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data from Supabase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load questions, packs, and categories in parallel
      const [questionsResult, packsResult, categoriesResult] = await Promise.all([
        supabaseHelpers.getQuestions(),
        supabaseHelpers.getPacks(),
        supabaseHelpers.getCategories()
      ])
      
      setQuestions(questionsResult)
      setPacks(packsResult)
      setCategories(categoriesResult)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Filter questions
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && question.is_active) ||
                         (statusFilter === 'inactive' && !question.is_active)
    
    const matchesPack = packFilter === 'all' || question.pack_id === packFilter
    
    const matchesCategory = categoryFilter === 'all' || question.category_id === categoryFilter
    
    return matchesSearch && matchesStatus && matchesPack && matchesCategory
  })

  // Get pack name
  const getPackName = (packId: string | null | undefined) => {
    if (!packId) return 'Chưa gán'
    const pack = packs.find(p => p.id === packId)
    return pack ? pack.name : 'Không xác định'
  }

  // Get category name
  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Chưa gán'
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Không xác định'
  }

  // Handle create question
  const handleCreateQuestion = () => {
    setFormMode('create')
    setSelectedQuestion(null)
    setIsFormModalOpen(true)
  }

  // Handle edit question
  const handleEditQuestion = (question: QuestionWithRelations) => {
    setFormMode('edit')
    setSelectedQuestion(question)
    setIsFormModalOpen(true)
  }

  // Handle view question
  const handleViewQuestion = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setIsDetailModalOpen(true)
  }

  // Handle delete question
  const handleDeleteQuestion = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setIsDeleteModalOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: QuestionFormData) => {
    try {
      setError(null)
      
      // Xử lý dữ liệu: chuyển chuỗi rỗng thành null cho foreign keys và thêm likes/dislikes
      const processedData = {
        ...data,
        pack_id: data.pack_id === '' ? null : data.pack_id,
        category_id: data.category_id === '' ? null : data.category_id,
        likes: 0,
        dislikes: 0
      }
      
      if (formMode === 'create') {
        const newQuestion = await supabaseHelpers.createQuestion(processedData)
        setQuestions(prev => [newQuestion, ...prev])
        toast.success('Thành công!', 'Câu hỏi đã được tạo thành công')
      } else if (selectedQuestion) {
        // Khi update, không cần thêm likes/dislikes vì đã có sẵn
        const updateData = {
          ...data,
          pack_id: data.pack_id === '' ? null : data.pack_id,
          category_id: data.category_id === '' ? null : data.category_id
        }
        const updatedQuestion = await supabaseHelpers.updateQuestion(selectedQuestion.id, updateData)
        setQuestions(prev => prev.map(question => 
          question.id === selectedQuestion.id ? updatedQuestion : question
        ))
        toast.success('Thành công!', 'Câu hỏi đã được cập nhật thành công')
      }
      
      setIsFormModalOpen(false)
      setSelectedQuestion(null)
    } catch (err) {
      console.error('Lỗi khi lưu câu hỏi:', err)
      setError('Không thể lưu câu hỏi. Vui lòng thử lại.')
      toast.error('Lỗi!', 'Không thể lưu câu hỏi. Vui lòng thử lại.')
    }
  }

  // Handle delete question
  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return
    
    try {
      setIsDeleting(true)
      await supabaseHelpers.deleteQuestion(selectedQuestion.id)
      setQuestions(prev => prev.filter(q => q.id !== selectedQuestion.id))
      setIsDeleteModalOpen(false)
      setSelectedQuestion(null)
      toast.success('Thành công!', 'Câu hỏi đã được xóa thành công')
    } catch (err) {
      console.error('Lỗi khi xóa câu hỏi:', err)
      toast.error('Lỗi!', 'Không thể xóa câu hỏi. Vui lòng thử lại.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle upload questions
  const handleUploadQuestions = async (questionsData: QuestionFormData[]): Promise<void> => {
    try {
      const results: QuestionWithRelations[] = []
      for (const questionData of questionsData) {
        // Thêm likes và dislikes vào questionData
        const processedQuestionData = {
          ...questionData,
          likes: 0,
          dislikes: 0
        }
        const newQuestion = await supabaseHelpers.createQuestion(processedQuestionData)
        results.push(newQuestion)
      }
      
      setQuestions(prev => [...results, ...prev])
      toast.success('Thành công!', `Đã tải lên ${results.length} câu hỏi thành công`)
    } catch (err) {
      console.error('Lỗi khi tải lên câu hỏi:', err)
      toast.error('Lỗi!', 'Không thể tải lên câu hỏi. Vui lòng thử lại.')
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách câu hỏi...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Câu hỏi</h1>
          <p className="text-gray-600 mt-2">Quản lý các câu hỏi trong hệ thống</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
          </button>
          <button 
            onClick={handleCreateQuestion}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Pack Filter */}
            <div>
              <select 
                value={packFilter}
                onChange={(e) => setPackFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả gói</option>
                {packs.map(pack => (
                  <option key={pack.id} value={pack.id}>{pack.name}</option>
                ))}
              </select>
            </div>
            
            {/* Category Filter */}
            <div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị {filteredQuestions.length} / {questions.length} câu hỏi
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tương tác
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
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || packFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Không tìm thấy câu hỏi nào phù hợp'
                      : 'Chưa có câu hỏi nào'
                    }
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={question.content}>
                        {question.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {question.packs?.name || getPackName(question.pack_id) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {question.packs?.name || getPackName(question.pack_id)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Chưa chọn gói</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {question.categories?.name || getCategoryName(question.category_id) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {question.categories?.name || getCategoryName(question.category_id)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Chưa chọn danh mục</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="text-green-600">👍</span>
                          <span className="ml-1">{question.likes || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-red-600">👎</span>
                          <span className="ml-1">{question.dislikes || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        question.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(question.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewQuestion(question)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditQuestion(question)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(question)}
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
      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        packs={packs}
        categories={categories}
        initialData={selectedQuestion}
        mode={formMode}
      />

      <DeleteQuestionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        questionContent={selectedQuestion?.content || ''}
        isDeleting={isDeleting}
      />

      <QuestionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        question={selectedQuestion}
      />

      <QuestionUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadQuestions}
        packs={packs}
        categories={categories}
      />
    </div>
  )
}