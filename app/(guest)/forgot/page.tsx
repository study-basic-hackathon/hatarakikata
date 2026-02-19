'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { FormProvider,useForm } from 'react-hook-form'

import Alert from '@/ui/components/basic/Alert'
import Button from '@/ui/components/basic/Button'
import TextField from '@/ui/components/basic/field/TextField'
import { useResetPasswordMutation } from '@/ui/hooks/auth'
import { type ResetPasswordParameters,ResetPasswordParametersSchema } from '@/ui/service/auth'

export default function ForgotPage() {
  const resetPasswordMutation = useResetPasswordMutation()
  const methods = useForm<ResetPasswordParameters>({
    resolver: zodResolver(ResetPasswordParametersSchema),
  })

  const onSubmit = (data: ResetPasswordParameters) => {
    resetPasswordMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold">パスワードリセット</h1>

        {resetPasswordMutation.isSuccess && (
          <Alert variant="success">
            パスワードリセットのメールを送信しました。メールを確認してください。
          </Alert>
        )}

        {resetPasswordMutation.isError && (
          <Alert variant="error">
            送信に失敗しました。メールアドレスを確認してください。
          </Alert>
        )}

        <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <TextField<ResetPasswordParameters>
            name="email"
            label="メールアドレス"
            type="email"
            autoComplete="email"
            placeholder="登録済みのメールアドレスを入力"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? '送信中...' : 'リセットメールを送信'}
          </Button>
        </form>
        </FormProvider>

        <p className="text-center text-sm">
          <Link href="/login" className="text-primary-600 hover:underline">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
