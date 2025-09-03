-- Create profiles table with role system
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin function to check roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies for images
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admins can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admins can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND public.is_admin());

-- Update trips policies for admin access
DROP POLICY IF EXISTS "trips_admin_all" ON public.trips;
DROP POLICY IF EXISTS "trips_public_read" ON public.trips;

CREATE POLICY "trips_public_read" ON public.trips
  FOR SELECT USING (is_active = true);

CREATE POLICY "trips_admin_all" ON public.trips
  FOR ALL USING (public.is_admin());

-- Update reservations policies
DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;
DROP POLICY IF EXISTS "reservations_own_read" ON public.reservations;
DROP POLICY IF EXISTS "reservations_create" ON public.reservations;

CREATE POLICY "reservations_user_read" ON public.reservations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "reservations_user_create" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL USING (public.is_admin());

-- Update contact_messages policies
DROP POLICY IF EXISTS "contact_messages_admin_read" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_create" ON public.contact_messages;

CREATE POLICY "contact_messages_create" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_all" ON public.contact_messages
  FOR ALL USING (public.is_admin());

-- Update vouchers policies
DROP POLICY IF EXISTS "vouchers_admin_all" ON public.vouchers;
DROP POLICY IF EXISTS "vouchers_public_read" ON public.vouchers;

CREATE POLICY "vouchers_public_read" ON public.vouchers
  FOR SELECT USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "vouchers_admin_all" ON public.vouchers
  FOR ALL USING (public.is_admin());

-- Trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();