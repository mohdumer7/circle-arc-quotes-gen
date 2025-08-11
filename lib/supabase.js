import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database initialization function
export const initializeDatabase = async () => {
  try {
    // Check if tables exist by trying to fetch from them
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}