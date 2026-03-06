import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge } from '@ciclo/ui'
import { formatCurrency } from '@ciclo/utils'
import Link from 'next/link'

import {
  getDashboardKPIs,
  getSalesByEvent,
  getRevenueOverTime,
  getUpcomingEvents,
  getRecentRegistrations,
  getRecentLeads,
} from '../../lib/actions/dashboard'
import type { DashboardPeriod } from '../../lib/actions/dashboard'
import { SEASON_LABELS, SEASON_BAR_COLORS } from '../../lib/constants'
import { KpiCard } from '../../components/dashboard/kpi-card'
import { BarChart } from '../../components/dashboard/bar-chart'
import { SparklineBar } from '../../components/dashboard/bar-chart'
import { PeriodFilter } from '../../components/dashboard/period-filter'
import { RecentRegistrations } from '../../components/dashboard/recent-registrations'
import { RecentLeads } from '../../components/dashboard/recent-leads'

// ============================================================
// Types
// ============================================================

interface AdminDashboardPageProps {
  searchParams: Promise<{ period?: string }>
}

// ============================================================
// Skeleton Components
// ============================================================

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg bg-base-dark/10" />
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return <Skeleton className="h-48 rounded-lg bg-base-dark/10" />
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 rounded bg-base-dark/10" />
      ))}
    </div>
  )
}

// ============================================================
// SVG Icons (inline to avoid dependency)
// ============================================================

function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-1.997M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}

function CurrencyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}

function EnvelopeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  )
}

// ============================================================
// Async Server Components
// ============================================================

async function KpiCards({ period }: { period: DashboardPeriod }) {
  const kpis = await getDashboardKPIs(period)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Inscrições Confirmadas"
        value={kpis.totalRegistrations.toString()}
        icon={<UsersIcon />}
        description="no período"
      />
      <KpiCard
        title="Receita Total"
        value={formatCurrency(kpis.totalRevenue)}
        icon={<CurrencyIcon />}
        description="no período"
      />
      <KpiCard
        title="Ocupacao Media"
        value={`${kpis.averageOccupancy}%`}
        icon={<ChartIcon />}
        description="eventos publicados"
      />
      <KpiCard
        title="Leads Captados"
        value={kpis.totalLeads.toString()}
        icon={<EnvelopeIcon />}
        description="no período"
      />
    </div>
  )
}

async function SalesByEventChart() {
  const salesData = await getSalesByEvent()

  const items = salesData.map((event) => ({
    label: event.name,
    value: event.confirmedRegistrations,
    maxValue: event.totalCapacity,
    colorClass: SEASON_BAR_COLORS[event.season] ?? 'bg-gray-400',
  }))

  return (
    <Card className="border-base-gold/10">
      <CardHeader>
        <CardTitle className="text-base font-heading font-semibold text-base-dark">
          Vendas por Evento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          items={items}
          title=""
          emptyMessage="Nenhum evento publicado"
        />
      </CardContent>
    </Card>
  )
}

async function RevenueChart({ period }: { period: DashboardPeriod }) {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const revenueData = await getRevenueOverTime(days)

  const chartData = revenueData.map((item) => ({
    label: item.date.slice(5), // MM-DD
    value: item.revenue,
  }))

  return (
    <Card className="border-base-gold/10">
      <CardHeader>
        <CardTitle className="text-base font-heading font-semibold text-base-dark">
          Receita ao Longo do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SparklineBar
          data={chartData}
          title=""
          formatValue={(v) => formatCurrency(v)}
        />
      </CardContent>
    </Card>
  )
}

async function UpcomingEventsCard() {
  const events = await getUpcomingEvents(5)

  return (
    <Card className="border-base-gold/10">
      <CardHeader>
        <CardTitle className="text-base font-heading font-semibold text-base-dark">
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-base-dark/40 text-center py-4">
            Nenhum evento futuro
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b border-base-dark/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/eventos/${event.id}`}
                    className="text-sm font-medium text-base-dark hover:underline truncate block"
                  >
                    {event.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-base-dark/60">
                      {new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      }).format(event.startDate)}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {SEASON_LABELS[event.season] ?? event.season}
                    </Badge>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-medium text-base-dark">
                    {event.occupancyPercent}%
                  </div>
                  <div className="text-[10px] text-base-dark/40">
                    {event.confirmedRegistrations}/{event.capacity ?? '--'} vagas
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function RecentRegistrationsCard() {
  const registrations = await getRecentRegistrations(5)

  return (
    <Card className="border-base-gold/10">
      <CardHeader>
        <CardTitle className="text-base font-heading font-semibold text-base-dark">
          Ultimas Inscrições
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RecentRegistrations registrations={registrations} />
      </CardContent>
    </Card>
  )
}

async function RecentLeadsCard() {
  const leads = await getRecentLeads(5)

  return (
    <Card className="border-base-gold/10">
      <CardHeader>
        <CardTitle className="text-base font-heading font-semibold text-base-dark">
          Leads Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RecentLeads leads={leads} />
      </CardContent>
    </Card>
  )
}

// ============================================================
// Main Page
// ============================================================

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams
  const period = (params.period as DashboardPeriod) || '30d'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-base-dark">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-base-dark/60">
            Visao geral do Ciclo das Estações
          </p>
        </div>
        <Suspense fallback={<Skeleton className="h-9 w-64 bg-base-dark/10" />}>
          <PeriodFilter />
        </Suspense>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<KpiSkeleton />}>
        <KpiCards period={period} />
      </Suspense>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <SalesByEventChart />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart period={period} />
        </Suspense>
      </div>

      {/* Upcoming Events */}
      <Suspense fallback={<ChartSkeleton />}>
        <UpcomingEventsCard />
      </Suspense>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<TableSkeleton />}>
          <RecentRegistrationsCard />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <RecentLeadsCard />
        </Suspense>
      </div>
    </div>
  )
}
