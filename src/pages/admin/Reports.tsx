import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { orders, products } from '../../lib/mock-data';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, DollarSign, Package, ShoppingBag } from 'lucide-react';

export default function AdminReports() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-02-03');

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
  });

  // Calculate statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by status
  const revenueByStatus = [
    {
      status: 'Delivered',
      revenue: filteredOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0),
    },
    {
      status: 'Processing',
      revenue: filteredOrders.filter(o => o.status === 'processing').reduce((sum, o) => sum + o.total, 0),
    },
    {
      status: 'Pending',
      revenue: filteredOrders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.total, 0),
    },
  ];

  // Products sold
  const productSales = new Map<string, { quantity: number; revenue: number }>();
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const current = productSales.get(item.productName) || { quantity: 0, revenue: 0 };
      productSales.set(item.productName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + (item.price * item.quantity),
      });
    });
  });

  const topSellingProducts = Array.from(productSales.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // Daily revenue (mock data for chart)
  const dailyRevenue = [
    { date: '01/02', revenue: 2500000 },
    { date: '02/02', revenue: 3200000 },
    { date: '03/02', revenue: 2800000 },
  ];

  // Order status distribution
  const orderStatusData = [
    { name: 'Delivered', value: filteredOrders.filter(o => o.status === 'delivered').length, color: '#10b981' },
    { name: 'Processing', value: filteredOrders.filter(o => o.status === 'processing').length, color: '#3b82f6' },
    { name: 'Pending', value: filteredOrders.filter(o => o.status === 'pending').length, color: '#eab308' },
    { name: 'Shipped', value: filteredOrders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
    { name: 'Cancelled', value: filteredOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
  ];

  const handleExportPDF = () => {
    alert('Export PDF functionality would be implemented here');
  };

  const handleExportExcel = () => {
    alert('Export Excel functionality would be implemented here');
  };

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
                  Rp {(totalRevenue / 1000000).toFixed(1)}jt
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
                <p className="text-2xl font-bold">{totalOrders}</p>
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
                  Rp {(averageOrderValue / 1000).toFixed(0)}k
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
              <BarChart data={revenueByStatus}>
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
                  data={orderStatusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
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
            <BarChart data={topSellingProducts} layout="vertical">
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
            <LineChart data={dailyRevenue}>
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
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-t">
                    <td className="p-3 font-medium">{order.id}</td>
                    <td className="p-3">
                      {new Date(order.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">{order.customerName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
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
                    Rp {totalRevenue.toLocaleString('id-ID')}
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
