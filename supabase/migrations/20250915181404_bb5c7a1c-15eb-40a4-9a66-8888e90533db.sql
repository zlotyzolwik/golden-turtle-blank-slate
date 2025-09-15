-- Remove the vulnerable public read policy for vouchers
DROP POLICY IF EXISTS "vouchers_public_read" ON public.vouchers;

-- Create a secure function for voucher validation by code
CREATE OR REPLACE FUNCTION public.validate_voucher_by_code(voucher_code text)
RETURNS TABLE (
  is_valid boolean,
  voucher_id uuid,
  amount numeric,
  currency text,
  expires_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN v.id IS NOT NULL AND v.status = 'active' AND v.used_at IS NULL 
      AND (v.expires_at IS NULL OR v.expires_at > now()) 
      THEN true 
      ELSE false 
    END as is_valid,
    v.id as voucher_id,
    v.amount,
    v.currency,
    v.expires_at
  FROM public.vouchers v
  WHERE v.code = voucher_code;
  
  -- If no voucher found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, null::numeric, null::text, null::timestamp with time zone;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a secure function to use a voucher (mark as used)
CREATE OR REPLACE FUNCTION public.use_voucher_by_code(voucher_code text, user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  success boolean,
  message text,
  voucher_id uuid,
  amount numeric
) AS $$
DECLARE
  voucher_record record;
BEGIN
  -- Check if voucher exists and is valid
  SELECT * INTO voucher_record FROM public.vouchers 
  WHERE code = voucher_code 
  AND status = 'active' 
  AND used_at IS NULL
  AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Voucher nie istnieje lub jest nieważny'::text, null::uuid, null::numeric;
    RETURN;
  END IF;
  
  -- Mark voucher as used
  UPDATE public.vouchers 
  SET used_at = now()
  WHERE id = voucher_record.id;
  
  RETURN QUERY SELECT true, 'Voucher został pomyślnie wykorzystany'::text, voucher_record.id, voucher_record.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a secure function for public voucher creation (no sensitive data exposed)
CREATE OR REPLACE FUNCTION public.create_voucher_public(
  voucher_amount numeric,
  voucher_currency text DEFAULT 'PLN',
  sender_name text DEFAULT NULL,
  recipient_name text DEFAULT NULL,
  recipient_email text DEFAULT NULL,
  voucher_message text DEFAULT NULL,
  expires_at timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  voucher_code text,
  message text
) AS $$
DECLARE
  new_code text;
  voucher_id uuid;
BEGIN
  -- Generate unique voucher code
  new_code := 'VOUCHER-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert new voucher
  INSERT INTO public.vouchers (
    code, amount, currency, sender_name, recipient_name, 
    recipient_email, message, expires_at, status
  ) VALUES (
    new_code, voucher_amount, voucher_currency, sender_name, 
    recipient_name, recipient_email, voucher_message, expires_at, 'active'
  ) RETURNING id INTO voucher_id;
  
  RETURN QUERY SELECT true, new_code, 'Voucher został utworzony pomyślnie'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;