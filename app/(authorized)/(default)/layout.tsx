'use client'

import { PropsWithChildren } from 'react'

import GlobalHeader from '@/ui/components/domain/GlobalNavigation'

export default function DefaultLayout({ children }: PropsWithChildren) {
  return (
    <>
      <GlobalHeader />
      {children}
    </>
  )
}
