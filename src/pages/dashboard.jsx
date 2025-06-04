import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { useNavigate } from "react-router-dom"
import { 
  ShoppingBag, 
  Calendar, 
  Store, 
  Gift, 
  Settings, 
  BarChart, 
  Package,
  Tag,
  Wine
} from "lucide-react"

// Original dashboard code is commented out
/*
import { BarChart, LineChart, DollarSign, Users, ShoppingBag, ArrowUpRight } from "lucide-react"

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your bar exchange operations
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Crashes</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +4 from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md">
              <LineChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Sales Chart</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
            <CardDescription>
              Most popular items this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Whiskey", "Beer", "Vodka", "Rum", "Wine"].map((item, i) => (
                <div key={item} className="flex items-center">
                  <div className="w-[46px] h-[46px] flex items-center justify-center rounded-md bg-secondary">
                    <BarChart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{item}</p>
                    <p className="text-sm text-muted-foreground">
                      {100 - i * 12} orders
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    ${(50 - i * 5).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
*/

// New dashboard with navigation cards
export function Dashboard() {
  const navigate = useNavigate();

  // Define the navigation cards
  const navigationCards = [
    {
      title: "Items",
      description: "Manage inventory items",
      icon: <Package className="h-8 w-8" />,
      path: "/items",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Branches",
      description: "Manage business branches",
      icon: <Store className="h-8 w-8" />,
      path: "/branches",
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      title: "Categories",
      description: "Manage product categories",
      icon: <Tag className="h-8 w-8" />,
      path: "/categories",
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      title: "Mixers",
      description: "Manage drink mixers",
      icon: <Wine className="h-8 w-8" />,
      path: "/mixers",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Orders",
      description: "Manage customer orders",
      icon: <ShoppingBag className="h-8 w-8" />,
      path: "/orders",
      color: "bg-green-100 text-green-700"
    },
    /* Commented out as requested
    {
      title: "Prebookings",
      description: "Manage customer prebookings",
      icon: <Calendar className="h-8 w-8" />,
      path: "/prebookings",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Market Crash",
      description: "Manage market crash events",
      icon: <BarChart className="h-8 w-8" />,
      path: "/market-crash",
      color: "bg-red-100 text-red-700"
    },
    {
      title: "Loyalty",
      description: "Manage loyalty programs",
      icon: <Gift className="h-8 w-8" />,
      path: "/loyalty",
      color: "bg-pink-100 text-pink-700"
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: <Settings className="h-8 w-8" />,
      path: "/settings",
      color: "bg-gray-100 text-gray-700"
    }
    */
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Tiger Bar Exchange Admin Panel
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {navigationCards.map((card) => (
          <Card 
            key={card.title} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(card.path)}
          >
            <div className="flex p-6">
              <div className={`p-4 rounded-full ${card.color} mr-4 flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}