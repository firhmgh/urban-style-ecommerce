import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth-context';
import { useCart } from '../lib/cart-context';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, isAdmin, profile } = useAuth();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper untuk nama tampilan (prioritas dari profiles)
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={user ? '/home' : '/'} className="text-2xl font-bold tracking-tight text-black">
              URBAN STYLE
            </Link>
          </div>

          {/* Desktop Navigation - DIPERBAIKI: Menggunakan gap-8 dan padding pada Link */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link to="/home" className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2">
                  Beranda
                </Link>
                <Link to="/catalog" className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2">
                  Katalog
                </Link>
                <Link to="/orders" className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2">
                  Pesanan Saya
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-black hover:text-gray-700 transition-colors px-2">
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2">
                  Beranda
                </Link>
                <Link to="/catalog" className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2">
                  Katalog
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions (Desktop) - DIPERBAIKI: Jarak antar icon dan nama user */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {/* Keranjang */}
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <ShoppingCart className="h-5 w-5 text-gray-700" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* User Info + Logout */}
                <div className="flex items-center gap-4 border-l pl-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                      {displayName}
                    </span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-black">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-black text-white hover:bg-gray-800">Daftar</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t bg-white">
            {user ? (
              <div className="flex flex-col space-y-4 px-4">
                <Link to="/home" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Beranda</Link>
                <Link to="/catalog" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Katalog</Link>
                <Link to="/orders" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Pesanan Saya</Link>
                <Link to="/cart" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Keranjang ({itemCount})</Link>
                <hr />
                <div className="flex items-center gap-3 py-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{displayName}</span>
                </div>
                <Button variant="destructive" onClick={logout} className="w-full">Logout</Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 px-4">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Beranda</Link>
                <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>Katalog</Link>
                <Link to="/login" className="w-full text-center py-2 border rounded">Masuk</Link>
                <Link to="/register" className="w-full text-center py-2 bg-black text-white rounded">Daftar</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}