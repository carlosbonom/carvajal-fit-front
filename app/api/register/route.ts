import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export interface RegisterRequest {
  email: string
  password: string
  display_name?: string
  name?: string
  prefix?: string
  phone?: string
  avatar_url?: string
  role?: 'owner' | 'admin' | 'vendor' | 'user'
  status?: 'active' | 'inactive' | 'banned'
  timezone?: string
  locale?: string
  currency?: string
}

export async function POST(request: NextRequest) {
  try {
    // Validar que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

    const body: RegisterRequest = await request.json()

    // Validaciones básicas
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase para API routes
    // Usamos el cliente directo de supabase-js para operaciones de registro
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.name || body.display_name || '',
          display_name: body.display_name || body.name || '',
          phone: body.phone || '',
          prefix: body.prefix || '',
        },
        emailRedirectTo: undefined, // No redirigir email
      },
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return NextResponse.json(
        { 
          error: authError.message || 'Error al crear el usuario',
          code: authError.status || 'UNKNOWN_ERROR'
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      )
    }

    // Esperar un momento para que el trigger cree el perfil automáticamente
    await new Promise(resolve => setTimeout(resolve, 1000))

    // El trigger debería haber creado el perfil automáticamente
    // Intentar actualizar el perfil con los datos adicionales
    const profileUpdate = {
      display_name: body.display_name || body.name || null,
      name: body.name || body.display_name || null,
      prefix: body.prefix || null,
      phone: body.phone || null,
      avatar_url: body.avatar_url || null,
      role: (body.role || 'user') as 'owner' | 'admin' | 'vendor' | 'user',
      status: (body.status || 'active') as 'active' | 'inactive' | 'banned',
      timezone: body.timezone || 'America/Santiago',
      locale: body.locale || 'es-CL',
      currency: body.currency || 'CLP',
    }

    // Intentar actualizar el perfil (el trigger ya lo creó)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', authData.user.id)
      .select()
      .single()

    // Si el perfil no existe aún (el trigger falló), intentar crearlo
    if (updateError && updateError.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...profileUpdate,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return NextResponse.json(
          {
            message: 'Usuario creado exitosamente, pero hubo un error al crear el perfil',
            user: {
              id: authData.user.id,
              email: authData.user.email,
            },
            warning: 'El perfil se creará automáticamente. Por favor, actualiza tu perfil más tarde.',
            error_details: insertError.message,
          },
          { status: 201 }
        )
      }

      return NextResponse.json(
        {
          message: 'Usuario registrado exitosamente',
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          profile: newProfile,
        },
        { status: 201 }
      )
    }

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json(
        {
          message: 'Usuario creado exitosamente, pero hubo un error al actualizar el perfil',
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          warning: 'El perfil se creó con valores por defecto. Por favor, actualiza tu perfil más tarde.',
          error_details: updateError.message,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        profile: updatedProfile,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

