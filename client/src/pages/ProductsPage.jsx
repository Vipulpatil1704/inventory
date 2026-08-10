import { useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { categoriesApi } from '@/features/categories/categoriesApi'
import { productsApi } from '@/features/products/productsApi'
import { getErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    q: '',
    category: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })

  const queryParams = useMemo(
    () => ({
      q: filters.q || undefined,
      category: filters.category === 'all' ? undefined : filters.category,
      status: filters.status === 'all' ? undefined : filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page,
      limit: filters.limit,
    }),
    [filters]
  )

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.list()
      return res.data.data.categories
    },
  })

  const productsQuery = useQuery({
    queryKey: ['products', queryParams],
    queryFn: async () => {
      const res = await productsApi.list(queryParams)
      return res.data.data
    },
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Product deleted')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Delete failed')),
  })

  const products = productsQuery.data?.products || []
  const pagination = productsQuery.data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-[var(--color-muted-foreground)]">Search, filter, and manage inventory items</p>
        </div>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              className="pl-9"
              placeholder="Search by name or SKU"
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))}
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value, page: 1 }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categoriesQuery.data || []).map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value, page: 1 }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${filters.sortBy}:${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split(':')
              setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name:asc">Name A–Z</SelectItem>
              <SelectItem value="name:desc">Name Z–A</SelectItem>
              <SelectItem value="quantity:asc">Quantity low–high</SelectItem>
              <SelectItem value="quantity:desc">Quantity high–low</SelectItem>
              <SelectItem value="unitPrice:asc">Price low–high</SelectItem>
              <SelectItem value="unitPrice:desc">Price high–low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {productsQuery.isLoading ? (
        <LoadingSpinner label="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting filters or add your first product."
          action={
            <Button asChild>
              <Link to="/products/new">Add product</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category?.name || '—'}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/products/${product._id}`}>View</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/products/${product._id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`Delete ${product.name}?`)) {
                            deleteMutation.mutate(product._id)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {pagination ? (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <p className="text-[var(--color-muted-foreground)]">
                Page {pagination.page} of {pagination.pages} · {pagination.total} items
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
