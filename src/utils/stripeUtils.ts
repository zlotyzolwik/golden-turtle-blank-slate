import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error(
    "Missing VITE_STRIPE_PUBLISHABLE_KEY. Copy .env.example to .env and fill in values."
  );
}

const stripePromise = loadStripe(stripePublishableKey);

export interface CreatePaymentParams {
  type: 'trip_reservation' | 'voucher_purchase';
  amount: number;
  currency?: string;
  tripData?: {
    tripId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    numberOfPeople: number;
    totalPrice: number;
    notes?: string;
  };
  voucherData?: {
    amount: number;
    senderName: string;
    recipientName: string;
    recipientEmail: string;
    buyerEmail: string;
    buyerName: string;
    buyerPhone?: string;
    message?: string;
  };
}

export const createStripePayment = async (params: CreatePaymentParams) => {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: {
      type: params.type,
      amount: params.amount,
      currency: params.currency || 'PLN',
      tripData: params.tripData,
      voucherData: params.voucherData
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