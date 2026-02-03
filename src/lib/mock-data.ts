export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  sizes: string[];
  featured: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    size: string;
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: string;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'T-Shirt',
    slug: 't-shirt',
    description: 'Koleksi t-shirt premium dengan desain eksklusif'
  },
  {
    id: '2',
    name: 'Hoodie',
    slug: 'hoodie',
    description: 'Hoodie streetwear dengan material berkualitas'
  },
  {
    id: '3',
    name: 'Jacket',
    slug: 'jacket',
    description: 'Jacket urban style untuk tampilan keren'
  },
  {
    id: '4',
    name: 'Pants',
    slug: 'pants',
    description: 'Celana casual dan street wear'
  },
  {
    id: '5',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Aksesoris pelengkap penampilan'
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Urban Black Oversized Tee',
    slug: 'urban-black-oversized-tee',
    description: 'T-shirt oversized dengan material cotton combed 30s. Desain minimalis yang cocok untuk daily wear. Nyaman dipakai seharian.',
    price: 149000,
    stock: 45,
    categoryId: '1',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    featured: true
  },
  {
    id: '2',
    name: 'Streetwear Graphic Tee White',
    slug: 'streetwear-graphic-tee-white',
    description: 'T-shirt putih dengan graphic print eksklusif. Limited edition design yang hanya tersedia di Urban Style Jakarta.',
    price: 169000,
    stock: 32,
    categoryId: '1',
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    featured: true
  },
  {
    id: '3',
    name: 'Premium Hoodie Black Edition',
    slug: 'premium-hoodie-black-edition',
    description: 'Hoodie hitam premium dengan fleece lining. Hangat dan nyaman, cocok untuk cuaca dingin atau ruangan ber-AC.',
    price: 349000,
    stock: 28,
    categoryId: '2',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    featured: true
  },
  {
    id: '4',
    name: 'Vintage Hoodie Grey',
    slug: 'vintage-hoodie-grey',
    description: 'Hoodie abu-abu dengan wash effect vintage. Memberikan kesan kasual namun tetap stylish.',
    price: 329000,
    stock: 18,
    categoryId: '2',
    images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    featured: false
  },
  {
    id: '5',
    name: 'Bomber Jacket Urban Style',
    slug: 'bomber-jacket-urban-style',
    description: 'Bomber jacket signature Urban Style. Material parasut berkualitas dengan lining hangat. Perfect untuk riding atau hangout.',
    price: 499000,
    stock: 15,
    categoryId: '3',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    sizes: ['M', 'L', 'XL'],
    featured: true
  },
  {
    id: '6',
    name: 'Denim Jacket Classic',
    slug: 'denim-jacket-classic',
    description: 'Jaket denim klasik yang timeless. Bisa dikombinasikan dengan outfit apapun. Material denim premium.',
    price: 449000,
    stock: 22,
    categoryId: '3',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    featured: false
  },
  {
    id: '7',
    name: 'Cargo Pants Black',
    slug: 'cargo-pants-black',
    description: 'Celana cargo hitam dengan banyak kantong. Material stretch untuk kenyamanan maksimal. Street style essential.',
    price: 279000,
    stock: 35,
    categoryId: '4',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
    sizes: ['28', '29', '30', '31', '32', '33', '34'],
    featured: true
  },
  {
    id: '8',
    name: 'Jogger Pants Grey',
    slug: 'jogger-pants-grey',
    description: 'Jogger pants abu-abu yang nyaman untuk aktivitas sehari-hari. Material cotton fleece yang soft.',
    price: 249000,
    stock: 40,
    categoryId: '4',
    images: ['https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    featured: false
  },
  {
    id: '9',
    name: 'Snapback Urban Logo',
    slug: 'snapback-urban-logo',
    description: 'Topi snapback dengan bordir logo Urban Style. Premium quality dengan adjustable strap.',
    price: 129000,
    stock: 50,
    categoryId: '5',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800'],
    sizes: ['One Size'],
    featured: false
  },
  {
    id: '10',
    name: 'Canvas Tote Bag',
    slug: 'canvas-tote-bag',
    description: 'Tas tote bag canvas dengan print logo. Cocok untuk daily use, kuliah, atau jalan-jalan.',
    price: 99000,
    stock: 60,
    categoryId: '5',
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
    sizes: ['One Size'],
    featured: false
  },
  {
    id: '11',
    name: 'Typography Tee Navy',
    slug: 'typography-tee-navy',
    description: 'T-shirt navy dengan typography design yang minimalis. Comfortable fit untuk daily outfit.',
    price: 159000,
    stock: 38,
    categoryId: '1',
    images: ['https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800'],
    sizes: ['S', 'M', 'L', 'XL'],
    featured: false
  },
  {
    id: '12',
    name: 'Colorblock Hoodie Red',
    slug: 'colorblock-hoodie-red',
    description: 'Hoodie dengan kombinasi warna merah yang eye-catching. Statement piece untuk street outfit.',
    price: 369000,
    stock: 12,
    categoryId: '2',
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'],
    sizes: ['M', 'L', 'XL'],
    featured: true
  }
];

export const orders: Order[] = [
  {
    id: 'ORD-2026-001',
    customerId: '2',
    customerName: 'Customer Test',
    customerEmail: 'customer@test.com',
    date: '2026-02-01T10:30:00',
    status: 'delivered',
    total: 498000,
    items: [
      {
        productId: '1',
        productName: 'Urban Black Oversized Tee',
        quantity: 2,
        price: 149000,
        size: 'L'
      },
      {
        productId: '9',
        productName: 'Snapback Urban Logo',
        quantity: 1,
        price: 129000,
        size: 'One Size'
      }
    ],
    shippingAddress: {
      name: 'Customer Test',
      phone: '081234567890',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      postalCode: '12190'
    },
    paymentMethod: 'Bank Transfer - BCA'
  },
  {
    id: 'ORD-2026-002',
    customerId: '3',
    customerName: 'Budi Santoso',
    customerEmail: 'budi@example.com',
    date: '2026-02-02T14:15:00',
    status: 'processing',
    total: 698000,
    items: [
      {
        productId: '3',
        productName: 'Premium Hoodie Black Edition',
        quantity: 1,
        price: 349000,
        size: 'XL'
      },
      {
        productId: '1',
        productName: 'Urban Black Oversized Tee',
        quantity: 1,
        price: 149000,
        size: 'M'
      }
    ],
    shippingAddress: {
      name: 'Budi Santoso',
      phone: '081298765432',
      address: 'Jl. Gatot Subroto No. 45',
      city: 'Jakarta Pusat',
      postalCode: '10270'
    },
    paymentMethod: 'E-Wallet - GoPay'
  },
  {
    id: 'ORD-2026-003',
    customerId: '4',
    customerName: 'Siti Aminah',
    customerEmail: 'siti@example.com',
    date: '2026-02-03T09:20:00',
    status: 'pending',
    total: 948000,
    items: [
      {
        productId: '5',
        productName: 'Bomber Jacket Urban Style',
        quantity: 1,
        price: 499000,
        size: 'L'
      },
      {
        productId: '6',
        productName: 'Denim Jacket Classic',
        quantity: 1,
        price: 449000,
        size: 'M'
      }
    ],
    shippingAddress: {
      name: 'Siti Aminah',
      phone: '081223344556',
      address: 'Jl. MH Thamrin No. 88',
      city: 'Jakarta Pusat',
      postalCode: '10350'
    },
    paymentMethod: 'Bank Transfer - Mandiri'
  }
];
