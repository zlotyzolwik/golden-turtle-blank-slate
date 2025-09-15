import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51S4T9bK7ovBtjGHlxswARBSQoreksUsV8O5GDIZV44x4F4FD6T6Sm4DAVl6o9U6RxHc3FkFHt8KfKaoFSMGbiCgY00srACzwAa');

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
    body: params
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