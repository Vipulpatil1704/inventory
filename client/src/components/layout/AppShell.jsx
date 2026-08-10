import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Boxes, LayoutDashboard, LogOut, Menu, Package, Tags, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authApi } from '@/features/auth/authApi'
import { clearCredentials, selectUser } from '@/features/auth/authSlice'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
]

export function AppShell() {
  const [open, setOpen] = useState(false)
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch (error) {
      // Still clear local session if API logout fails
      console.error(getErrorMessage(error))
    } finally {
      dispatch(clearCredentials())
      toast.success('Logged out')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[var(--color-border)] bg-[#0b2e2a] text-teal-50 transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-200">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">StockPilot</p>
            <p className="text-xs text-teal-200/70">Inventory Ops</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-teal-100/80 transition-colors hover:bg-white/10 hover:text-white',
                  isActive && 'bg-teal-500/20 text-white'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open ? <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu" /> : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-[var(--color-muted-foreground)]">Welcome back</p>
              <p className="font-medium">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[var(--color-secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary-foreground)] sm:inline">
              {user?.role}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-hidden={!open}>
              {open ? <X className="h-5 w-5" /> : null}
            </button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6">
          <Outlet />
        </main>
        <footer className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-muted-foreground)] md:px-6">
          StockPilot Inventory · <Link className="text-[var(--color-primary)] hover:underline" to="/">Dashboard</Link>
        </footer>
      </div>
    </div>
  )
}
