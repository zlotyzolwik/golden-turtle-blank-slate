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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-PAYMENT] Starting payment process");

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { type, amount, currency = 'PLN', tripData, voucherData }: PaymentRequest = await req.json();
    console.log("[CREATE-PAYMENT] Payment request:", { type, amount, currency, tripData, voucherData });

    if (type === 'voucher_purchase') {
      if (!voucherData?.buyerEmail || !voucherData?.buyerName) {
        throw new Error("Buyer email and name are required for voucher purchase");
      }

      // Create voucher using guest function
      const { data: voucherResult, error: voucherError } = await supabaseAdmin.rpc('create_voucher_guest', {
        voucher_amount: amount / 100, // Convert from cents
        buyer_email: voucherData.buyerEmail,
        buyer_name: voucherData.buyerName,
        voucher_currency: currency,
        sender_name: voucherData.senderName || '',
        recipient_name: voucherData.recipientName || '',
        recipient_email: voucherData.recipientEmail || '',
        voucher_message: voucherData.message || '',
        buyer_phone: voucherData.buyerPhone || null
      });

      if (voucherError) {
        console.error("[CREATE-PAYMENT] Error creating voucher:", voucherError);
        throw new Error(`Failed to create voucher: ${voucherError.message}`);
      }

      // Check if customer exists in Stripe
      let customers = await stripe.customers.list({ 
        email: voucherData.buyerEmail, 
        limit: 1 
      });
      
      let customerId;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }

      // Create Stripe checkout session for voucher
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : voucherData.buyerEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Voucher o wartości ${amount / 100} ${currency}`,
                description: `Voucher dla: ${voucherData.recipientName || voucherData.recipientEmail}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/payment-cancel`,
        metadata: {
          type: 'voucher_purchase',
          amount: amount.toString(),
          currency: currency,
          senderName: voucherData.senderName || '',
          recipientName: voucherData.recipientName || '',
          recipientEmail: voucherData.recipientEmail || '',
          buyerEmail: voucherData.buyerEmail,
          message: voucherData.message || '',
          voucherCode: voucherResult[0]?.voucher_code || ''
        }
      });

      console.log("[CREATE-PAYMENT] Voucher checkout session created:", session.id);

      // Record payment in database
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          type: 'voucher_purchase',
          amount: amount,
          currency: currency,
          status: 'pending',
          stripe_payment_intent_id: session.id
        });

      if (paymentError) {
        console.error("[CREATE-PAYMENT] Error recording voucher payment:", paymentError);
        throw new Error(`Failed to record payment: ${paymentError.message}`);
      }

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (type === 'trip_reservation') {
      if (!tripData) {
        throw new Error("Trip data is required for trip reservation");
      }

      // Create reservation using guest function
      const { data: reservationResult, error: reservationError } = await supabaseAdmin.rpc('create_reservation_guest', {
        p_trip_id: tripData.tripId,
        p_customer_email: tripData.customerEmail,
        p_customer_name: tripData.customerName,
        p_total_price: tripData.totalPrice,
        p_customer_phone: tripData.customerPhone || null,
        p_number_of_people: tripData.numberOfPeople,
        p_notes: tripData.notes || null
      });

      if (reservationError || !reservationResult[0]?.success) {
        console.error("[CREATE-PAYMENT] Error creating reservation:", reservationError);
        throw new Error(`Failed to create reservation: ${reservationResult[0]?.message || reservationError?.message}`);
      }

      const reservationId = reservationResult[0].reservation_id;

      // Get trip details for Stripe session
      const { data: trip, error: tripError } = await supabaseAdmin
        .from('trips')
        .select('title, destination')
        .eq('id', tripData.tripId)
        .single();

      if (tripError || !trip) {
        throw new Error("Trip not found");
      }

      // Check if customer exists in Stripe
      let customers = await stripe.customers.list({ 
        email: tripData.customerEmail, 
        limit: 1 
      });
      
      let customerId;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }

      // Create Stripe checkout session for reservation
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : tripData.customerEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `${trip.title} - ${trip.destination}`,
                description: `Rezerwacja dla ${tripData.numberOfPeople} osób`,
              },
              unit_amount: Math.round(tripData.totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/payment-cancel`,
        metadata: {
          type: 'trip_reservation',
          reservationId: reservationId,
          customerEmail: tripData.customerEmail
        }
      });

      console.log("[CREATE-PAYMENT] Trip checkout session created:", session.id);

      // Record payment in database
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          type: 'trip_reservation',
          amount: Math.round(tripData.totalPrice * 100),
          currency: currency,
          status: 'pending',
          reservation_id: reservationId,
          stripe_payment_intent_id: session.id
        });

      if (paymentError) {
        console.error("[CREATE-PAYMENT] Error recording trip payment:", paymentError);
        throw new Error(`Failed to record payment: ${paymentError.message}`);
      }

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid payment type");

  } catch (error) {
    console.error("[CREATE-PAYMENT] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});