import type { Profile } from './profile'

/**
 * Obtiene el perfil del usuario actual desde el servidor
 * IMPORTANTE: Solo usar en Server Components o API routes
 */
export async function getProfileServer(): Promise<Profile | null> {
  // Importación dinámica para evitar que Next.js evalúe next/headers en componentes cliente
  const { createClient } = await import('./server')
  const supabase = await createClient()
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

