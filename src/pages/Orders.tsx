import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../lib/auth-context';
import { Order } from '../lib/mock-data';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function Orders() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Load orders from localStorage
      const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
      // Filter orders for current user
      const myOrders = userOrders.filter((order: Order) => order.customerId === user?.id);
      setOrders(myOrders);
    }
  }, [isAuthenticated, navigate, user]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Riwayat Pesanan</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Belum Ada Pesanan</h2>
              <p className="text-muted-foreground mb-6">
                Anda belum memiliki riwayat pesanan
              </p>
              <a
                href="/catalog"
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Mulai Belanja
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-lg">{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusText(order.status)}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
                      <p className="text-2xl font-bold text-accent">
                        Rp {order.total.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted-foreground">
                            {item.size} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-medium mb-2 text-sm">Alamat Pengiriman:</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.phone}<br />
                      {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Metode Pembayaran:</strong> {order.paymentMethod}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
