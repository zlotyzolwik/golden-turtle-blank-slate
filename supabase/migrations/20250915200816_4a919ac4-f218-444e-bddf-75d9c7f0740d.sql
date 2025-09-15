-- Fix RLS policy for payments table to allow users to create payments
CREATE POLICY "payments_user_create" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);