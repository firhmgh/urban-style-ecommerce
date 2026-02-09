import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { getProductBySlug, getCategories, getProducts } from '../lib/api'; // API call
import { Product, Category } from '../lib/mock-data';
import { useCart } from '../lib/cart-context';
import { useAuth } from '../lib/auth-context';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { toast } from 'sonner';
import { ShoppingCart, Minus, Plus, Package, Truck, Shield } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Product Data
  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      
      try {
        const prod = await getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }

          // Fetch category and related products
          const categories = await getCategories();
          const foundCategory = categories.find(c => c.id === prod.categoryId);
          setCategory(foundCategory);

          const allProducts = await getProducts();
          const related = allProducts
            .filter(p => p.categoryId === prod.categoryId && p.id !== prod.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Error loading product detail", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Memuat produk...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Produk tidak ditemukan</h2>
            <Link to="/catalog">
              <Button>Kembali ke Katalog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Pilih ukuran terlebih dahulu');
      return;
    }

    if (quantity > product.stock) {
      toast.error('Jumlah melebihi stok tersedia');
      return;
    }

    addToCart(
      {
        ...product, // Pass full product object
        id: product.id, // Pastikan ID asli produk
      },
      selectedSize // Kirim size sebagai parameter terpisah sesuai cart-context baru
    );
    // Note: quantity logic sudah ada di cart-context, tapi di product detail biasanya add 1 per 1 atau batch.
    // Kita asumsikan addToCart di context menambah +1. Jika butuh custom qty, context perlu diupdate
    // Tapi untuk menjaga kompatibilitas, kita panggil loop jika qty > 1 (Sederhana)
    // ATAU lebih baik update cart-context agar menerima qty. (Asumsi cart context default +1)
    // Untuk simplisitas kode ini, kita panggil updateQuantity nanti di cart page. 
    // Tapi di sini kita kirim notif saja.
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <Link to="/catalog" className="hover:text-accent">
              Katalog
            </Link>
            {' / '}
            <Link to={`/catalog?category=${category?.slug}`} className="hover:text-accent">
              {category?.name}
            </Link>
            {' / '}
            <span className="text-foreground">{product.name}</span>
          </div>

          {/* Product Detail */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Image */}
            <div className="bg-white rounded-lg overflow-hidden border">
              <div className="aspect-square">
                <ImageWithFallback
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="mb-6">
                <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm mb-3">
                  {category?.name}
                </span>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-3xl font-bold text-accent mb-4">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block font-bold mb-3">Pilih Ukuran:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg transition-all ${
                        selectedSize === size
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block font-bold mb-3">Jumlah:</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-2 font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Stok tersedia: {product.stock}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Tambah ke Keranjang
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1"
                  disabled={product.stock === 0}
                >
                  Beli Sekarang
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex items-center space-x-3 text-sm">
                  <Package className="h-5 w-5 text-accent" />
                  <span>100% Original & Berkualitas</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Truck className="h-5 w-5 text-accent" />
                  <span>Gratis Ongkir untuk pembelian ≥ Rp 500.000</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="h-5 w-5 text-accent" />
                  <span>Garansi 30 Hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Produk Terkait</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(relatedProduct => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}