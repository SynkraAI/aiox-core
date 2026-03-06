'use client'

import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from '@ciclo/ui'
import { NavIcon } from '@/layout/nav-icon'

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
  onSignOut: () => void
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getRoleBadgeVariant(role: string): 'default' | 'secondary' {
  return role === 'ADMIN' ? 'default' : 'secondary'
}

export function AdminHeader({ user, onSignOut }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-base-gold/10 bg-base-bg/95 px-4 backdrop-blur-sm md:px-6">
      {/* Left spacer for mobile hamburger button area */}
      <div className="w-10 md:hidden" />

      {/* Logo area (mobile only -- desktop has sidebar logo) */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-sm font-heading font-semibold text-base-dark">
          Base Tríade
        </span>
      </div>

      {/* Right side: user info + logout */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-base-dark">{user.name ?? 'Admin'}</p>
            <p className="text-xs text-base-dark/60">{user.email}</p>
          </div>
          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
            {user.role}
          </Badge>
        </div>

        <Avatar size="sm">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name ?? 'Avatar'} />
          ) : null}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
          aria-label="Sair"
          className="text-base-dark/60 hover:text-base-dark"
        >
          <NavIcon name="LogOut" className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
