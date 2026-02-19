'use client'

import Link from 'next/link'

import Alert from '@/ui/components/basic/Alert'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold">メールアドレスの確認</h1>

        <Alert variant="info">
          確認メールを送信しました。メールに記載されたリンクをクリックして、メールアドレスを確認してください。
        </Alert>

        <p className="text-center text-sm text-foreground/60">
          メールが届かない場合は、迷惑メールフォルダを確認してください。
        </p>

        <p className="text-center text-sm">
          <Link href="/login" className="text-primary-600 hover:underline">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
