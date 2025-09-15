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
  currency: string;
  reservationId?: string;
  voucherAmount?: number;
  senderName?: string;
  recipientName?: string;
  recipientEmail?: string;
  buyerEmail?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const {
      type,
      amount,
      currency = 'PLN',
      reservationId,
      voucherAmount,
      senderName,
      recipientName,
      recipientEmail,
      buyerEmail,
      message
    }: PaymentRequest = await req.json();

    console.log(`Creating payment for ${type}:`, { amount, currency, userId: user.id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        type,
        user_id: user.id,
        user_email: user.email,
        reservation_id: reservationId || '',
        voucher_amount: voucherAmount?.toString() || '',
        sender_name: senderName || '',
        recipient_name: recipientName || '',
        recipient_email: recipientEmail || '',
        buyer_email: buyerEmail || '',
        message: message || ''
      }
    });

    // Create payment record in database
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        type,
        reservation_id: reservationId || null,
        voucher_id: null, // Will be updated after voucher creation
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency,
        status: 'pending'
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error('Failed to create payment record');
    }

    console.log(`Payment intent created successfully: ${paymentIntent.id}`);

    return new Response(JSON.stringify({ 
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error in create-payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});