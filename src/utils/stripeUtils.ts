import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe (you'll need to add your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export interface CreatePaymentParams {
  type: 'trip_reservation' | 'voucher_purchase';
  amount: number;
  currency?: string;
  reservationId?: string;
  voucherData?: {
    amount: number;
    senderName: string;
    recipientName: string;
    recipientEmail: string;
    buyerEmail: string;
    message?: string;
  };
}

export const createStripePayment = async (params: CreatePaymentParams) => {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: {
      type: params.type,
      amount: params.amount,
      currency: params.currency || 'PLN',
      reservationId: params.reservationId,
      ...(params.voucherData && {
        voucherAmount: params.voucherData.amount,
        senderName: params.voucherData.senderName,
        recipientName: params.voucherData.recipientName,
        recipientEmail: params.voucherData.recipientEmail,
        buyerEmail: params.voucherData.buyerEmail,
        message: params.voucherData.message
      })
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const redirectToStripeCheckout = async (clientSecret: string, returnUrl: string) => {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe nie został załadowany');
  }

  const { error } = await stripe.confirmPayment({
    clientSecret,
    confirmParams: {
      return_url: returnUrl,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};