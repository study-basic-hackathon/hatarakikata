'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormProvider,useForm } from 'react-hook-form'

import Alert from '@/ui/components/basic/Alert'
import Button from '@/ui/components/basic/Button'
import TextField from '@/ui/components/basic/field/TextField'
import { useSignUpMutation } from '@/ui/hooks/auth'
import { type SignUpParameters,SignUpParametersSchema } from '@/ui/service/auth'

const signUpErrorMessages: Record<string, string> = {
  over_email_send_rate_limit: 'メールの送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。',
  user_already_exists: 'このメールアドレスはすでに登録されています。',
  weak_password: 'パスワードが脆弱です。より強力なパスワードを設定してください。',
  validation_failed: '入力内容が正しくありません。確認してください。',
  signup_disabled: '現在、新規登録は受け付けていません。',
  over_request_rate_limit: 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。',
}

function getSignUpErrorMessage(error: Error): string {
  const code = (error.cause as { code?: string })?.code
  if (code && code in signUpErrorMessages) return signUpErrorMessages[code]
  return 'サインアップに失敗しました。入力内容を確認してください。'
}

export default function SignupPage() {
  const router = useRouter()
  const signupMutation = useSignUpMutation()
  const methods = useForm<SignUpParameters>({
    resolver: zodResolver(SignUpParametersSchema),
  })

  const onSubmit = (data: SignUpParameters) => {
    signupMutation.mutate(data, {
      onSuccess: () => router.push('/verify-email'),
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-primary-50">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold">サインアップ</h1>

        {signupMutation.isError && (
          <Alert variant="error">
            {getSignUpErrorMessage(signupMutation.error)}
          </Alert>
        )}

        <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <TextField<SignUpParameters>
            name="email"
            label="メールアドレス"
            type="email"
            autoComplete="email"
            placeholder="メールアドレスを入力"
          />
          <TextField<SignUpParameters>
            name="password"
            label="パスワード"
            type="password"
            autoComplete="new-password"
            placeholder="パスワードを入力"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? '送信中...' : 'サインアップ'}
          </Button>
        </form>
        </FormProvider>

        <p className="text-center text-sm">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="text-primary-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
