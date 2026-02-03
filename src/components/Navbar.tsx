import { Link } from 'react-router';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth-context';
import { useCart } from '../lib/cart-context';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="text-xl font-bold">
            URBAN STYLE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/home" className="hover:text-accent transition-colors">
                  Beranda
                </Link>
                <Link to="/catalog" className="hover:text-accent transition-colors">
                  Katalog
                </Link>
                <Link to="/orders" className="hover:text-accent transition-colors">
                  Pesanan Saya
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-accent transition-colors">
                    Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-accent transition-colors">
                  Beranda
                </Link>
                <Link to="/catalog" className="hover:text-accent transition-colors">
                  Katalog
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.name}</span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Daftar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            {user ? (
              <>
                <Link
                  to="/home"
                  className="block py-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beranda
                </Link>
                <Link
                  to="/catalog"
                  className="block py-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Katalog
                </Link>
                <Link
                  to="/orders"
                  className="block py-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pesanan Saya
                </Link>
                <Link
                  to="/cart"
                  className="block py-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Keranjang ({itemCount})
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">Halo, {user.name}</p>
                  <Button variant="outline" size="sm" onClick={logout} className="w-full">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="block py-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Beranda
                </Link>
                <Link
                  to="/catalog"
                  className="block py-2 hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Katalog
                </Link>
                <div className="pt-4 border-t space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Daftar</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
