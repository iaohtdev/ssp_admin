import { createClient } from '@supabase/supabase-js'
import { Database, CategoryWithGames, CategoryFormData, Game } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Interface cho dữ liệu trả về từ Supabase join query
interface SupabaseGameData {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

// Helper functions cho database operations
export const supabaseHelpers = {
  // Games
  async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createGame(gameData: Database['public']['Tables']['games']['Insert']) {
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateGame(id: string, gameData: Database['public']['Tables']['games']['Update']) {
    const { data, error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteGame(id: string) {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Categories
  async getCategories(gameId?: string) {
    let query = supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (gameId) {
      query = query.eq('game_id', gameId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async createCategory(categoryData: Database['public']['Tables']['categories']['Insert']) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCategory(id: string, categoryData: Database['public']['Tables']['categories']['Update']) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Packs
  async getPacks(gameId?: string) {
    let query = supabase
      .from('packs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (gameId) {
      query = query.eq('game_id', gameId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async createPack(packData: Database['public']['Tables']['packs']['Insert']) {
    const { data, error } = await supabase
      .from('packs')
      .insert(packData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updatePack(id: string, packData: Database['public']['Tables']['packs']['Update']) {
    const { data, error } = await supabase
      .from('packs')
      .update(packData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deletePack(id: string) {
    const { error } = await supabase
      .from('packs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Questions
  async getQuestions(packId?: string, categoryId?: string) {
    let query = supabase
      .from('questions')
      .select(`
        *,
        packs(name),
        categories(name)
      `)
      .order('created_at', { ascending: false })
    
    if (packId) {
      query = query.eq('pack_id', packId)
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async createQuestion(questionData: Database['public']['Tables']['questions']['Insert']) {
    const { data, error } = await supabase
      .from('questions')
      .insert(questionData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateQuestion(id: string, questionData: Database['public']['Tables']['questions']['Update']) {
    const { data, error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteQuestion(id: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Statistics
  async getStats() {
    const [gamesResult, categoriesResult, packsResult, questionsResult] = await Promise.all([
      supabase.from('games').select('id', { count: 'exact' }),
      supabase.from('categories').select('id', { count: 'exact' }),
      supabase.from('packs').select('id', { count: 'exact' }),
      supabase.from('questions').select('id', { count: 'exact' })
    ])

    return {
      games: gamesResult.count || 0,
      categories: categoriesResult.count || 0,
      packs: packsResult.count || 0,
      questions: questionsResult.count || 0
    }
  },

  // Categories with Games (Many-to-Many)
  async getCategoriesWithGames(): Promise<CategoryWithGames[]> {
    // Lấy tất cả categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (categoriesError) throw categoriesError
    
    // Lấy tất cả game_categories relationships với games
    const { data: gameCategories, error: gameCategoriesError } = await supabase
      .from('game_categories')
      .select(`
        category_id,
        games:game_id (
          id,
          name,
          description,
          is_active,
          created_at
        )
      `)
    
    if (gameCategoriesError) throw gameCategoriesError
    
    // Kết hợp dữ liệu
    const categoriesWithGames: CategoryWithGames[] = categories.map(category => {
      const categoryGameRelations = gameCategories
        ?.filter(gc => gc.category_id === category.id) || []
      
      // Sửa lại: gc.games là object đơn, không phải array
      const categoryGames: Game[] = categoryGameRelations
        .map(gc => {
          const gameData = gc.games as unknown as SupabaseGameData
          if (!gameData) return null
          return {
            id: gameData.id,
            name: gameData.name,
            description: gameData.description || undefined,
            is_active: gameData.is_active,
            created_at: gameData.created_at
          } as Game
        })
        .filter((game): game is Game => game !== null)
      
      return {
        ...category,
        games: categoryGames,
        game_ids: categoryGames.map(game => game.id)
      }
    })
    
    return categoriesWithGames
  },

  async createCategoryWithGames(data: CategoryFormData): Promise<CategoryWithGames> {
    // Tạo category trước
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        is_active: data.is_active
      })
      .select()
      .single()
    
    if (categoryError) throw categoryError
    
    // Tạo relationships với games nếu có
    if (data.game_ids && data.game_ids.length > 0) {
      const gameCategories = data.game_ids.map(gameId => ({
        game_id: gameId,
        category_id: category.id
      }))
      
      const { error: relationError } = await supabase
        .from('game_categories')
        .insert(gameCategories)
      
      if (relationError) throw relationError
    }
    
    // Lấy category với games để trả về
    const { data: gameRelations } = await supabase
      .from('game_categories')
      .select(`
        games:game_id (
          id,
          name,
          description,
          is_active,
          created_at
        )
      `)
      .eq('category_id', category.id)
    
    // Chuyển đổi dữ liệu Supabase thành Game interface
    const categoryGames: Game[] = gameRelations
      ?.map(gr => {
        const gameData = gr.games as unknown as SupabaseGameData
        if (!gameData) return null
        return {
          id: gameData.id,
          name: gameData.name,
          description: gameData.description || undefined,
          is_active: gameData.is_active,
          created_at: gameData.created_at
        } as Game
      })
      .filter((game): game is Game => game !== null) || []
    
    return {
      ...category,
      games: categoryGames,
      game_ids: categoryGames.map(game => game.id)
    } as CategoryWithGames
  },

  async updateCategoryWithGames(categoryId: string, data: CategoryFormData): Promise<CategoryWithGames> {
    // Cập nhật category
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .update({
        name: data.name,
        slug: data.slug,
        is_active: data.is_active
      })
      .eq('id', categoryId)
      .select()
      .single()
    
    if (categoryError) throw categoryError
    
    // Xóa tất cả relationships cũ
    const { error: deleteError } = await supabase
      .from('game_categories')
      .delete()
      .eq('category_id', categoryId)
    
    if (deleteError) throw deleteError
    
    // Tạo relationships mới nếu có
    if (data.game_ids && data.game_ids.length > 0) {
      const gameCategories = data.game_ids.map(gameId => ({
        game_id: gameId,
        category_id: categoryId
      }))
      
      const { error: relationError } = await supabase
        .from('game_categories')
        .insert(gameCategories)
      
      if (relationError) throw relationError
    }
    
    // Lấy category với games để trả về
    const { data: gameRelations } = await supabase
      .from('game_categories')
      .select(`
        games:game_id (
          id,
          name,
          description,
          is_active,
          created_at
        )
      `)
      .eq('category_id', categoryId)
    
    // Chuyển đổi dữ liệu Supabase thành Game interface
    const categoryGames: Game[] = gameRelations
      ?.map(gr => {
        const gameData = gr.games as unknown as SupabaseGameData
        if (!gameData) return null
        return {
          id: gameData.id,
          name: gameData.name,
          description: gameData.description || undefined,
          is_active: gameData.is_active,
          created_at: gameData.created_at
        } as Game
      })
      .filter((game): game is Game => game !== null) || []
    
    return {
      ...category,
      games: categoryGames,
      game_ids: categoryGames.map(game => game.id)
    } as CategoryWithGames
  },

  async deleteCategoryWithGames(categoryId: string): Promise<void> {
    // Xóa tất cả relationships trước
    const { error: relationError } = await supabase
      .from('game_categories')
      .delete()
      .eq('category_id', categoryId)
    
    if (relationError) throw relationError
    
    // Xóa category
    const { error: categoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
    
    if (categoryError) throw categoryError
  },
}