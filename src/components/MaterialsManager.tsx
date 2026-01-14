import { useState, useEffect } from 'react';
import { serverFetch } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Edit, Trash2, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';

interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  difficulty: string;
  createdAt: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  created_by?: string;
}

interface MaterialsManagerProps {
  session: any;
}

export function MaterialsManager({ session }: MaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await serverFetch('/materials', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error mengambil bahan:', error);
      toast.error('Gagal memuatkan naik bahan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const materialData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      content: formData.get('content') as string,
      difficulty: formData.get('difficulty') as string,
      approval_status: 'pending' as const, // Default to pending for new materials
    };

    try {
      if (editingMaterial) {
        // Update existing material - preserve existing approval_status
        const updateData = {
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          content: formData.get('content') as string,
          difficulty: formData.get('difficulty') as string,
          // Don't modify approval_status on edit - preserve existing status
        };
        
        const response = await serverFetch(`/materials/${editingMaterial.id.replace('material:', '')}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error('Gagal mengemaskini bahan');
        toast.success('Bahan Berjaya dikemaskini');
      } else {
        // Create new material with pending status
        const response = await serverFetch('/materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(materialData),
        });

        if (!response.ok) throw new Error('Gagal menambah Bahan');
        toast.success('Bahan Berjaya ditambah! Ia akan menunggu kelulusan sehingga disemak oleh guru dalam Editor Kandungan.', {
          duration: 6000
        });
      }

      setDialogOpen(false);
      setEditingMaterial(null);
      fetchMaterials();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Error save bahan:', error);
      toast.error(error.message || 'Gagal untuk save bahan');
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('Adakah anda pasti untuk delete bahan ini?')) return;

    try {
      const response = await serverFetch(`/materials/${materialId.replace('material:', '')}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Gagal untuk delete bahan');
      toast.success('Bahan Berjaya delete');
      fetchMaterials();
    } catch (error: any) {
      console.error('Error delete bahan:', error);
      toast.error(error.message || 'Gagal untuk delete bahan');
    }
  };

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material);
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Memuatkan naik Bahan...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-gray-900">HCI Bahan Pembelajaran</h2>
          <p className="text-gray-600 mt-1">Urus kandungan dan sumber kursus anda</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingMaterial(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Bahan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? 'Edit Bahan' : 'Tambah Bahan Baharu'}</DialogTitle>
              <DialogDescription>
                {editingMaterial ? 'Kemas kini butiran bahan pembelajaran' : 'Cipta bahan pembelajaran HCI baharu'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tajuk</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Pengenalan kepada Prinsip HCI"
                  defaultValue={editingMaterial?.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Penerangan ringkas tentang bahan tersebut"
                  defaultValue={editingMaterial?.description}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" defaultValue={editingMaterial?.category || 'fundamentals'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fundamentals">Asas</SelectItem>
                      <SelectItem value="design-principles">Prinsip Reka Bentuk</SelectItem>
                      <SelectItem value="usability">Kebolehgunaan</SelectItem>
                      <SelectItem value="prototyping">Prototaip</SelectItem>
                      <SelectItem value="evaluation">Penilaian</SelectItem>
                      <SelectItem value="accessibility">Kebolehcapaian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Kesusahan</Label>
                  <Select name="difficulty" defaultValue={editingMaterial?.difficulty || 'beginner'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kesusahan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Pemula</SelectItem>
                      <SelectItem value="intermediate">Pertengahan</SelectItem>
                      <SelectItem value="advanced">Lanjutan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Kandungan</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Kandungan penuh bahan pembelajaran"
                  rows={10}
                  defaultValue={editingMaterial?.content}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setEditingMaterial(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMaterial ? 'Kemaskini Bahan' : 'Tambah Bahan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tiada bahan lagi. Tambahkan bahan pembelajaran pertama anda!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info banner about approval system */}
          {materials.some(m => m.approval_status === 'pending') && (
            <Alert className="bg-blue-50 border-blue-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Kelulusan Diperlukan:</strong> Bahan baharu sedang menunggu kelulusan dan tidak akan kelihatan kepada pelajar sehingga diluluskan oleh guru dalam tab "Kandungan Pengguna" Editor Kandungan.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="line-clamp-1">{material.title}</CardTitle>
                        {material.approval_status === 'pending' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Menunggu Kelulusan
                          </Badge>
                        )}
                        {material.approval_status === 'approved' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Diluluskan
                          </Badge>
                        )}
                        {material.approval_status === 'rejected' && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                            <XCircle className="w-3 h-3 mr-1" />
                            Tidak Diluluskan
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {material.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                      {material.category}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {material.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {material.content}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(material)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}