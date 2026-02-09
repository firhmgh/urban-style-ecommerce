import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string; // ubah dari categoryId ke category_id (sesuai DB)
  images: string[];
  sizes: string[];
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: '',
    sizes: '',
    featured: false,
  });

  // Fetch data real dari Supabase
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Ambil semua produk
      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (prodError) throw prodError;

      // Ambil semua kategori
      const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (catError) throw catError;

      setProducts(prods || []);
      setCategories(cats || []);
    } catch (error: any) {
      console.error('Error fetching products/categories:', error);
      toast.error('Gagal memuat data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category_id || !formData.price || !formData.stock) {
      toast.error('Lengkapi semua field wajib');
      return;
    }

    const productData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      category_id: formData.category_id,
      images: formData.images.split(',').map(url => url.trim()).filter(Boolean),
      sizes: formData.sizes.split(',').map(size => size.trim()).filter(Boolean),
      featured: formData.featured,
    };

    try {
      if (editingProduct) {
        // UPDATE
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Produk berhasil diupdate');
      } else {
        // INSERT (id biarkan auto-generate oleh Supabase jika tipe uuid, atau generate manual jika text)
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Produk berhasil ditambahkan');
      }

      fetchData(); // Refresh tabel
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Gagal menyimpan produk: ' + error.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id,
      images: product.images?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      featured: product.featured || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Produk berhasil dihapus');
      fetchData(); // Refresh
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: '',
      sizes: '',
      featured: false,
    });
    setEditingProduct(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout title="Manajemen Produk">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            Kelola produk yang tersedia di toko
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category_id">Kategori</Label>
                    <Select value={filterCategory} onValueChange={(value: string) => setFilterCategory(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="price">Harga (Rp)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="images">URL Gambar (pisahkan dengan koma)</Label>
                  <Input
                    id="images"
                    name="images"
                    value={formData.images}
                    onChange={handleInputChange}
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sizes">Ukuran (pisahkan dengan koma)</Label>
                  <Input
                    id="sizes"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleInputChange}
                    placeholder="S, M, L, XL"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Tampilkan sebagai produk unggulan
                  </Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Produk' : 'Tambah Produk'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Cari nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Memuat data produk...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Tidak ada produk ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => {
                const category = categories.find(c => c.id === product.category_id);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.sizes?.join(', ') || '-'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category?.name || '-'}</TableCell>
                    <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock < 20 ? 'destructive' : product.stock === 0 ? 'secondary' : 'default'}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.featured && (
                        <Badge className="bg-accent">Unggulan</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Menampilkan {filteredProducts.length} dari {products.length} produk
      </p>
    </AdminLayout>
  );
}