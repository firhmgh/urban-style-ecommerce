import { supabase } from './supabase';
import { Product, Category} from './mock-data';

// --- PRODUCTS ---

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  // Mapping jika nama kolom di DB beda (misal category_id -> categoryId)
  return data.map((item: any) => ({
    ...item,
    categoryId: item.category_id, 
  })) as Product[];
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  
  return {
    ...data,
    categoryId: data.category_id,
  } as Product;
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4);

  if (error) return [];
  
  return data.map((item: any) => ({
    ...item,
    categoryId: item.category_id,
  })) as Product[];
}

// --- CATEGORIES ---

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) return [];
  return data as Category[];
}

// --- ORDERS ---

export async function createOrder(orderData: any) {
  // 1. Insert Header
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      customer_id: orderData.customerId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      status: 'pending',
      total: orderData.total,
      shipping_address: orderData.shippingAddress, 
      payment_method: orderData.paymentMethod
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert Items
  const items = orderData.items.map((item: any) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.productName,
    quantity: item.quantity,
    price: item.price,
    size: item.size
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items);

  if (itemsError) throw itemsError;

  return order;
}