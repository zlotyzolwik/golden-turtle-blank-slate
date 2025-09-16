-- Bezpośrednie utworzenie profilu administratora dla paulakruszewska@wp.pl
-- To będzie działać tylko jeśli konto auth zostanie utworzone w panelu Supabase

-- Funkcja do utworzenia profilu administratora
CREATE OR REPLACE FUNCTION create_admin_profile(
  user_uuid uuid,
  user_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (user_uuid, user_email, 'admin', 'Paula', 'Kruszewska')
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
END;
$$;