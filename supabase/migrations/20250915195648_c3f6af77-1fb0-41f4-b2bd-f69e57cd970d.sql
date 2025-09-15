-- Create payments table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
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

    -- Add trigger for updating updated_at in payments table
    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Add new columns to reservations table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'stripe_payment_intent_id') THEN
    ALTER TABLE public.reservations ADD COLUMN stripe_payment_intent_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'voucher_code_used') THEN
    ALTER TABLE public.reservations ADD COLUMN voucher_code_used text;
  END IF;
END
$$;

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_voucher_id ON public.payments(voucher_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_reservations_stripe_payment_id ON public.reservations(stripe_payment_intent_id);