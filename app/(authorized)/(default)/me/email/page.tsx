'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEmailMutation } from '@/ui/hooks/auth'
import { UpdateEmailParametersSchema, type UpdateEmailParameters } from '@/ui/service/auth'
import TextField from '@/ui/components/basic/field/TextField'
import Button from '@/ui/components/basic/Button'
import Alert from '@/ui/components/basic/Alert'
import Breadcrumb from '@/ui/components/basic/Breadcrumb'
import Link from 'next/link'

export default function MeEmailPage() {
  const mutation = useUpdateEmailMutation()
  const methods = useForm<UpdateEmailParameters>({
    resolver: zodResolver(UpdateEmailParametersSchema),
  })

  const onSubmit = (data: UpdateEmailParameters) => {
    mutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-foreground/5">
      <div className="max-w-md mx-auto space-y-4 p-4">
        <Breadcrumb items={[
          { label: 'ホーム', href: '/' },
          { label: 'マイページ', href: '/me' },
          { label: 'メールアドレス変更' },
        ]} />

        <div className="text-2xl py-4">
          メールアドレス変更
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
          {mutation.isError && (
            <Alert variant="error">
              メールアドレスの変更に失敗しました。入力内容を確認してください。
            </Alert>
          )}

          {mutation.isSuccess ? (
            <div className="space-y-4">
              <Alert variant="success">
                確認メールを送信しました。新しいメールアドレスに届いたリンクをクリックして変更を完了してください。
              </Alert>
              <Link href="/me" className="block text-center text-sm text-primary-600 hover:underline">
                マイページに戻る
              </Link>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <TextField<UpdateEmailParameters>
                  name="email"
                  label="新しいメールアドレス"
                  type="email"
                  autoComplete="email"
                  placeholder="メールアドレスを入力"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? '変更中...' : '変更する'}
                </Button>
              </form>
            </FormProvider>
          )}
        </div>
      </div>
    </div>
  )
}
