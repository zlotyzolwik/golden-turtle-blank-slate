-- Upload logo to storage bucket (this will be done manually)
-- The logo file should be uploaded to the 'images' bucket with path 'logo-zloty-zolwik.png'

-- Ensure the images bucket allows public access for the logo
UPDATE storage.buckets 
SET public = true 
WHERE id = 'images';