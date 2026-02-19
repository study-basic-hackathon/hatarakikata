'use client'

import { createContext, type ReactNode,useContext } from 'react'

import Spinner from '@/ui/components/basic/Spinner'
import { useSessionQuery } from '@/ui/hooks/auth'
import type { AuthUser } from '@/ui/service/auth'

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isError: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isError: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useSessionQuery()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
