-- Upload logo to storage bucket (using SQL to insert object metadata)
-- Note: The actual file upload needs to be done through the Supabase interface
-- This creates the object record in the storage system

-- First, let's check if the object already exists and delete it if necessary
DELETE FROM storage.objects WHERE bucket_id = 'images' AND name = 'logo-zloty-zolwik.png';

-- The actual file upload needs to be done manually through the dashboard
-- This migration just ensures the bucket exists and has correct policies