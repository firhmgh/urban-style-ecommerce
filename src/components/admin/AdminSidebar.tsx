import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Package, ShoppingBag, Tag, BarChart3, Home } from 'lucide-react';

export function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/categories', icon: Tag, label: 'Kategori' },
    { path: '/admin/products', icon: Package, label: 'Produk' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
    { path: '/admin/reports', icon: BarChart3, label: 'Laporan' },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1">Admin Panel</h2>
        <p className="text-sm text-sidebar-foreground/70">Urban Style Jakarta</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-sidebar-border">
        <Link
          to="/home"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-accent-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Kembali ke Toko</span>
        </Link>
      </div>
    </aside>
  );
}
