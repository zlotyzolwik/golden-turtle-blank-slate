import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client using the anon key for user authentication.
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Parse request body
    const { type, amount, currency, reservationId, voucherData }: PaymentRequest = await req.json();

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    if (type === 'voucher_purchase') {
      if (!voucherData) {
        throw new Error('Voucher data is required for voucher purchase');
      }

      const { amount: voucherAmount, senderName, recipientName, recipientEmail, buyerEmail, message } = voucherData;

      // Create Stripe Checkout Session for voucher purchase
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: currency || 'PLN',
              product_data: {
                name: 'Voucher podarunkowy',
                description: `Voucher o wartości ${voucherAmount / 100} ${currency || 'PLN'}`,
              },
              unit_amount: voucherAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get("origin")}/payment-success?type=voucher`,
        cancel_url: `${req.headers.get("origin")}/payment-cancel`,
        metadata: {
          type: 'voucher_purchase',
          voucher_amount: voucherAmount.toString(),
          sender_name: senderName,
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          buyer_email: buyerEmail,
          message: message || '',
          user_id: user.id,
          user_email: user.email,
        },
      });

      // Insert payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          type: 'voucher_purchase',
          amount: voucherAmount / 100, // Convert from cents
          currency: currency || 'PLN',
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'pending'
        });

      if (paymentError) {
        console.error('Error inserting payment record:', paymentError);
        throw new Error('Failed to create payment record');
      }

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (type === 'trip_reservation') {
      if (!reservationId) {
        throw new Error('Reservation ID is required for trip reservation');
      }

      // Create Stripe Checkout Session for trip reservation
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price_data: {
              currency: currency || 'PLN',
              product_data: {
                name: 'Rezerwacja wycieczki',
                description: `Rezerwacja wycieczki - ${amount / 100} ${currency || 'PLN'}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.get("origin")}/payment-success?type=trip`,
        cancel_url: `${req.headers.get("origin")}/payment-cancel`,
        metadata: {
          type: 'trip_reservation',
          reservation_id: reservationId,
          user_id: user.id,
          user_email: user.email,
        },
      });

      // Insert payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          type: 'trip_reservation',
          amount: amount / 100, // Convert from cents
          currency: currency || 'PLN',
          reservation_id: reservationId,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'pending'
        });

      if (paymentError) {
        console.error('Error inserting payment record:', paymentError);
        throw new Error('Failed to create payment record');
      }

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error('Invalid payment type');
  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});