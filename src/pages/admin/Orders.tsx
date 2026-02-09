import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { supabase } from '../../lib/supabase';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
  items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_id,
          customer_name,
          customer_email,
          created_at,
          status,
          total,
          shipping_address,
          payment_method,
          items:order_items (
            product_id,
            product_name,
            quantity,
            price,
            size
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        date: order.created_at,
        status: order.status,
        total: order.total,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        items: order.items.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || 'N/A',
        })),
      }));

      setOrders(mappedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat pesanan: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Gagal update status');
      console.error(error);
      fetchOrders(); // Refresh jika gagal
    } else {
      toast.success('Status berhasil diupdate');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Menunggu Pembayaran';
      case 'processing': return 'Diproses';
      case 'shipped': return 'Dikirim';
      case 'delivered': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  return (
    <AdminLayout title="Manajemen Pesanan">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-muted-foreground">
          Kelola dan pantau pesanan pelanggan
        </p>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
            <SelectItem value="processing">Diproses</SelectItem>
            <SelectItem value="shipped">Dikirim</SelectItem>
            <SelectItem value="delivered">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-10">Memuat pesanan...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pesanan</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Tidak ada pesanan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      Rp {order.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-sm text-muted-foreground mt-4">
        Menampilkan {filteredOrders.length} dari {orders.length} pesanan
      </p>

      {/* Dialog Detail */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan {selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Status Saat Ini:</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value: Order['status']) => handleStatusUpdate(selectedOrder.id, value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                    <SelectItem value="processing">Diproses</SelectItem>
                    <SelectItem value="shipped">Dikirim</SelectItem>
                    <SelectItem value="delivered">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Info Pelanggan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Informasi Pelanggan</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nama:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                    <p><strong>Tanggal Pesanan:</strong> {new Date(selectedOrder.date).toLocaleString('id-ID')}</p>
                    <p><strong>Metode Pembayaran:</strong> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Alamat Pengiriman</h3>
                  <div className="space-y-1 text-sm">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                  </div>
                </div>
              </div>

              {/* Daftar Item */}
              <div>
                <h3 className="font-bold mb-3">Daftar Item Pesanan</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-center">Ukuran</TableHead>
                        <TableHead className="text-center">Jumlah</TableHead>
                        <TableHead className="text-right">Harga Satuan</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">{item.size}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">Rp {item.price.toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right font-medium">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold">
                        <TableCell colSpan={4} className="text-right">Total:</TableCell>
                        <TableCell className="text-right">
                          Rp {selectedOrder.total.toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}