import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import { supabase } from "./supabase";
import { toast } from "sonner";
import { Product } from "./mock-data";

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, size: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Cart saat user login/logout berubah
  useEffect(() => {
    if (user) {
      fetchCartFromDB();
    } else {
      // Jika logout, ambil dari localStorage (keranjang tamu)
      const savedCart = localStorage.getItem("cart");
      setItems(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [user]);

  const fetchCartFromDB = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, size, product:products(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error("Gagal mengambil keranjang:", error);
    } else if (data) {
      // Mapping data dari DB ke format CartItem aplikasi
      const formattedItems: CartItem[] = data.map((item: any) => ({
        ...item.product, // spread data produk
        categoryId: item.product.category_id,
        quantity: item.quantity,
        selectedSize: item.size,
      }));
      setItems(formattedItems);
    }
    setLoading(false);
  };

  const addToCart = async (product: Product, size: string) => {
    // Logic Optimistic Update (UI update duluan biar cepet)
    const newItem = { ...product, quantity: 1, selectedSize: size };
    let newItems = [...items];
    const existingItemIndex = items.findIndex(
      (item) => item.id === product.id && item.selectedSize === size
    );

    if (existingItemIndex > -1) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push(newItem);
    }
    setItems(newItems); // Update state UI

    if (!user) {
      // Simpan ke LocalStorage untuk tamu
      localStorage.setItem("cart", JSON.stringify(newItems));
      toast.success("Produk ditambahkan ke keranjang");
    } else {
      // Simpan ke Database untuk user login
      try {
        // Cek apakah item sudah ada di DB
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .match({ user_id: user.id, product_id: product.id, size: size })
          .single();

        if (existing) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id);
        } else {
          // Insert baru
          await supabase.from('cart_items').insert({
            user_id: user.id,
            product_id: product.id,
            size: size,
            quantity: 1
          });
        }
        toast.success("Produk ditambahkan ke keranjang");
      } catch (error) {
        toast.error("Gagal menyimpan ke database");
        // Rollback state jika error (opsional)
      }
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    const newItems = items.filter(
      (item) => !(item.id === productId && item.selectedSize === size)
    );
    setItems(newItems);

    if (!user) {
      localStorage.setItem("cart", JSON.stringify(newItems));
    } else {
      await supabase
        .from('cart_items')
        .delete()
        .match({ user_id: user.id, product_id: productId, size: size });
    }
    toast.success("Produk dihapus dari keranjang");
  };

  const updateQuantity = async (productId: string, quantity: number, size: string) => {
    if (quantity < 1) return;

    const newItems = items.map((item) =>
      item.id === productId && item.selectedSize === size
        ? { ...item, quantity }
        : item
    );
    setItems(newItems);

    if (!user) {
      localStorage.setItem("cart", JSON.stringify(newItems));
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .match({ user_id: user.id, product_id: productId, size: size });
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (!user) {
      localStorage.removeItem("cart");
    } else {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}