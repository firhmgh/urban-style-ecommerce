import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../lib/auth-context';
import { getFeaturedProducts, getCategories, getProducts } from '../lib/api'; // Menggunakan API Supabase
import { Product, Category } from '../lib/mock-data';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { ArrowRight, Tag } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();

  // State untuk menampung data dari Database
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  

  // 1. Cek Login
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  // 2. Ambil Data dari Supabase (Pengganti Mock Data)
  useEffect(() => {
    async function loadData() {
      try {
        const [featuredData, categoryData, allProducts] = await Promise.all([
          getFeaturedProducts(),
          getCategories(),
          getProducts()
        ]);

        setFeaturedProducts(featuredData);
        setCategories(categoryData);
        // Ambil 4 produk terbaru untuk New Arrivals
        setNewArrivals(allProducts.slice(0, 4));
      } catch (error) {
        console.error("Gagal memuat data", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Memuat toko...</p>
      </div>
    );
  }

  // Nama User dari Metadata Supabase (Fallback ke email jika nama kosong)
  const displayName = profile?.full_name 
                   || user?.user_metadata?.full_name 
                   || user?.email?.split('@')[0] 
                   || 'User';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Selamat Datang, {displayName}!
          </h1>
          <p className="text-lg opacity-90">
            Temukan koleksi streetwear terbaru kami
          </p>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-accent text-accent-foreground py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <Tag className="h-5 w-5" />
            <p className="font-medium">
              🔥 FLASH SALE! Diskon hingga 30% untuk produk pilihan!
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">Kategori Produk</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.slug}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-all border hover:border-accent"
              >
                <h3 className="font-bold mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Produk Unggulan</h2>
            <Link to="/catalog">
              <Button variant="ghost">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Produk Terbaru</h2>
            <Link to="/catalog">
              <Button variant="ghost">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Dapatkan Update Terbaru
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe newsletter kami untuk info promo dan koleksi terbaru
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-foreground"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}