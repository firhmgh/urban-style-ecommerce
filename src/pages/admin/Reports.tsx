import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function AdminReports() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-02-09');
  const [reportsData, setReportsData] = useState<any>({
    filteredOrders: [],
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueByStatus: [],
    topSellingProducts: [],
    orderStatusData: [],
    dailyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, [startDate, endDate]); // Re-fetch saat tanggal berubah

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // 1. Ambil semua pesanan dalam range tanggal + join order_items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          customer_name,
          customer_email,
          status,
          total,
          items:order_items (
            product_name,
            quantity,
            price
          )
        `)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // 2. Hitung semua statistik
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Revenue by status
      const revenueByStatus = [
        { status: 'Delivered', revenue: ordersData?.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => sum + o.total, 0) || 0 },
        { status: 'Processing', revenue: ordersData?.filter((o: any) => o.status === 'processing').reduce((sum: number, o: any) => sum + o.total, 0) || 0 },
        { status: 'Pending', revenue: ordersData?.filter((o: any) => o.status === 'pending').reduce((sum: number, o: any) => sum + o.total, 0) || 0 },
        { status: 'Shipped', revenue: ordersData?.filter((o: any) => o.status === 'shipped').reduce((sum: number, o: any) => sum + o.total, 0) || 0 },
        { status: 'Cancelled', revenue: ordersData?.filter((o: any) => o.status === 'cancelled').reduce((sum: number, o: any) => sum + o.total, 0) || 0 },
      ];

      // Top selling products
      const productSales = new Map<string, { quantity: number; revenue: number }>();
      ordersData?.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const name = item.product_name || 'Unknown';
          const current = productSales.get(name) || { quantity: 0, revenue: 0 };
          productSales.set(name, {
            quantity: current.quantity + (item.quantity || 0),
            revenue: current.revenue + ((item.price || 0) * (item.quantity || 0)),
          });
        });
      });

      const topSellingProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

      // Daily revenue (group by date)
      const dailyRevenueMap = new Map<string, number>();
      ordersData?.forEach((order: any) => {
        if (!order.created_at) return;
        const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
        const current = dailyRevenueMap.get(date) || 0;
        dailyRevenueMap.set(date, current + (order.total || 0));
      });

      const dailyRevenue = Array.from(dailyRevenueMap.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Order status distribution
      const orderStatusData = [
        { name: 'Delivered', value: ordersData?.filter((o: any) => o.status === 'delivered').length || 0, color: '#10b981' },
        { name: 'Processing', value: ordersData?.filter((o: any) => o.status === 'processing').length || 0, color: '#3b82f6' },
        { name: 'Pending', value: ordersData?.filter((o: any) => o.status === 'pending').length || 0, color: '#eab308' },
        { name: 'Shipped', value: ordersData?.filter((o: any) => o.status === 'shipped').length || 0, color: '#8b5cf6' },
        { name: 'Cancelled', value: ordersData?.filter((o: any) => o.status === 'cancelled').length || 0, color: '#ef4444' },
      ];

      setReportsData({
        filteredOrders: ordersData || [],
        totalRevenue,
        totalOrders,
        averageOrderValue,
        revenueByStatus,
        topSellingProducts,
        orderStatusData,
        dailyRevenue,
      });
    } catch (error: any) {
      console.error('Error fetching reports data:', error);
      toast.error('Gagal memuat laporan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert('Fitur Export PDF akan diimplementasikan nanti (bisa pakai library seperti jsPDF)');
  };

  const handleExportExcel = () => {
    alert('Fitur Export Excel akan diimplementasikan nanti (bisa pakai library seperti xlsx)');
  };

  if (loading) {
    return (
      <AdminLayout title="Laporan Penjualan">
        <div className="text-center py-20">Memuat laporan...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Laporan Penjualan">
      <div className="space-y-6">
        {/* Date Filter */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Pendapatan</p>
                <p className="text-2xl font-bold">
                  Rp {(reportsData.totalRevenue / 1000000).toFixed(1)}jt
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Periode yang dipilih
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
                <p className="text-2xl font-bold">{reportsData.totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Periode yang dipilih
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
                <p className="text-sm text-muted-foreground mb-1">Rata-rata Nilai Pesanan</p>
                <p className="text-2xl font-bold">
                  Rp {(reportsData.averageOrderValue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per transaksi
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue by Status */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Pendapatan per Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsData.revenueByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}jt`}
                />
                <Bar dataKey="revenue" fill="#ff6b35" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Order Status Distribution */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Distribusi Status Pesanan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportsData.orderStatusData.filter((d: any) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportsData.orderStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Produk Terlaris</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportsData.topSellingProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return `Rp ${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="quantity" fill="#3b82f6" name="Terjual" />
              <Bar dataKey="revenue" fill="#ff6b35" name="Pendapatan" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Revenue Trend */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Tren Pendapatan Harian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportsData.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
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

        {/* Detailed Table */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Detail Transaksi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3">ID Pesanan</th>
                  <th className="text-left p-3">Tanggal</th>
                  <th className="text-left p-3">Pelanggan</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.filteredOrders.map((order: any) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-3 font-medium">{order.id}</td>
                    <td className="p-3">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">{order.customer_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary font-bold">
                <tr>
                  <td colSpan={4} className="p-3 text-right">Total:</td>
                  <td className="p-3 text-right">
                    Rp {reportsData.totalRevenue.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}