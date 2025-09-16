import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[REPAIR-PAYMENTS] Starting repair process");

    // Get all succeeded payments that need repair
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('status', 'succeeded')
      .eq('type', 'trip_reservation')
      .not('reservation_id', 'is', null);

    if (paymentsError) {
      throw new Error(`Error fetching payments: ${paymentsError.message}`);
    }

    console.log(`[REPAIR-PAYMENTS] Found ${payments.length} succeeded trip payments to check`);

    let repairedCount = 0;
    const results = [];

    for (const payment of payments) {
      try {
        // Check if reservation is already paid
        const { data: reservation } = await supabaseClient
          .from('reservations')
          .select('id, payment_status, stripe_payment_intent_id, customer_name, customer_email')
          .eq('id', payment.reservation_id)
          .single();

        if (!reservation) {
          console.log(`[REPAIR-PAYMENTS] Reservation ${payment.reservation_id} not found for payment ${payment.id}`);
          continue;
        }

        // If reservation is not marked as paid, update it
        if (reservation.payment_status !== 'paid') {
          console.log(`[REPAIR-PAYMENTS] Repairing reservation ${reservation.id} for payment ${payment.id}`);

          // Get actual payment intent ID from Stripe session
          let actualPaymentIntentId = null;
          if (payment.stripe_payment_intent_id?.startsWith('cs_')) {
            try {
              const session = await stripe.checkout.sessions.retrieve(payment.stripe_payment_intent_id);
              actualPaymentIntentId = typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id;
            } catch (stripeError) {
              console.log(`[REPAIR-PAYMENTS] Could not retrieve session ${payment.stripe_payment_intent_id}: ${stripeError.message}`);
              actualPaymentIntentId = payment.stripe_payment_intent_id;
            }
          } else {
            actualPaymentIntentId = payment.stripe_payment_intent_id;
          }

          // Update reservation status
          const { error: updateError } = await supabaseClient
            .from('reservations')
            .update({ 
              payment_status: 'paid',
              status: 'confirmed',
              stripe_payment_intent_id: actualPaymentIntentId
            })
            .eq('id', payment.reservation_id);

          if (updateError) {
            console.error(`[REPAIR-PAYMENTS] Error updating reservation ${payment.reservation_id}:`, updateError);
            results.push({
              paymentId: payment.id,
              reservationId: payment.reservation_id,
              status: 'error',
              message: updateError.message
            });
          } else {
            repairedCount++;
            results.push({
              paymentId: payment.id,
              reservationId: payment.reservation_id,
              customerName: reservation.customer_name,
              customerEmail: reservation.customer_email,
              status: 'repaired',
              message: `Updated payment_status to 'paid' and status to 'confirmed'`
            });
          }
        } else {
          results.push({
            paymentId: payment.id,
            reservationId: payment.reservation_id,
            customerName: reservation.customer_name,
            customerEmail: reservation.customer_email,
            status: 'already_paid',
            message: 'Reservation already marked as paid'
          });
        }
      } catch (error) {
        console.error(`[REPAIR-PAYMENTS] Error processing payment ${payment.id}:`, error);
        results.push({
          paymentId: payment.id,
          reservationId: payment.reservation_id,
          status: 'error',
          message: error.message
        });
      }
    }

    console.log(`[REPAIR-PAYMENTS] Repair completed. Repaired ${repairedCount} reservations`);

    return new Response(JSON.stringify({
      success: true,
      repairedCount,
      totalChecked: payments.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('[REPAIR-PAYMENTS] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});