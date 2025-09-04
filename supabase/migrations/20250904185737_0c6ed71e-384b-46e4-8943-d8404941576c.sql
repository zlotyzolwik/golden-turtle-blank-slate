-- Create gallery_images table for managing memory gallery
CREATE TABLE public.gallery_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  image_path text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery images
CREATE POLICY "gallery_images_public_read" 
ON public.gallery_images 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "gallery_images_admin_all" 
ON public.gallery_images 
FOR ALL 
USING (is_admin());

-- Create trigger for timestamps
CREATE TRIGGER update_gallery_images_updated_at
BEFORE UPDATE ON public.gallery_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for gallery images
CREATE POLICY "Gallery images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'gallery');

CREATE POLICY "Admins can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'gallery' AND is_admin());

CREATE POLICY "Admins can update gallery images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'gallery' AND is_admin());

CREATE POLICY "Admins can delete gallery images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'gallery' AND is_admin());