import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.user_metadata?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const translateError = (errorMessage: string = '') => {
    const msg = errorMessage.toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid password')) {
      return 'Email atau kata sandi salah.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Email belum diverifikasi.';
    }
    return 'Terjadi kesalahan sistem.';
  };

  // Fungsi validasi email manual
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Manual (Menggantikan Pop-up Browser)
    if (!email) {
      toast.warning('Email wajib diisi.');
      return;
    }
    if (!isValidEmail(email)) {
      toast.warning('Format email tidak valid (harus mengandung @ dan domain).');
      return;
    }
    if (!password) {
      toast.warning('Kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Login berhasil! Mengalihkan...');
      } else {
        const indoMessage = translateError(result.error);
        toast.error('Gagal Masuk', { description: indoMessage });
      }
    } catch (error) {
      toast.error('Kesalahan Koneksi', { description: 'Periksa internet Anda.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold inline-block">
            URBAN STYLE
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Masuk ke Akun</h2>
          <p className="mt-2 text-muted-foreground">
            Belum punya akun?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-border">
          {/* Tambahkan noValidate agar pop-up browser bahasa Inggris mati */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}