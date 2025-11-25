'use client'

import { useEffect, useRef } from 'react'
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '@/lib/auth-utils'
import { refreshToken as refreshTokenService } from '@/services/auth'

const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutos en milisegundos

export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const refreshAccessToken = async () => {
      const refresh = getRefreshToken()
      const access = getAccessToken()

      // Solo hacer refresh si tenemos ambos tokens
      if (!refresh || !access) {
        return
      }

      try {
        const response = await refreshTokenService(refresh)
        saveTokens(response.accessToken, response.refreshToken)
        console.log('Token refrescado automáticamente')
      } catch (error) {
        console.error('Error al refrescar token automáticamente:', error)
        // Si el refresh falla, limpiar tokens
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }

    // Verificar si hay tokens al montar el componente
    const hasTokens = getAccessToken() && getRefreshToken()
    
    if (hasTokens) {
      // Ejecutar refresh inmediatamente si hay tokens
      refreshAccessToken()
      
      // Configurar intervalo para refresh cada 15 minutos
      intervalRef.current = setInterval(() => {
        refreshAccessToken()
      }, REFRESH_INTERVAL)
    }

    // Limpiar intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return null
}

