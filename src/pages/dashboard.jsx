import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  ShoppingBag, 
  Store, 
  Package,
  Tag,
  Wine,
  Table,
  Calendar,
  TrendingDown,
  Settings,
  Tv,
  Sparkles,
  ScrollText,
  Users as UsersIcon,
  Award
} from 'lucide-react';

// Import the NavigationCard component
import { NavigationCard } from '../components/navigation-card';

/**
 * Dashboard component with navigation cards
 * @returns {React.ReactElement} Dashboard component
 */
export function Dashboard() {
  const navigate = useNavigate();

  // Define the navigation cards
  const navigationCards = [
    {
      title: 'Manage Items',
      description: 'Add/edit items, floor/base price, demand tracking',
      icon: <Package className="h-8 w-8" />,
      path: '/items',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Branches',
      description: 'Manage business branches (name, address, contact)',
      icon: <Store className="h-8 w-8" />,
      path: '/branches',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      title: 'Users',
      description: 'Manage user logins, loyalty points, and coupons',
      icon: <UsersIcon className="h-8 w-8" />,
      path: '/users',
      color: 'bg-rose-100 text-rose-700',
    },
    {
      title: 'Tables',
      description: 'Manage tables, status (available, reserved, occupied)',
      icon: <Table className="h-8 w-8" />,
      path: '/tables',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Categories',
      description: 'Manage product categories',
      icon: <Tag className="h-8 w-8" />,
      path: '/categories',
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'Mixers',
      description: 'Add/edit mixers for drinks',
      icon: <Wine className="h-8 w-8" />,
      path: '/mixers',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Orders',
      description: 'View all orders by outlet/time',
      icon: <ShoppingBag className="h-8 w-8" />,
      path: '/orders',
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Loyalty Programs',
      description: 'Manage loyalty points and user rewards',
      icon: <Award className="h-8 w-8" />,
      path: '/loyalty',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Reservations',
      description: 'Manage table reservations and prebookings',
      icon: <Calendar className="h-8 w-8" />,
      path: '/prebookings',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Market Crash',
      description: 'Trigger crash, timer, view logs',
      icon: <TrendingDown className="h-8 w-8" />,
      path: '/market-crash',
      color: 'bg-red-100 text-red-700',
    },
    {
      title: 'TV Screen',
      description: 'Display drinks menu on TV screen',
      icon: <Tv className="h-8 w-8" />,
      path: '/tv-screen',
      color: 'bg-cyan-100 text-cyan-700',
    },
    {
      title: 'LED Ticker',
      description: 'LED-style scrolling price ticker',
      icon: <ScrollText className="h-8 w-8" />,
      path: '/ticker-board',
      color: 'bg-teal-100 text-teal-700',
    },
    {
      title: 'Highlights',
      description: 'Curate trending, top gainers, and top losers per branch',
      icon: <Sparkles className="h-8 w-8" />,
      path: '/highlights',
      color: 'bg-pink-100 text-pink-700',
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: <Settings className="h-8 w-8" />,
      path: '/settings',
      color: 'bg-gray-100 text-gray-700',
    }
  ];

  /**
   * Handle navigation to a specific path
   * @param {string} path - Path to navigate to
   */
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Tiger Bar Exchange Admin Panel
        </p>
      </div>
      
      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {navigationCards.map((card) => (
          <NavigationCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
            color={card.color}
            onClick={() => handleNavigate(card.path)}
          />
        ))}
      </div>
    </div>
  );
}