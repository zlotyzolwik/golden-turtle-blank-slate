-- Add pickup_locations column to trips table
ALTER TABLE public.trips 
ADD COLUMN pickup_locations TEXT;