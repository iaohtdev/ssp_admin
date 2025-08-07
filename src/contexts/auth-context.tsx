'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  username: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string, remember?: boolean) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hardcoded credentials
const VALID_CREDENTIALS = {
  username: 'iaoht.dev',
  password: '123123'
}

const AUTH_STORAGE_KEY = 'ssp_admin_auth'
const REMEMBER_STORAGE_KEY = 'ssp_admin_remember'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Step 1: Kiểm tra authentication khi khởi tạo
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
        const rememberMe = localStorage.getItem(REMEMBER_STORAGE_KEY)
        
        if (savedAuth && rememberMe === 'true') {
          const userData = JSON.parse(savedAuth)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem(REMEMBER_STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  /// Đăng nhập với username và password
  const login = async (username: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Step 2: Mô phỏng delay API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 3: Kiểm tra credentials
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        const userData: User = { username }
        setUser(userData)
        
        // Step 4: Lưu thông tin nếu chọn ghi nhớ
        if (remember) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
          localStorage.setItem(REMEMBER_STORAGE_KEY, 'true')
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          localStorage.removeItem(REMEMBER_STORAGE_KEY)
        }
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /// Đăng xuất và xóa thông tin đã lưu
  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(REMEMBER_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}