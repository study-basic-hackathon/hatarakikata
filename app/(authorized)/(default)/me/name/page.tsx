'use client'

import { useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCurrentUserQuery, useUpdateCurrentUserMutation, CURRENT_USER_QUERY_KEY } from '@/ui/hooks/user'
import TextField from '@/ui/components/basic/field/TextField'
import Button from '@/ui/components/basic/Button'
import Alert from '@/ui/components/basic/Alert'
import Breadcrumb from '@/ui/components/basic/Breadcrumb'
import { z } from 'zod'

const UpdateNameFormSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
})

type UpdateNameForm = z.infer<typeof UpdateNameFormSchema>

export default function MeNamePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUserQuery()
  const mutation = useUpdateCurrentUserMutation()
  const methods = useForm<UpdateNameForm>({
    resolver: zodResolver(UpdateNameFormSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
    },
  })

  const onSubmit = (data: UpdateNameForm) => {
    mutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
        router.push('/me')
      },
    })
  }

  return (
    <div className="min-h-screen bg-foreground/5">
      <div className="max-w-md mx-auto space-y-4 p-4">
        <Breadcrumb items={[
          { label: 'ホーム', href: '/' },
          { label: 'マイページ', href: '/me' },
          { label: '名前変更' },
        ]} />

        <div className="text-2xl py-4">
          名前変更
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
          {mutation.isError && (
            <Alert variant="error">
              名前の変更に失敗しました。入力内容を確認してください。
            </Alert>
          )}

          <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <TextField<UpdateNameForm>
              name="name"
              label="新しい名前"
              type="text"
              autoComplete="name"
              placeholder="名前を入力"
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
        </div>
      </div>
    </div>
  )
}
