-- Add buyer_email field to vouchers table
ALTER TABLE public.vouchers 
ADD COLUMN buyer_email text;

-- Create payments table for tracking all payments (trips and vouchers)
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('trip_reservation', 'voucher_purchase')),
  reservation_id uuid REFERENCES public.reservations(id),
  voucher_id uuid REFERENCES public.vouchers(id),
  stripe_payment_intent_id text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'PLN',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'canceled', 'refunded')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments table
CREATE POLICY "payments_admin_all" 
ON public.payments 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "payments_user_read" 
ON public.payments 
FOR SELECT 
USING (
  (type = 'trip_reservation' AND reservation_id IN (
    SELECT id FROM public.reservations WHERE user_id = auth.uid()
  )) OR
  (type = 'voucher_purchase' AND auth.uid() IS NOT NULL)
);

-- Add stripe_payment_intent_id and voucher_code_used to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS voucher_code_used text;

-- Create index for better performance
CREATE INDEX idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX idx_payments_voucher_id ON public.payments(voucher_id);
CREATE INDEX idx_payments_stripe_payment_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_reservations_stripe_payment_id ON public.reservations(stripe_payment_intent_id);

-- Add trigger for updating updated_at in payments table
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update create_voucher_public function to include buyer_email
CREATE OR REPLACE FUNCTION public.create_voucher_public(
  voucher_amount numeric, 
  voucher_currency text DEFAULT 'PLN'::text, 
  sender_name text DEFAULT NULL::text, 
  recipient_name text DEFAULT NULL::text, 
  recipient_email text DEFAULT NULL::text, 
  voucher_message text DEFAULT NULL::text, 
  expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone,
  buyer_email text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, voucher_code text, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  voucher_id uuid;
BEGIN
  -- Generate unique voucher code
  new_code := 'VOUCHER-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  
  -- Insert new voucher
  INSERT INTO public.vouchers (
    code, amount, currency, sender_name, recipient_name, 
    recipient_email, message, expires_at, status, buyer_email
  ) VALUES (
    new_code, voucher_amount, voucher_currency, sender_name, 
    recipient_name, recipient_email, voucher_message, expires_at, 'active', buyer_email
  ) RETURNING id INTO voucher_id;
  
  RETURN QUERY SELECT true, new_code, 'Voucher został utworzony pomyślnie'::text;
END;
$function$;