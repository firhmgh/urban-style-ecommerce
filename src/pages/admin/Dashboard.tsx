import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/card';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });

  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Ambil semua pesanan + itemnya
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, total, status, created_at,
          items:order_items (quantity, price, product_name)
        `)
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // 2. Ambil semua produk untuk hitung total & stok rendah
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, stock');

      if (productsError) throw productsError;

      // Hitung statistik
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalProducts = productsData?.length || 0;
      const lowStockProducts = productsData?.filter(p => (p.stock || 0) < 20).length || 0;

      const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;
      const processingOrders = ordersData?.filter(o => o.status === 'processing').length || 0;
      const shippedOrders = ordersData?.filter(o => o.status === 'shipped').length || 0;
      const deliveredOrders = ordersData?.filter(o => o.status === 'delivered').length || 0;

      // Top selling products
      const productSales = new Map<string, number>();
      ordersData?.forEach(order => {
        order.items?.forEach((item: any) => {
          const name = item.product_name || 'Unknown';
          const current = productSales.get(name) || 0;
          productSales.set(name, current + (item.quantity || 0));
        });
      });

      const topProductsData = Array.from(productSales.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Revenue by month (group by month from created_at)
      const revenueByMonth = new Map<string, number>();
      ordersData?.forEach(order => {
        if (!order.created_at) return;
        const date = new Date(order.created_at);
        const month = date.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
        const current = revenueByMonth.get(month) || 0;
        revenueByMonth.set(month, current + (order.total || 0));
      });

      const monthlyRevenueData = Array.from(revenueByMonth.entries())
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockProducts,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      });

      setTopProducts(topProductsData);
      setMonthlyRevenue(monthlyRevenueData);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Gagal memuat data dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-20">Memuat data dashboard...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold">
                Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
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
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.processingOrders} sedang diproses
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
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {stats.lowStockProducts} produk stok rendah
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
              <p className="text-2xl font-bold">{stats.deliveredOrders}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalOrders > 0 ? ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(0) : 0}% dari total
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
          {monthlyRevenue.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Belum ada data pendapatan
            </div>
          ) : (
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
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Produk Terlaris</h3>
          {topProducts.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Belum ada data penjualan
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#ff6b35" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Order Status Summary */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Status Pesanan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Menunggu Pembayaran</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.processingOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Diproses</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{stats.shippedOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Dikirim</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.deliveredOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">Selesai</p>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}