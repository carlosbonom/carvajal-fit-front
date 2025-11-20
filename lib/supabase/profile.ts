import { createClient } from './client'

export interface Profile {
  id: string
  display_name: string | null
  name: string | null
  email: string | null
  prefix: string | null
  phone: string | null
  avatar_url: string | null
  role: 'owner' | 'admin' | 'vendor' | 'user'
  status: 'active' | 'inactive' | 'banned'
  timezone: string
  locale: string
  currency: string
  created_at: string
  updated_at: string
}

/**
 * Obtiene el perfil del usuario actual desde el cliente
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data as Profile
}

// Las funciones del servidor se han movido a profile-server.ts
// para evitar problemas con next/headers en componentes cliente

/**
 * Actualiza el perfil del usuario actual
 */
export async function updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data as Profile
}

