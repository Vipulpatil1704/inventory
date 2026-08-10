import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, Boxes, Package, PackageX, Tags } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { dashboardApi } from '@/features/dashboard/dashboardApi'
import { getErrorMessage } from '@/lib/api'

const statCards = [
  { key: 'totalProducts', label: 'Total Products', icon: Package },
  { key: 'totalCategories', label: 'Total Categories', icon: Tags },
  { key: 'totalStockQuantity', label: 'Total Stock Quantity', icon: Boxes },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: AlertTriangle },
  { key: 'outOfStockItems', label: 'Out of Stock Items', icon: PackageX },
]

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.stats()
      return res.data.data
    },
  })

  if (isLoading) return <LoadingSpinner label="Loading dashboard..." />

  if (isError) {
    return (
      <EmptyState
        title="Could not load dashboard"
        description={getErrorMessage(error)}
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    )
  }

  const { stats, lowStockList, outOfStockList } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[var(--color-muted-foreground)]">
            Inventory overview · low stock threshold: {stats.lowStockThreshold}
          </p>
        </div>
        <Button asChild>
          <Link to="/products/new">Add product</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.key} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{card.label}</CardDescription>
                <card.icon className="h-4 w-4 text-[var(--color-primary)]" />
              </div>
              <CardTitle className="text-3xl">{stats[card.key]}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
            <CardDescription>Items at or below the threshold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockList.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">No low stock items.</p>
            ) : (
              lowStockList.map((item) => (
                <Link
                  key={item._id}
                  to={`/products/${item._id}`}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 transition hover:bg-[var(--color-muted)]/60"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Qty {item.quantity}</p>
                    <StatusBadge status={item.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Out of stock</CardTitle>
            <CardDescription>Items with zero quantity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outOfStockList.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">No out of stock items.</p>
            ) : (
              outOfStockList.map((item) => (
                <Link
                  key={item._id}
                  to={`/products/${item._id}/stock`}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2 transition hover:bg-[var(--color-muted)]/60"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">{item.sku}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
