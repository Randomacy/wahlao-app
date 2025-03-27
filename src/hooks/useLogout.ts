// src/hooks/useLogout.ts
'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function useLogout() {
  const router = useRouter()

  return async function logout() {
    await supabase.auth.signOut()
    router.replace('/')
  }
}
