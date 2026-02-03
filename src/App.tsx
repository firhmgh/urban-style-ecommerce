import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './lib/auth-context';
import { CartProvider } from './lib/cart-context';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}
