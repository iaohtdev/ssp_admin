'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { ModalPortal } from '@/components/ui/modal-portal'
import { Pack, Category } from '@/types'
import * as XLSX from 'xlsx'

interface QuestionUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (questions: any[]) => Promise<void>
  packs: Pack[]
  categories: Category[]
}

interface UploadResult {
  success: number
  errors: { row: number; message: string }[]
}

export function QuestionUploadModal({
  isOpen,
  onClose,
  onUpload,
  packs,
  categories
}: QuestionUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state khi đóng modal
  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setShowPreview(false)
    setUploadResult(null)
    onClose()
  }

  // Xử lý chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadResult(null)
      parseExcelFile(selectedFile)
    }
  }

  // Parse file Excel
  const parseExcelFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        setPreviewData(jsonData)
        setShowPreview(true)
      } catch (error) {
        console.error('Lỗi khi đọc file Excel:', error)
        alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Validate dữ liệu
  const validateData = (data: any[]): { valid: any[]; errors: { row: number; message: string }[] } => {
    const valid: any[] = []
    const errors: { row: number; message: string }[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 vì Excel bắt đầu từ 1 và có header
      
      // Kiểm tra content (bắt buộc)
      if (!row.content || row.content.toString().trim() === '') {
        errors.push({ row: rowNumber, message: 'Nội dung câu hỏi không được để trống' })
        return
      }

      // Kiểm tra pack_id (nếu có)
      if (row.pack_id && !packs.find(p => p.id === row.pack_id)) {
        errors.push({ row: rowNumber, message: `Pack ID "${row.pack_id}" không tồn tại` })
        return
      }

      // Kiểm tra category_id (nếu có)
      if (row.category_id && !categories.find(c => c.id === row.category_id)) {
        errors.push({ row: rowNumber, message: `Category ID "${row.category_id}" không tồn tại` })
        return
      }

      // Chuẩn hóa dữ liệu
      const validRow = {
        content: row.content.toString().trim(),
        pack_id: row.pack_id || null,
        category_id: row.category_id || null,
        is_active: row.is_active === true || row.is_active === 'true' || row.is_active === 1 || row.is_active === '1'
      }

      valid.push(validRow)
    })

    return { valid, errors }
  }

  // Xử lý upload
  const handleUpload = async () => {
    if (!previewData.length) return

    setIsUploading(true)
    try {
      const { valid, errors } = validateData(previewData)
      
      if (errors.length > 0) {
        setUploadResult({ success: 0, errors })
        return
      }

      await onUpload(valid)
      setUploadResult({ success: valid.length, errors: [] })
      
      // Đóng modal sau 2 giây nếu thành công
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error('Lỗi khi upload:', error)
      setUploadResult({ 
        success: 0, 
        errors: [{ row: 0, message: 'Lỗi hệ thống khi upload dữ liệu' }] 
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Tải file mẫu
  const downloadTemplate = () => {
    const templateData = [
      {
        content: 'Bạn có từng nói dối bạn thân nhất không?',
        pack_id: '',
        category_id: '',
        is_active: true
      },
      {
        content: 'Hãy kể về lần đầu tiên bạn yêu ai đó',
        pack_id: '',
        category_id: '',
        is_active: true
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Questions')
    XLSX.writeFile(wb, 'questions_template.xlsx')
  }

  if (!isOpen) return null

  return (
    <ModalPortal isOpen={isOpen} onClose={handleClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Câu hỏi từ Excel</h2>
              <p className="text-sm text-gray-600">Tải lên danh sách câu hỏi từ file Excel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Hướng dẫn và tải file mẫu */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
            <ul className="text-sm text-blue-800 space-y-1 mb-3">
              <li>• File Excel cần có các cột: content, pack_id, category_id, is_active</li>
              <li>• Cột "content" là bắt buộc, các cột khác có thể để trống</li>
              <li>• pack_id và category_id phải tồn tại trong hệ thống</li>
              <li>• is_active: true/false hoặc 1/0</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Tải file mẫu</span>
            </button>
          </div>

          {/* File upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                {file ? file.name : 'Chọn file Excel để upload'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chọn file
              </button>
            </div>
          </div>

          {/* Preview data */}
          {showPreview && previewData.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">
                Xem trước dữ liệu ({previewData.length} câu hỏi)
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-60">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nội dung</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pack ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kích hoạt</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate" title={row.content}>
                            {row.content}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">{row.pack_id || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{row.category_id || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {row.is_active ? 'Có' : 'Không'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 10 && (
                  <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
                    Và {previewData.length - 10} câu hỏi khác...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload result */}
          {uploadResult && (
            <div className="mb-6">
              {uploadResult.success > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Đã upload thành công {uploadResult.success} câu hỏi!
                    </span>
                  </div>
                </div>
              )}
              
              {uploadResult.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      Có {uploadResult.errors.length} lỗi cần khắc phục:
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        Dòng {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={!showPreview || previewData.length === 0 || isUploading}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang upload...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload {previewData.length} câu hỏi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalPortal>
  )
}