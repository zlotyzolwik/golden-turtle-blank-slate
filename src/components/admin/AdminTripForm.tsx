import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Trip } from "@/types/trips";
import { Upload, X } from "lucide-react";

const tripFormSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().min(1, "Opis jest wymagany"),
  detailed_description: z.string().optional(),
  destination: z.string().min(1, "Destynacja jest wymagana"),
  price: z.number().min(0, "Cena musi być większa od 0"),
  currency: z.string().default("PLN"),
  departure_date: z.string().min(1, "Data wyjazdu jest wymagana"),
  return_date: z.string().min(1, "Data powrotu jest wymagana"),
  total_spots: z.number().min(1, "Liczba miejsc musi być większa od 0"),
  available_spots: z.number().min(0, "Dostępne miejsca nie mogą być ujemne"),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface AdminTripFormProps {
  trip?: Trip;
  onSuccess?: () => void;
}

export default function AdminTripForm({ trip, onSuccess }: AdminTripFormProps) {
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>(trip?.featured_image || "");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(trip?.gallery_images || []);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: trip ? {
      title: trip.title,
      description: trip.description,
      detailed_description: trip.detailed_description || "",
      destination: trip.destination,
      price: Number(trip.price),
      currency: trip.currency,
      departure_date: trip.departure_date,
      return_date: trip.return_date,
      total_spots: trip.total_spots,
      available_spots: trip.available_spots,
      location_lat: Number(trip.location_lat) || undefined,
      location_lng: Number(trip.location_lng) || undefined,
    } : {
      currency: "PLN",
      total_spots: 1,
      available_spots: 1,
    },
  });

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = () => setFeaturedImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setGalleryPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const uniqueId = crypto.randomUUID();
    const fileName = `${folder}/${Date.now()}-${uniqueId}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      if (uploadError.message?.includes('already exists')) {
        throw new Error('Plik o tej nazwie już istnieje. Spróbuj ponownie.');
      }
      throw new Error(`Błąd przesyłania pliku: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const onSubmit = async (data: TripFormData) => {
    setLoading(true);
    try {
      let featuredImageUrl = trip?.featured_image || "";
      let galleryImageUrls = trip?.gallery_images || [];

      // Upload featured image if new one selected
      if (featuredImage) {
        featuredImageUrl = await uploadImage(featuredImage, 'trips');
      }

      // Upload gallery images if any new ones selected
      if (galleryImages.length > 0) {
        const newGalleryUrls = await Promise.all(
          galleryImages.map(file => uploadImage(file, 'trips/gallery'))
        );
        galleryImageUrls = [...galleryImageUrls, ...newGalleryUrls];
      }

      const tripData = {
        title: data.title,
        description: data.description,
        detailed_description: data.detailed_description || null,
        destination: data.destination,
        price: data.price,
        currency: data.currency,
        departure_date: data.departure_date,
        return_date: data.return_date,
        total_spots: data.total_spots,
        available_spots: data.available_spots,
        location_lat: data.location_lat || null,
        location_lng: data.location_lng || null,
        featured_image: featuredImageUrl,
        gallery_images: galleryImageUrls,
      };

      if (trip) {
        // Update existing trip
        const { error } = await supabase
          .from('trips')
          .update(tripData)
          .eq('id', trip.id);

        if (error) throw error;

        toast({
          title: "Sukces",
          description: "Wycieczka została zaktualizowana.",
        });
      } else {
        // Create new trip
        const { error } = await supabase
          .from('trips')
          .insert(tripData);

        if (error) throw error;

        toast({
          title: "Sukces",
          description: "Wycieczka została utworzona.",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/trips');
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać wycieczki.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Nazwa wycieczki"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Krótki opis wycieczki"
            />
          </div>

          <div>
            <Label htmlFor="detailed_description">Szczegółowy opis</Label>
            <Textarea
              id="detailed_description"
              {...form.register("detailed_description")}
              placeholder="Szczegółowy opis wycieczki"
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="destination">Destynacja</Label>
            <Input
              id="destination"
              {...form.register("destination")}
              placeholder="Miejsce docelowe"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Szczegóły wycieczki</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Cena</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="currency">Waluta</Label>
              <Input
                id="currency"
                {...form.register("currency")}
                placeholder="PLN"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_date">Data wyjazdu</Label>
              <Input
                id="departure_date"
                type="date"
                {...form.register("departure_date")}
              />
            </div>
            <div>
              <Label htmlFor="return_date">Data powrotu</Label>
              <Input
                id="return_date"
                type="date"
                {...form.register("return_date")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_spots">Łączna liczba miejsc</Label>
              <Input
                id="total_spots"
                type="number"
                {...form.register("total_spots", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="available_spots">Dostępne miejsca</Label>
              <Input
                id="available_spots"
                type="number"
                {...form.register("available_spots", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_lat">Szerokość geograficzna</Label>
              <Input
                id="location_lat"
                type="number"
                step="any"
                {...form.register("location_lat", { valueAsNumber: true })}
                placeholder="52.2297"
              />
            </div>
            <div>
              <Label htmlFor="location_lng">Długość geograficzna</Label>
              <Input
                id="location_lng"
                type="number"
                step="any"
                {...form.register("location_lng", { valueAsNumber: true })}
                placeholder="21.0122"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zdjęcia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="featured_image">Zdjęcie główne</Label>
            <Input
              id="featured_image"
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageChange}
            />
            {featuredImagePreview && (
              <div className="mt-2">
                <img
                  src={featuredImagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="gallery_images">Galeria zdjęć</Label>
            <Input
              id="gallery_images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
            />
            {galleryPreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Zapisywanie..." : trip ? "Aktualizuj" : "Utwórz"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/trips')}
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}