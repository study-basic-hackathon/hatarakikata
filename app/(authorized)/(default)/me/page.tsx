'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { RiUserLine, RiLockPasswordLine, RiMailLine, RiLogoutBoxRLine, RiDeleteBinLine } from 'react-icons/ri'
import { useAuth } from '@/ui/providers/AuthProvider'
import { useSignOutMutation, SESSION_QUERY_KEY } from '@/ui/hooks/auth'
import { useCurrentUserQuery, useDeleteCurrentUserMutation } from '@/ui/hooks/user'
import Breadcrumb from '@/ui/components/basic/Breadcrumb'
import MenuList from '@/ui/components/basic/menu/MenuList'
import MenuListItemLink from '@/ui/components/basic/menu/MenuListItemLink'
import MenuListItemButton from '@/ui/components/basic/menu/MenuListItemButton'
import ConfirmDialog from '@/ui/components/basic/dialog/ConfirmDialog'

export default function MePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: currentUser } = useCurrentUserQuery()
  const logoutMutation = useSignOutMutation()
  const deleteMutation = useDeleteCurrentUserMutation()
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
  }, [queryClient])

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/login')
      },
    })
  }

  const handleWithdraw = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        logoutMutation.mutate(undefined, {
          onSuccess: () => {
            router.push('/login')
          },
        })
      },
    })
  }

  const isWithdrawPending = deleteMutation.isPending || logoutMutation.isPending

  return (
    <div className="min-h-screen bg-foreground/5">
      <div className="max-w-md mx-auto space-y-4 p-4">
        <Breadcrumb items={[
          { label: 'ホーム', href: '/' },
          { label: 'マイページ' },
        ]} />

        <div className="text-2xl py-4">
          マイページ
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <MenuList>
            <MenuListItemLink
              to="/me/name"
              primaryText="名前"
              icon={<RiUserLine />}
              secondaryText={currentUser?.name ?? '未設定'}
            />
            <MenuListItemLink
              to="/me/email"
              primaryText="メールアドレス"
              icon={<RiMailLine />}
              secondaryText={user?.email}
            />
            <MenuListItemLink
              to="/me/password"
              primaryText="パスワード"
              icon={<RiLockPasswordLine />}
              secondaryText="パスワードを変更できます"
            />
            <MenuListItemButton
              onClick={handleSignOut}
              disabled={logoutMutation.isPending}
              icon={<RiLogoutBoxRLine />}
              primaryText="サインアウト"
              secondaryText="アカウントからサインアウトします"
            />
            <MenuListItemButton
              onClick={() => setWithdrawDialogOpen(true)}
              icon={<RiDeleteBinLine />}
              primaryText="退会"
              secondaryText="アカウントを削除します"
            />
          </MenuList>
        </div>
      </div>

      <ConfirmDialog
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        onSubmit={handleWithdraw}
        variant="danger"
        title="本当に退会しますか？"
        message="この操作は取り消せません。すべてのデータが完全に削除されます。"
        submitLabel={isWithdrawPending ? '処理中...' : '退会する'}
        cancelLabel="キャンセル"
        disabled={isWithdrawPending}
      />
    </div>
  )
}
