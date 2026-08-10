import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { categoriesApi } from '@/features/categories/categoriesApi'
import { productsApi } from '@/features/products/productsApi'
import { getErrorMessage } from '@/lib/api'
import { productSchema, productUpdateSchema } from '@/lib/validators'

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesApi.list()
      return res.data.data.categories
    },
  })

  const productQuery = useQuery({
    queryKey: ['product', id],
    enabled: isEdit,
    queryFn: async () => {
      const res = await productsApi.get(id)
      return res.data.data.product
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? productUpdateSchema : productSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: '',
      description: '',
      quantity: 0,
      unitPrice: '',
      supplierName: '',
    },
  })

  useEffect(() => {
    if (productQuery.data) {
      reset({
        name: productQuery.data.name,
        sku: productQuery.data.sku,
        category: productQuery.data.category?._id || productQuery.data.category,
        description: productQuery.data.description || '',
        unitPrice: productQuery.data.unitPrice,
        supplierName: productQuery.data.supplierName,
      })
    }
  }, [productQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values) => {
      if (isEdit) {
        const { quantity, ...rest } = values
        const res = await productsApi.update(id, rest)
        return res.data
      }
      const res = await productsApi.create(values)
      return res.data
    },
    onSuccess: (data) => {
      toast.success(isEdit ? 'Product updated' : 'Product created')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['product', id] })
      }
      navigate(`/products/${data.data.product._id}`)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Save failed')),
  })

  if (isEdit && productQuery.isLoading) {
    return <LoadingSpinner label="Loading product..." />
  }

  const categoryValue = watch('category')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{isEdit ? 'Edit product' : 'Add product'}</h1>
        <p className="text-[var(--color-muted-foreground)]">
          {isEdit ? 'Update product details. Use stock management to change quantity.' : 'Create a new inventory item.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>All fields marked required must be filled.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" {...register('name')} />
              {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} />
              {errors.sku ? <p className="text-xs text-red-600">{errors.sku.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryValue} onValueChange={(value) => setValue('category', value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data || []).map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category ? <p className="text-xs text-red-600">{errors.category.message}</p> : null}
            </div>
            {!isEdit ? (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="0" {...register('quantity')} />
                {errors.quantity ? <p className="text-xs text-red-600">{errors.quantity.message}</p> : null}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit price</Label>
              <Input id="unitPrice" type="number" step="0.01" min="0" {...register('unitPrice')} />
              {errors.unitPrice ? <p className="text-xs text-red-600">{errors.unitPrice.message}</p> : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="supplierName">Supplier name</Label>
              <Input id="supplierName" {...register('supplierName')} />
              {errors.supplierName ? <p className="text-xs text-red-600">{errors.supplierName.message}</p> : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description ? <p className="text-xs text-red-600">{errors.description.message}</p> : null}
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to={isEdit ? `/products/${id}` : '/products'}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
