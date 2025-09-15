-- Update create_reservation_secure function to handle atomic spot reservation
CREATE OR REPLACE FUNCTION public.create_reservation_secure(
  p_trip_id uuid, 
  p_customer_name text, 
  p_customer_email text, 
  p_total_price numeric, 
  p_customer_phone text DEFAULT NULL::text, 
  p_number_of_people integer DEFAULT 1, 
  p_notes text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, reservation_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_reservation_id uuid;
  current_spots integer;
BEGIN
  -- Validate that user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT false, null::uuid, 'Musisz być zalogowany aby złożyć rezerwację'::text;
    RETURN;
  END IF;

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

  -- Update available spots atomically
  UPDATE public.trips 
  SET available_spots = available_spots - p_number_of_people,
      updated_at = now()
  WHERE id = p_trip_id;

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
    auth.uid(),
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
$function$;