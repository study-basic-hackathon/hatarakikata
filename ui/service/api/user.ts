import { User } from '@/core/domain'

import { apiFetch } from './client'

export function fetchCurrentUser(): Promise<User> {
  return apiFetch<User>('/api/me')
}

export function initializeUser(): Promise<User> {
  return apiFetch<User>('/api/me/initialize', {
    method: 'POST',
  })
}

export function updateCurrentUser(data: { name?: string }): Promise<User> {
  return apiFetch<User>('/api/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteCurrentUser(): Promise<void> {
  return apiFetch<void>('/api/me', {
    method: 'DELETE',
  })
}
