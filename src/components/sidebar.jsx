import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  TrendingDown, 
  ShoppingCart, 
  Calendar, 
  Store, 
  Users, 
  Settings,
  LogOut,
  Tag,
  Wine
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { useAuth } from '../contexts/auth-context'

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Total orders, top items, crashes, live stats"
  },
  {
    title: "Branches",
    href: "/branches",
    icon: Store,
    description: "Manage business branches (name, address, contact)"
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Tag,
    description: "Manage product categories"
  },
  {
    title: "Manage Items",
    href: "/items",
    icon: Package,
    description: "Add/edit items, floor/base price, demand tracking"
  },
  {
    title: "Manage Mixers",
    href: "/mixers",
    icon: Wine,
    description: "Add/edit mixers for drinks"
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    description: "View all orders by outlet/time"
  },
  /* Commented out as requested
  {
    title: "Prebookings",
    href: "/prebookings",
    icon: Calendar,
    description: "View pending/active prebookings"
  },
  {
    title: "Market Crash",
    href: "/market-crash",
    icon: TrendingDown,
    description: "Trigger crash, timer, view logs"
  },
  */
  {
    title: "Loyalty Settings",
    href: "/loyalty",
    icon: Users,
    description: "View users, assign manual rewards if needed"
  },
  // {
  //   title: "Settings",
  //   href: "/settings",
  //   icon: Settings,
  //   description: "Admin login/logout, token refresh, roles"
  // }
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  
  const handleLogout = () => {
    signOut()
    navigate('/sign-in')
  }
  
  return (
    <div className="pb-12 w-64 border-r h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold tracking-tight">
          Tiger Bar Exchange
        </h2>
        <ThemeToggle />
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="px-4 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  location.pathname === item.href 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || 'admin@tigerbar.com'}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center gap-2 mt-2"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </Button>
      </div>
    </div>
  )
}