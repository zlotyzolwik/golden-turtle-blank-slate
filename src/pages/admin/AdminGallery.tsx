import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  image_path: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zdjęć z galerii.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile || !newImageTitle.trim()) {
      toast({
        title: "Błąd",
        description: "Wybierz plik i podaj tytuł zdjęcia.",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `gallery/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert([{
          title: newImageTitle,
          description: newImageDescription,
          image_url: data.publicUrl,
          image_path: fileName,
          display_order: images.length,
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Sukces",
        description: "Zdjęcie zostało dodane do galerii.",
      });

      // Reset form
      setSelectedFile(null);
      setNewImageTitle("");
      setNewImageDescription("");
      setPreviewUrl("");
      setDialogOpen(false);
      
      // Refresh list
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać zdjęcia do galerii.",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleImageStatus = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_active: !image.is_active })
        .eq('id', image.id);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === image.id ? { ...img, is_active: !img.is_active } : img
      ));

      toast({
        title: "Sukces",
        description: `Zdjęcie zostało ${!image.is_active ? 'aktywowane' : 'dezaktywowane'}.`,
      });
    } catch (error) {
      console.error('Error toggling image status:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu zdjęcia.",
        variant: "destructive",
      });
    }
  };

  const deleteImage = async (image: GalleryImage) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([image.image_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      setImages(images.filter(img => img.id !== image.id));
      toast({
        title: "Sukces",
        description: "Zdjęcie zostało usunięte z galerii.",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zdjęcia.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Galeria wspomnień</h2>
          <p className="text-muted-foreground">Zarządzaj zdjęciami w galerii wspomnień.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj zdjęcie
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Dodaj nowe zdjęcie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-file">Wybierz zdjęcie</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="image-title">Tytuł</Label>
                <Input
                  id="image-title"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                  placeholder="Tytuł zdjęcia"
                />
              </div>
              
              <div>
                <Label htmlFor="image-description">Opis (opcjonalny)</Label>
                <Textarea
                  id="image-description"
                  value={newImageDescription}
                  onChange={(e) => setNewImageDescription(e.target.value)}
                  placeholder="Opis zdjęcia"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={uploadImage} disabled={uploadLoading} className="flex-1">
                  {uploadLoading ? "Dodawanie..." : "Dodaj zdjęcie"}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Anuluj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                image.is_active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {image.is_active ? 'Aktywne' : 'Nieaktywne'}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{image.title}</CardTitle>
              {image.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {image.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleImageStatus(image)}
                >
                  {image.is_active ? (
                    <EyeOff className="mr-1 h-3 w-3" />
                  ) : (
                    <Eye className="mr-1 h-3 w-3" />
                  )}
                  {image.is_active ? 'Ukryj' : 'Pokaż'}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Usuń zdjęcie</AlertDialogTitle>
                      <AlertDialogDescription>
                        Czy na pewno chcesz usunąć to zdjęcie? Ta akcja nie może być cofnięta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteImage(image)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Usuń
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Brak zdjęć w galerii.</p>
        </div>
      )}
    </div>
  );
}