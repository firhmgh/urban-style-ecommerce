import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-8">
          Maaf, halaman yang Anda cari tidak dapat ditemukan.
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
