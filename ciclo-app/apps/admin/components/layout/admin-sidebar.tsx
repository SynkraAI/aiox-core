'use client'

import { useState } from 'react'
import { Sheet, SheetContent } from '@ciclo/ui'
import { SidebarNav } from '@/layout/sidebar-nav'
import { NavIcon } from '@/layout/nav-icon'
import type { NavItem } from '@/navigation'

interface AdminSidebarProps {
  items: NavItem[]
}

export function AdminSidebar({ items }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-base-dark p-2 text-base-bg shadow-lg md:hidden"
        aria-label="Abrir menu"
      >
        <NavIcon name="Menu" className="h-5 w-5" />
      </button>

      {/* Mobile drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="left"
          onClose={() => setIsMobileOpen(false)}
          className="w-64 bg-base-dark p-0"
        >
          <div className="flex h-full flex-col">
            <SidebarLogo />
            <div className="flex-1 overflow-y-auto">
              <SidebarNav
                items={items}
                onItemClick={() => setIsMobileOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-base-gold/10 md:bg-base-dark">
        <SidebarLogo />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav items={items} />
        </div>
      </aside>
    </>
  )
}

function SidebarLogo() {
  return (
    <div className="flex h-16 items-center gap-3 border-b border-base-gold/10 px-6">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-gold/20">
        <span className="text-sm font-bold text-base-gold">BT</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-heading font-semibold text-base-bg">
          Base Tríade
        </span>
        <span className="text-xs text-base-bg/50">Admin</span>
      </div>
    </div>
  )
}
