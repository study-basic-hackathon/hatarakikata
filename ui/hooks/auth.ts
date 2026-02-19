'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getSession,
  resetPassword,
  type ResetPasswordParametersInput,
  signIn,
  type SignInParametersInput,
  signOut,
  signUp,
  type SignUpParametersInput,
  updateEmail,
  type UpdateEmailParametersInput,
  updateName,
  type UpdateNameParametersInput,
  updatePassword,
  type UpdatePasswordParametersInput,
} from '@/ui/service/auth'

export const SESSION_QUERY_KEY = ['auth', 'session'] as const

export function useSessionQuery() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const result = await getSession()
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    retry: false,
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SignInParametersInput) => {
      const result = await signIn(input)
      if (!result.success) throw new Error(result.error.message, { cause: result.error.cause })
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
    },
  })
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: async (input: SignUpParametersInput) => {
      const result = await signUp(input)
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useSignOutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const result = await signOut()
      if (!result.success) throw new Error(result.error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (input: ResetPasswordParametersInput) => {
      const result = await resetPassword(input)
      if (!result.success) throw new Error(result.error.message)
    },
  })
}

export function useUpdateEmailMutation() {
  return useMutation({
    mutationFn: async (input: UpdateEmailParametersInput) => {
      const result = await updateEmail(input)
      if (!result.success) throw new Error(result.error.message)
    },
  })
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: async (input: UpdatePasswordParametersInput) => {
      const result = await updatePassword(input)
      if (!result.success) throw new Error(result.error.message)
    },
  })
}

export function useUpdateNameMutation() {
  return useMutation({
    mutationFn: async (input: UpdateNameParametersInput) => {
      const result = await updateName(input)
      if (!result.success) throw new Error(result.error.message)
    },
  })
}
