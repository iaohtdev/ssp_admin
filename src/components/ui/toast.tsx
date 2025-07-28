'use client'

import React, { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Toast as ToastType, useToast } from '@/contexts/toast-context'

interface ToastProps {
  toast: ToastType
}

function ToastItem({ toast }: ToastProps) {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => removeToast(toast.id), 300)
  }

  const getToastStyles = () => {
    const baseStyles = 'flex items-start p-4 rounded-lg shadow-lg border max-w-sm w-full'
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`
    }
  }

  const getIcon = () => {
    const iconClass = 'w-5 h-5 mt-0.5 flex-shrink-0'
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />
      default:
        return <Info className={`${iconClass} text-gray-500`} />
    }
  }

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={getToastStyles()}>
        {getIcon()}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}