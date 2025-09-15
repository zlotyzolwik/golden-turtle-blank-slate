-- Fix critical security vulnerability in reservations table

-- Step 1: Make user_id NOT NULL to ensure every reservation has an owner
-- First, update any existing records with NULL user_id (if any exist)
UPDATE public.reservations 
SET user_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE public.reservations 
ALTER COLUMN user_id SET NOT NULL;

-- Step 2: Add comprehensive RLS policies

-- Drop existing policies to rebuild them securely
DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;
DROP POLICY IF EXISTS "reservations_user_create" ON public.reservations;
DROP POLICY IF EXISTS "reservations_user_read" ON public.reservations;

-- Create secure admin policy
CREATE POLICY "reservations_admin_all" 
ON public.reservations 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create secure user read policy
CREATE POLICY "reservations_user_read" 
ON public.reservations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create secure user insert policy (requires authentication and proper user_id)
CREATE POLICY "reservations_user_create" 
ON public.reservations 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Create secure user update policy (users can only update their own reservations)
CREATE POLICY "reservations_user_update" 
ON public.reservations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 3: Create secure function for creating reservations with validation
CREATE OR REPLACE FUNCTION public.create_reservation_secure(
  p_trip_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_total_price numeric,
  p_customer_phone text DEFAULT NULL,
  p_number_of_people integer DEFAULT 1,
  p_notes text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  reservation_id uuid,
  message text
) AS $$
DECLARE
  new_reservation_id uuid;
BEGIN
  -- Validate that user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT false, null::uuid, 'Musisz być zalogowany aby złożyć rezerwację'::text;
    RETURN;
  END IF;

  -- Validate trip exists and is active
  IF NOT EXISTS (SELECT 1 FROM public.trips WHERE id = p_trip_id AND is_active = true) THEN
    RETURN QUERY SELECT false, null::uuid, 'Wycieczka nie istnieje lub jest nieaktywna'::text;
    RETURN;
  END IF;

  -- Validate number of people
  IF p_number_of_people <= 0 THEN
    RETURN QUERY SELECT false, null::uuid, 'Liczba osób musi być większa niż 0'::text;
    RETURN;
  END IF;

  -- Insert reservation with proper user_id
  INSERT INTO public.reservations (
    trip_id,
    user_id,
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
    auth.uid(),  -- Always use authenticated user's ID
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;