import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { products } from '../lib/mock-data';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Truck, Shield, CreditCard } from 'lucide-react';

export default function Landing() {
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Urban Streetwear<br />untuk Gaya Hidup Modern
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              Koleksi eksklusif fashion streetwear terbaik di Jakarta. Ekspresikan style kamu dengan Urban Style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                  Mulai Belanja
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                  Lihat Katalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-accent p-3 rounded-lg">
                <Truck className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Gratis Ongkir</h3>
                <p className="text-sm text-muted-foreground">
                  Untuk pembelian minimal Rp 500.000
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-accent p-3 rounded-lg">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Garansi Kualitas</h3>
                <p className="text-sm text-muted-foreground">
                  100% original dan berkualitas premium
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-accent p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Pembayaran Aman</h3>
                <p className="text-sm text-muted-foreground">
                  Berbagai metode pembayaran tersedia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Produk Unggulan</h2>
            <p className="text-muted-foreground">
              Koleksi terbaik pilihan kami untuk kamu
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/catalog">
              <Button size="lg">
                Lihat Semua Produk
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent text-accent-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Upgrade Gaya Kamu?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Daftar sekarang dan dapatkan diskon 10% untuk pembelian pertama!
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Daftar Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
