import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { StatusBadge } from '@/components/StatusBadge'
import { inventoryApi } from '@/features/inventory/inventoryApi'
import { productsApi } from '@/features/products/productsApi'
import { getErrorMessage } from '@/lib/api'
import { stockAdjustSchema } from '@/lib/validators'
import { formatDateTime } from '@/lib/utils'

export default function StockPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await productsApi.get(id)
      return res.data.data.product
    },
  })

  const historyQuery = useQuery({
    queryKey: ['stock-history', id, page],
    queryFn: async () => {
      const res = await inventoryApi.history(id, { page, limit: 10 })
      return res.data.data
    },
    placeholderData: keepPreviousData,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: { quantity: 1, note: '' },
  })

  const adjustMutation = useMutation({
    mutationFn: async ({ type, values }) => {
      if (type === 'increase') {
        return inventoryApi.increase(id, values)
      }
      return inventoryApi.decrease(id, values)
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.type === 'increase' ? 'Stock increased' : 'Stock decreased')
      reset({ quantity: 1, note: '' })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['stock-history', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Stock update failed')),
  })

  if (productQuery.isLoading) return <LoadingSpinner label="Loading stock..." />

  const product = productQuery.data

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Stock management</h1>
          <p className="text-[var(--color-muted-foreground)]">
            {product?.name} · {product?.sku}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to={`/products/${id}`}>Back to product</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Current quantity</CardDescription>
            <CardTitle className="text-3xl">{product?.quantity}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Status</CardDescription>
            <div className="pt-2">
              <StatusBadge status={product?.status} />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Category</CardDescription>
            <CardTitle className="text-xl">{product?.category?.name || '—'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjust stock</CardTitle>
          <CardDescription>Negative inventory is blocked on decrease.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit((values) => {
              // default button is increase; decrease uses formAction via named buttons
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="1" {...register('quantity')} />
              {errors.quantity ? <p className="text-xs text-red-600">{errors.quantity.message}</p> : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea id="note" {...register('note')} />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button
                type="button"
                disabled={adjustMutation.isPending}
                onClick={handleSubmit((values) => adjustMutation.mutate({ type: 'increase', values }))}
              >
                Increase stock
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={adjustMutation.isPending}
                onClick={handleSubmit((values) => adjustMutation.mutate({ type: 'decrease', values }))}
              >
                Decrease stock
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock history</CardTitle>
          <CardDescription>Recent inventory transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {historyQuery.isLoading ? (
            <LoadingSpinner label="Loading history..." />
          ) : (historyQuery.data?.transactions || []).length === 0 ? (
            <p className="px-6 py-10 text-sm text-[var(--color-muted-foreground)]">No stock movements yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyQuery.data.transactions.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                      <TableCell className="capitalize">{tx.type}</TableCell>
                      <TableCell>{tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}</TableCell>
                      <TableCell>{tx.previousQty}</TableCell>
                      <TableCell>{tx.newQty}</TableCell>
                      <TableCell>{tx.user?.name || '—'}</TableCell>
                      <TableCell>{tx.note || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                <p className="text-[var(--color-muted-foreground)]">
                  Page {historyQuery.data.pagination.page} of {historyQuery.data.pagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= historyQuery.data.pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
