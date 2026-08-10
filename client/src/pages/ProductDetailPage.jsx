import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { productsApi } from '@/features/products/productsApi'
import { getErrorMessage } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productsApi.get(id)
      return res.data.data.product
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Product deleted')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/products')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Delete failed')),
  })

  if (isLoading) return <LoadingSpinner label="Loading product..." />

  if (isError) {
    return (
      <EmptyState
        title="Product not found"
        description={getErrorMessage(error)}
        action={
          <Button asChild>
            <Link to="/products">Back to products</Link>
          </Button>
        }
      />
    )
  }

  const product = data

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-[var(--color-muted-foreground)]">{product.sku}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/products/${id}/stock`}>Manage stock</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`/products/${id}/edit`}>Edit</Link>
          </Button>
          <Button
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (window.confirm(`Delete ${product.name}?`)) deleteMutation.mutate()
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Quantity</CardDescription>
            <CardTitle className="text-3xl">{product.quantity}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unit price</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(product.unitPrice)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <div className="pt-2">
              <StatusBadge status={product.status} />
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">Category</p>
            <p className="font-medium">{product.category?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">Supplier</p>
            <p className="font-medium">{product.supplierName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">Date added</p>
            <p className="font-medium">{formatDateTime(product.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">Last updated</p>
            <p className="font-medium">{formatDateTime(product.updatedAt)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{product.description || 'No description provided.'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
