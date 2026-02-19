'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormProvider,useForm } from 'react-hook-form'

import Alert from '@/ui/components/basic/Alert'
import Button from '@/ui/components/basic/Button'
import TextField from '@/ui/components/basic/field/TextField'
import { useSignInMutation } from '@/ui/hooks/auth'
import { type SignInParameters,SignInParametersSchema } from '@/ui/service/auth'

export default function LoginPage() {
  const router = useRouter()
  const loginMutation = useSignInMutation()
  const methods = useForm<SignInParameters>({
    resolver: zodResolver(SignInParametersSchema),
  })

  const onSubmit = (data: SignInParameters) => {
    loginMutation.mutate(data, {
      onSuccess: () => router.push('/'),
      onError: (error) => {
        if ((error.cause as { code?: string })?.code === 'email_not_confirmed') {
          router.push('/verify-email')
        }
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-foreground/5">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-3xl font-bold">ハタラキカタ</div>
        <h1 className="text-center text-2xl font-bold">ログイン</h1>

        {loginMutation.isError && (
          <Alert variant="error">
            ログインに失敗しました。メールアドレスとパスワードを確認してください。
          </Alert>
        )}

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <TextField<SignInParameters>
              name="email"
              label="メールアドレス"
              type="email"
              autoComplete="email"
              placeholder="メールアドレスを入力"
            />
            <TextField<SignInParameters>
              name="password"
              label="パスワード"
              type="password"
              autoComplete="current-password"
              placeholder="パスワードを入力"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </FormProvider>

        <div className="space-y-2 text-center text-sm">
          <p>
            <Link href="/forgot" className="text-primary-600 hover:underline">
              パスワードをお忘れですか？
            </Link>
          </p>
          <p>
            <span>アカウントをお持ちでないですか？</span>
            <Link href="/signup" className="text-primary-600 hover:underline">
              サインアップ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
