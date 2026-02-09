import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useCart } from '../lib/cart-context';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Keranjang Anda Kosong</h2>
              <p className="text-muted-foreground mb-6">
                Belum ada produk yang ditambahkan ke keranjang
              </p>
              <Link to="/catalog">
                <Button className="bg-black text-white hover:bg-gray-900 px-8 py-6 text-lg">
                  Mulai Belanja
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Daftar Item Keranjang */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <div
                    key={`${item.id}-${item.selectedSize}`}
                    className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm hover:shadow transition-shadow"
                  >
                    {/* Gambar Produk */}
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.images?.[0] || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info Produk */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Ukuran: {item.selectedSize || 'Tidak dipilih'}
                      </p>
                      <p className="font-bold text-accent">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Kontrol Quantity */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subtotal & Hapus */}
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold mb-2 text-gray-900">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                      <button
                        onClick={() => {
                          removeFromCart(item.id, item.selectedSize);
                          toast.success('Produk dihapus dari keranjang');
                        }}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ringkasan Belanja (Sticky di kanan) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 sticky top-24 shadow-sm">
                  <h2 className="font-bold text-lg mb-4">Ringkasan Belanja</h2>

                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} item)
                      </span>
                      <span className="font-medium text-gray-900">
                        Rp {total.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ongkir</span>
                      <span className="font-medium">
                        {total >= 500000 ? (
                          <span className="text-green-600 font-semibold">GRATIS</span>
                        ) : (
                          'Rp 25.000'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-accent">
                      Rp {(total >= 500000 ? total : total + 25000).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {total < 500000 && (
                    <p className="text-xs text-muted-foreground mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      Belanja Rp {(500000 - total).toLocaleString('id-ID')} lagi untuk gratis ongkir!
                    </p>
                  )}

                  <Button 
                    variant="default"
                    onClick={handleCheckout} 
                    className="!bg-black hover:!bg-gray-900 text-white text-lg py-6 rounded-md w-full mb-3"
                  >
                    Lanjut ke Checkout
                  </Button>

                  <Link to="/catalog">
                    <Button variant="outline" className="w-full text-lg py-6 rounded-md">
                      Lanjut Belanja
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}