-- Create trips table for travel offers
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  destination TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PLN',
  departure_date DATE,
  return_date DATE,
  available_spots INTEGER DEFAULT 0,
  total_spots INTEGER DEFAULT 0,
  featured_image TEXT,
  gallery_images TEXT[],
  itinerary JSONB,
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  number_of_people INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PLN',
  recipient_email TEXT,
  recipient_name TEXT,
  sender_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'active',
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- RLS policies for trips (public read, authenticated admin write)
CREATE POLICY "trips_public_read" ON public.trips
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "trips_admin_all" ON public.trips
  FOR ALL
  USING (true);

-- RLS policies for reservations
CREATE POLICY "reservations_own_read" ON public.reservations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "reservations_create" ON public.reservations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "reservations_admin_all" ON public.reservations
  FOR ALL
  USING (true);

-- RLS policies for contact messages
CREATE POLICY "contact_messages_create" ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "contact_messages_admin_read" ON public.contact_messages
  FOR SELECT
  USING (true);

-- RLS policies for vouchers
CREATE POLICY "vouchers_public_read" ON public.vouchers
  FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "vouchers_admin_all" ON public.vouchers
  FOR ALL
  USING (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.trips (title, description, detailed_description, destination, price, departure_date, return_date, available_spots, total_spots, featured_image, itinerary, location_lat, location_lng) VALUES
(
  'Magiczna Toskania - 7 dni',
  'Odkryj piękno Toskanii: Florencja, Siena, winnice Chianti',
  'Niesamowita podróż przez serce Włoch. Zwiedzisz najpiękniejsze miasta Toskanii, skosztjesz lokalnych win i poznasz bogactwo kultury renesansu.',
  'Toskania, Włochy',
  2499.00,
  '2024-05-15',
  '2024-05-22',
  8,
  20,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  '{"day1": "Przylot do Florencji, spacer po centrum", "day2": "Zwiedzanie Uffizi i Ponte Vecchio", "day3": "Wycieczka do Sieny", "day4": "Degustacja win w Chianti", "day5": "San Gimignano i Volterra", "day6": "Piza i Lucca", "day7": "Powrót do kraju"}',
  43.7696,
  11.2558
),
(
  'Perła Adriatyku - Chorwacja',
  'Dubrownik, Split, Wyspy - 10 dni nad morzem',
  'Wybrzeże Dalmacji zachwyci Cię krystalicznie czystą wodą i średniowiecznymi miastami. Idealna wycieczka dla miłośników słońca i historii.',
  'Chorwacja',
  1899.00,
  '2024-06-10',
  '2024-06-20',
  12,
  25,
  'https://images.unsplash.com/photo-1555990538-c8f1760d8dbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  '{"day1": "Przylot do Dubrownika", "day2": "Zwiedzanie Starego Miasta", "day3": "Wycieczka na Lokrum", "day4": "Podróż do Splitu", "day5": "Pałac Dioklecjana", "day6": "Wyspa Hvar", "day7": "Wyspa Brač", "day8": "Park Narodowy Krka", "day9": "Wolny dzień", "day10": "Powrót"}',
  42.6507,
  18.0944
),
(
  'Wielkanoc w Pradze',
  'Złota Praha i czeskie tradycje - 4 dni',
  'Magiczna Praha w okresie wielkanocnym. Odkryj średniowieczne uroki miasta stu wież i poznaj czeskie tradycje świąteczne.',
  'Praga, Czechy',
  899.00,
  '2024-03-28',
  '2024-03-31',
  15,
  30,
  'https://images.unsplash.com/photo-1541849546-216549ae216d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  '{"day1": "Przylot, spacer po Starym Mieście", "day2": "Zamek Praski i Mała Strana", "day3": "Wielkanocne targi, Wyszehrad", "day4": "Kutná Hora, powrót"}',
  50.0755,
  14.4378
);