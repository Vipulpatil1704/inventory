import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/features/auth/authApi'
import { selectIsAuthenticated, setCredentials } from '@/features/auth/authSlice'
import { getErrorMessage } from '@/lib/api'
import { registerSchema } from '@/lib/validators'

export default function RegisterPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await authApi.register(values)
      return data.data
    },
    onSuccess: (data) => {
      dispatch(setCredentials(data))
      toast.success('Account created')
      navigate('/', { replace: true })
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Registration failed')),
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-teal-900/10 shadow-lg shadow-teal-900/5">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>First registered user becomes admin; others join as staff.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Jane Doe" {...register('name')} />
              {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
              {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
              {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
            </div>
            <Button className="w-full" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
