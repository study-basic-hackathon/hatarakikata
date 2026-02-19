import { type NextRequest, NextResponse } from 'next/server'

import { createSupabaseServer } from '@/infrastructure/server/supabase/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (tokenHash && type) {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'email_change',
    })

    if (!error) {
      return NextResponse.redirect(new URL('/me/email/confirmed', request.url))
    }
  }

  return NextResponse.redirect(new URL('/me/email?error=confirm_failed', request.url))
}
