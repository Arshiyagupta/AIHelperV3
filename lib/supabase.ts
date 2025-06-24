import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { NotificationService } from './notifications'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ EXPO_PUBLIC_SUPABASE_URL is not properly configured. Please update your .env file with your actual Supabase project URL.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ EXPO_PUBLIC_SUPABASE_ANON_KEY is not properly configured. Please update your .env file with your actual Supabase anonymous key.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper function to generate invite codes
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const prefix = 'SAFE-'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix + code
}

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    // Generate invite code before creating the user
    const inviteCode = generateInviteCode()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invite_code: inviteCode,
        },
      },
    })

    if (authError) throw authError

    if (authData.user) {
      // Return the generated invite code directly
      return { user: authData.user, inviteCode: inviteCode }
    }

    throw new Error('User creation failed')
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export const signOut = async () => {
  try {
    // Remove push token before signing out
    await NotificationService.removePushToken()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get user profile error:', error)
    throw error
  }
}

export const connectPartner = async (partnerInviteCode: string) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    // Call the connect-partner Edge Function
    const { data, error } = await supabase.functions.invoke('connect-partner', {
      body: {
        currentUserId: currentUser.id,
        partnerInviteCode: partnerInviteCode.trim().toUpperCase()
      }
    })

    if (error) {
      console.error('Edge function error:', error)
      throw new Error(error.message || 'Failed to connect with partner')
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to connect with partner')
    }

    return data.partner
  } catch (error) {
    console.error('Connect partner error:', error)
    throw error
  }
}