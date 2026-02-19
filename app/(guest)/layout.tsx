'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode,useEffect } from 'react'

import Spinner from '@/ui/components/basic/Spinner'
import { useAuth } from '@/ui/providers/AuthProvider'

export default function GuestLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}
