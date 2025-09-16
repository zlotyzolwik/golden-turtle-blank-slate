-- Create policy to allow public access to images  
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');