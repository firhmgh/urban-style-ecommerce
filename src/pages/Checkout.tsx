import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useCart } from '../lib/cart-context';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { CreditCard, Building2, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: profile?.full_name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('bank-transfer');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || items.length === 0) {
    navigate(items.length === 0 ? '/cart' : '/login');
    return null;
  }

  const shippingCost = total >= 500000 ? 0 : 25000;
  const grandTotal = total + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validasi form
    if (!formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Mohon lengkapi semua data pengiriman');
      setLoading(false);
      return;
    }

    try {
      // 1. Buat ID custom unik
      const year = new Date().getFullYear();
      const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random
      const orderId = `ORD-${year}-${random}`;

      // 2. Insert ke orders
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_id: user?.id,
          customer_name: formData.name,
          customer_email: formData.email,
          total: grandTotal,
          status: 'pending',
          shipping_address: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          payment_method: getPaymentMethodName(paymentMethod),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Insert ke order_items
      const orderItemsData = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize, // ← perbaikan TS: pakai selectedSize, bukan size
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Sukses
      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      navigate('/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'bank-transfer': return 'Bank Transfer - BCA';
      case 'ewallet': return 'E-Wallet - GoPay';
      case 'credit-card': return 'Credit Card';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Information */}
                <div className="bg-white rounded-lg p-6">
                  <h2 className="font-bold text-lg mb-4">Data Pengiriman</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">No. Telepon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="081234567890"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Kota</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Medan"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Alamat Lengkap</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Jl. Contoh No. 123"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Kode Pos</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="20111"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg p-6">
                  <h2 className="font-bold text-lg mb-4">Metode Pembayaran</h2>
                  
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer">
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <Building2 className="h-5 w-5 text-accent" />
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-sm text-muted-foreground">BCA / Mandiri / BNI</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer">
                        <RadioGroupItem value="ewallet" id="ewallet" />
                        <Label htmlFor="ewallet" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <Wallet className="h-5 w-5 text-accent" />
                          <div>
                            <p className="font-medium">E-Wallet</p>
                            <p className="text-sm text-muted-foreground">GoPay / OVO / Dana</p>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-accent transition-colors cursor-pointer">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex items-center space-x-3 cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 text-accent" />
                          <div>
                            <p className="font-medium">Credit Card</p>
                            <p className="text-sm text-muted-foreground">Visa / Mastercard</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 sticky top-24">
                  <h2 className="font-bold text-lg mb-4">Ringkasan Pesanan</h2>
                  
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.selectedSize} × {item.quantity} {/* ← perbaikan TS: selectedSize */}
                          </p>
                        </div>
                        <span className="ml-2 font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 pb-6 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ongkir</span>
                      <span className="font-medium">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">GRATIS</span>
                        ) : (
                          `Rp ${shippingCost.toLocaleString('id-ID')}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-accent">
                      Rp {grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}