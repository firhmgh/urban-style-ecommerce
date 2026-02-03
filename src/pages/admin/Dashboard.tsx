import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/card';
import { products, orders } from '../../lib/mock-data';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 20).length;

  // Orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  // Top selling products
  const productSales = new Map<string, number>();
  orders.forEach(order => {
    order.items.forEach(item => {
      const current = productSales.get(item.productName) || 0;
      productSales.set(item.productName, current + item.quantity);
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Revenue by month (mock data)
  const monthlyRevenue = [
    { month: 'Sep', revenue: 12500000 },
    { month: 'Oct', revenue: 15200000 },
    { month: 'Nov', revenue: 18300000 },
    { month: 'Dec', revenue: 21500000 },
    { month: 'Jan', revenue: 19800000 },
    { month: 'Feb', revenue: 24300000 },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold">
                Rp {(totalRevenue / 1000000).toFixed(1)}jt
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% dari bulan lalu
              </p>
            </div>
            <div className="bg-accent/10 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pesanan</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {processingOrders} sedang diproses
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Produk</p>
              <p className="text-2xl font-bold">{totalProducts}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {lowStockProducts} produk stok rendah
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pesanan Selesai</p>
              <p className="text-2xl font-bold">{deliveredOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((deliveredOrders / totalOrders) * 100).toFixed(0)}% dari total
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Pendapatan Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}jt`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff6b35"
                strokeWidth={2}
                dot={{ fill: '#ff6b35' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Produk Terlaris</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#ff6b35" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Order Status Summary */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Status Pesanan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Menunggu Pembayaran</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{processingOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Diproses</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{shippedOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Dikirim</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{deliveredOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Selesai</p>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
