import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Este archivo solo debe usarse en Server Components o API routes
// No importar en componentes cliente

export async function createClient() {
  // Verificar que estamos en un contexto de servidor
  if (typeof window !== 'undefined') {
    throw new Error('createClient from lib/supabase/server can only be used in Server Components or API routes')
  }
  
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

