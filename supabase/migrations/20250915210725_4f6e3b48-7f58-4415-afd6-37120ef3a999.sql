-- Create a function to restore trip spots
CREATE OR REPLACE FUNCTION public.restore_trip_spots(
  p_trip_id uuid, 
  p_spots_to_restore integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.trips 
  SET available_spots = available_spots + p_spots_to_restore,
      updated_at = now()
  WHERE id = p_trip_id;
END;
$function$;