import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  // Fetch categories dari Supabase saat komponen mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  setLoading(true);
  try {
    console.log('Fetching categories...');
    const { data, error, count } = await supabase
      .from('categories')
      .select('id, name, slug, description', { count: 'exact' })
      .order('name', { ascending: true });

    console.log('Fetch result:', { data, error, count });

    if (error) throw error;
    setCategories(data || []);
  } catch (error: any) {
    console.error('Error fetching categories:', error.message);
    toast.error('Gagal memuat kategori: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug dari name jika field name berubah
      ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error('Nama dan slug harus diisi');
      return;
    }

    try {
      if (editingCategory) {
        // Update kategori yang ada
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast.success('Kategori berhasil diupdate');
      } else {
        // Tambah kategori baru
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
          });

        if (error) throw error;

        toast.success('Kategori berhasil ditambahkan');
      }

      // Refresh data dari DB
      fetchCategories();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Gagal menyimpan kategori');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Kategori berhasil dihapus');
      fetchCategories(); // Refresh tabel
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Gagal menghapus kategori');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
    });
    setEditingCategory(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-muted-foreground">
          Kelola kategori produk toko Anda
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="T-Shirt"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="t-shirt"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly version (auto-generated from name)
                </p>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi kategori produk..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Update Kategori' : 'Tambah Kategori'}
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

      {loading ? (
        <div className="text-center py-10">Memuat kategori...</div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Belum ada kategori. Tambahkan sekarang!
                  </TableCell>
                </TableRow>
              ) : (
                categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="max-w-md truncate">{category.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}