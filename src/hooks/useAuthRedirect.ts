'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function useAuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const isDashboard = pathname.startsWith('/dashboard')
      const isSignin = pathname === '/signin'

      if (!user && isDashboard) {
        router.replace('/signin')
      } else if (user && isSignin) {
        router.replace('/dashboard')
      }
    }

    check()
  }, [pathname, router])
}
