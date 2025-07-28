// Interface cho bảng games
export interface Game {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

// Interface cho bảng categories (bỏ game_id)
export interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
}

// Interface cho bảng game_categories (many-to-many)
export interface GameCategory {
  id: string
  game_id: string
  category_id: string
  created_at: string
}

// Interface mở rộng cho Category với thông tin games
export interface CategoryWithGames extends Category {
  games?: Game[]
  game_ids?: string[]
}

// Interface cho bảng packs
export interface Pack {
  id: string
  game_id: string
  name: string
  description?: string
  is_premium: boolean
  is_active: boolean
  created_at: string
}

// Interface cho bảng questions
export interface Question {
  id: string
  pack_id?: string | null
  category_id?: string | null
  content: string
  likes: number
  dislikes: number
  is_active: boolean
  created_at: string
}

// Form data interfaces
export interface GameFormData {
  name: string
  description?: string
  is_active?: boolean
}

// Cập nhật CategoryFormData để hỗ trợ multiple games
export interface CategoryFormData {
  name: string
  slug: string
  game_ids: string[]  // Thay đổi từ game_id thành game_ids array
  is_active: boolean
}

export interface PackFormData {
  name: string
  description?: string
  game_id: string
  is_premium: boolean
  is_active: boolean
}

export interface QuestionFormData {
  content: string
  pack_id?: string
  category_id?: string
  is_active?: boolean
}

// Utility types
export type FormMode = 'create' | 'edit'
export type StatusFilter = 'all' | 'active' | 'inactive'

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at'>
        Update: Partial<Omit<Game, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      game_categories: {
        Row: GameCategory
        Insert: Omit<GameCategory, 'id' | 'created_at'>
        Update: Partial<Omit<GameCategory, 'id' | 'created_at'>>
      }
      packs: {
        Row: Pack
        Insert: Omit<Pack, 'id' | 'created_at'>
        Update: Partial<Omit<Pack, 'id' | 'created_at'>>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id' | 'created_at'>
        Update: Partial<Omit<Question, 'id' | 'created_at'>>
      }
    }
  }
}