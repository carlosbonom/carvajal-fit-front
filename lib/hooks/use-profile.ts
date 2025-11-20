"use client"

import { useEffect, useState } from "react"
import { getProfile, type Profile } from "@/lib/supabase/profile"
import { createClient } from "@/lib/supabase/client"

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const userProfile = await getProfile()
      setProfile(userProfile)
      setLoading(false)
    }

    fetchProfile()

    // Escuchar cambios en la autenticación para actualizar el perfil
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userProfile = await getProfile()
        setProfile(userProfile)
        setLoading(false)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { profile, loading }
}

