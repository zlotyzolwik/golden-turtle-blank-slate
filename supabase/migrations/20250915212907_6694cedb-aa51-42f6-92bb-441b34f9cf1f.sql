-- Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Add customer_id to reservations table
ALTER TABLE public.reservations 
ADD COLUMN customer_id uuid REFERENCES public.customers(id);

-- Make user_id nullable in reservations (for guest purchases)
ALTER TABLE public.reservations 
ALTER COLUMN user_id DROP NOT NULL;

-- Add customer_id to vouchers table  
ALTER TABLE public.vouchers
ADD COLUMN customer_id uuid REFERENCES public.customers(id);

-- Create function to create or get customer
CREATE OR REPLACE FUNCTION public.create_or_get_customer(
  p_email text,
  p_name text,
  p_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  customer_id uuid;
BEGIN
  -- Try to find existing customer
  SELECT id INTO customer_id
  FROM public.customers
  WHERE email = p_email;
  
  -- If not found, create new customer
  IF customer_id IS NULL THEN
    INSERT INTO public.customers (email, name, phone)
    VALUES (p_email, p_name, p_phone)
    RETURNING id INTO customer_id;
  END IF;
  
  RETURN customer_id;
END;
$$;

-- Create guest reservation function
CREATE OR REPLACE FUNCTION public.create_reservation_guest(
  p_trip_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_total_price numeric,
  p_customer_phone text DEFAULT NULL,
  p_number_of_people integer DEFAULT 1,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(success boolean, reservation_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_reservation_id uuid;
  current_spots integer;
  customer_id uuid;
BEGIN
  -- Validate number of people
  IF p_number_of_people <= 0 THEN
    RETURN QUERY SELECT false, null::uuid, 'Liczba osób musi być większa niż 0'::text;
    RETURN;
  END IF;

  -- Lock the trip record and check availability atomically
  SELECT available_spots INTO current_spots
  FROM public.trips 
  WHERE id = p_trip_id AND is_active = true
  FOR UPDATE;

  -- Validate trip exists and is active
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, 'Wycieczka nie istnieje lub jest nieaktywna'::text;
    RETURN;
  END IF;

  -- Check if enough spots are available
  IF current_spots < p_number_of_people THEN
    RETURN QUERY SELECT false, null::uuid, 'Brak wystarczającej liczby dostępnych miejsc'::text;
    RETURN;
  END IF;

  -- Create or get customer
  customer_id := public.create_or_get_customer(p_customer_email, p_customer_name, p_customer_phone);

  -- Update available spots atomically
  UPDATE public.trips 
  SET available_spots = available_spots - p_number_of_people,
      updated_at = now()
  WHERE id = p_trip_id;

  -- Insert reservation with customer_id
  INSERT INTO public.reservations (
    trip_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    number_of_people,
    notes,
    total_price,
    status,
    payment_status
  ) VALUES (
    p_trip_id,
    customer_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_number_of_people,
    p_notes,
    p_total_price,
    'pending',
    'pending'
  ) RETURNING id INTO new_reservation_id;

  RETURN QUERY SELECT true, new_reservation_id, 'Rezerwacja została utworzona pomyślnie'::text;
END;
$$;

-- Create voucher function for guests
CREATE OR REPLACE FUNCTION public.create_voucher_guest(
  voucher_amount numeric,
  buyer_email text,
  buyer_name text,
  voucher_currency text DEFAULT 'PLN'::text,
  sender_name text DEFAULT NULL::text,
  recipient_name text DEFAULT NULL::text,
  recipient_email text DEFAULT NULL::text,
  voucher_message text DEFAULT NULL::text,
  expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone,
  buyer_phone text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, voucher_code text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_code text;
  voucher_id uuid;
  customer_id uuid;
BEGIN
  -- Create or get customer
  customer_id := public.create_or_get_customer(buyer_email, buyer_name, buyer_phone);
  
  -- Generate unique voucher code
  new_code := 'VOUCHER-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert new voucher
  INSERT INTO public.vouchers (
    code, amount, currency, sender_name, recipient_name, 
    recipient_email, message, expires_at, status, buyer_email, customer_id
  ) VALUES (
    new_code, voucher_amount, voucher_currency, sender_name, 
    recipient_name, recipient_email, voucher_message, expires_at, 'active', buyer_email, customer_id
  ) RETURNING id INTO voucher_id;
  
  RETURN QUERY SELECT true, new_code, 'Voucher został utworzony pomyślnie'::text;
END;
$$;

-- RLS policies for customers table
CREATE POLICY "Customers can be created by anyone" 
ON public.customers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Customers viewable by admins" 
ON public.customers 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Customers updatable by admins" 
ON public.customers 
FOR UPDATE 
USING (is_admin());

-- Update RLS policies for reservations
DROP POLICY IF EXISTS "reservations_user_read" ON public.reservations;
DROP POLICY IF EXISTS "reservations_user_create" ON public.reservations;
DROP POLICY IF EXISTS "reservations_user_update" ON public.reservations;

CREATE POLICY "reservations_guest_create" 
ON public.reservations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "reservations_customer_read" 
ON public.reservations 
FOR SELECT 
USING (is_admin());

-- Update RLS policies for vouchers
CREATE POLICY "vouchers_guest_create" 
ON public.vouchers 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for customers updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();