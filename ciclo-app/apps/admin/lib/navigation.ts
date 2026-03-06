/**
 * Admin navigation configuration.
 * Defines all sidebar routes and role-based visibility.
 */

export interface NavItem {
  label: string
  href: string
  icon: string
  /** Roles that can see this item. Empty = all admin roles */
  roles?: ('ADMIN' | 'FACILITATOR')[]
}

/**
 * All admin navigation items.
 * Items without `roles` are visible to both ADMIN and FACILITATOR.
 * Items with `roles: ['ADMIN']` are ADMIN-only.
 *
 * Per AC-4: FACILITATOR sees only Dashboard, Eventos, Inscrições.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Eventos',
    href: '/admin/eventos',
    icon: 'Calendar',
  },
  {
    label: 'Facilitadores',
    href: '/admin/facilitadores',
    icon: 'Users',
    roles: ['ADMIN'],
  },
  {
    label: 'Ingressos',
    href: '/admin/ingressos',
    icon: 'Ticket',
    roles: ['ADMIN'],
  },
  {
    label: 'Inscrições',
    href: '/admin/inscrições',
    icon: 'ClipboardList',
  },
  {
    label: 'Participantes',
    href: '/admin/participantes',
    icon: 'UserCheck',
    roles: ['ADMIN'],
  },
  {
    label: 'Leads',
    href: '/admin/leads',
    icon: 'TrendingUp',
    roles: ['ADMIN'],
  },
  {
    label: 'Produtos',
    href: '/admin/produtos',
    icon: 'Package',
    roles: ['ADMIN'],
  },
  {
    label: 'Espacos',
    href: '/admin/espacos',
    icon: 'MapPin',
    roles: ['ADMIN'],
  },
  {
    label: 'Configurações',
    href: '/admin/configurações',
    icon: 'Settings',
    roles: ['ADMIN'],
  },
] as const

/**
 * Filter nav items based on user role.
 */
export function getNavItemsForRole(role: string): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.includes(role as 'ADMIN' | 'FACILITATOR')
  })
}

/**
 * Breadcrumb segment labels for admin routes.
 */
export const ROUTE_LABELS: Record<string, string> = {
  admin: 'Admin',
  eventos: 'Eventos',
  facilitadores: 'Facilitadores',
  ingressos: 'Ingressos',
  inscrições: 'Inscrições',
  participantes: 'Participantes',
  leads: 'Leads',
  produtos: 'Produtos',
  espacos: 'Espacos',
  configurações: 'Configurações',
}
