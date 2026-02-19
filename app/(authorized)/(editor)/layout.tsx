'use client'

import { PropsWithChildren } from 'react'

import GlobalHeader from '@/ui/components/domain/GlobalNavigation'

export default function EditorLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-full h-full absolute top-0 left-0 grid grid-rows-[auto_1fr] grid-cols-1">
      <GlobalHeader maxWidth='full' />
      <div className="min-h-0">
        {children}
      </div>
    </div>
  )
}
