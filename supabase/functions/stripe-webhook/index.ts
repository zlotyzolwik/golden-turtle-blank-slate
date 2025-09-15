import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionSuccess(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;
  const type = metadata.type;
  
  console.log(`Payment succeeded for ${type}:`, paymentIntent.id);

  // Update payment status
  const { error: paymentUpdateError } = await supabaseClient
    .from('payments')
    .update({ status: 'succeeded' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (paymentUpdateError) {
    console.error('Error updating payment status:', paymentUpdateError);
    return;
  }

  if (type === 'trip_reservation') {
    await handleTripReservationSuccess(paymentIntent, metadata);
  } else if (type === 'voucher_purchase') {
    await handleVoucherPurchaseSuccess(paymentIntent, metadata);
  }
}

async function handleTripReservationSuccess(paymentIntent: Stripe.PaymentIntent, metadata: any) {
  const reservationId = metadata.reservation_id;
  
  // Update reservation payment status
  const { error: reservationError } = await supabaseClient
    .from('reservations')
    .update({ 
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id
    })
    .eq('id', reservationId);

  if (reservationError) {
    console.error('Error updating reservation:', reservationError);
    return;
  }

  // Get reservation details for email
  const { data: reservation } = await supabaseClient
    .from('reservations')
    .select(`
      *,
      trips (title, destination)
    `)
    .eq('id', reservationId)
    .single();

  if (reservation) {
    // Send confirmation emails
    await sendReservationEmails(reservation, paymentIntent);
  }
}

async function handleVoucherPurchaseSuccess(paymentIntent: Stripe.PaymentIntent, metadata: any) {
  const voucherAmount = parseFloat(metadata.voucher_amount);
  const senderName = metadata.sender_name;
  const recipientName = metadata.recipient_name;
  const recipientEmail = metadata.recipient_email;
  const buyerEmail = metadata.buyer_email;
  const message = metadata.message;

  console.log('Creating voucher after successful payment:', {
    amount: voucherAmount,
    buyerEmail,
    recipientEmail
  });

  // Create voucher
  const { data: voucherData, error: voucherError } = await supabaseClient
    .rpc('create_voucher_public', {
      voucher_amount: voucherAmount,
      sender_name: senderName,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      voucher_message: message,
      buyer_email: buyerEmail
    });

  if (voucherError) {
    console.error('Error creating voucher:', voucherError);
    return;
  }

  // Update payment record with voucher_id
  const { data: voucher } = await supabaseClient
    .from('vouchers')
    .select('id')
    .eq('code', voucherData[0].voucher_code)
    .single();

  if (voucher) {
    await supabaseClient
      .from('payments')
      .update({ voucher_id: voucher.id })
      .eq('stripe_payment_intent_id', paymentIntent.id);
  }

  // Send voucher emails
  await sendVoucherEmails(voucherData[0].voucher_code, voucherAmount, {
    senderName,
    recipientName,
    recipientEmail,
    buyerEmail,
    message
  });
}

async function handleCheckoutSessionSuccess(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  const type = metadata?.type;
  
  console.log(`Checkout session completed for ${type}:`, session.id);

  // Update payment status using session.payment_intent
  const paymentIntentId = typeof session.payment_intent === 'string' 
    ? session.payment_intent 
    : session.payment_intent?.id;

  if (paymentIntentId) {
    const { error: paymentUpdateError } = await supabaseClient
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (paymentUpdateError) {
      console.error('Error updating payment status:', paymentUpdateError);
      return;
    }
  }

  if (type === 'voucher_purchase') {
    await handleVoucherPurchaseFromCheckout(session, metadata);
  } else if (type === 'trip_reservation') {
    await handleTripReservationFromCheckout(session, metadata);
  }
}

async function handleVoucherPurchaseFromCheckout(session: Stripe.Checkout.Session, metadata: any) {
  const voucherAmount = parseFloat(metadata.voucher_amount);
  const senderName = metadata.sender_name;
  const recipientName = metadata.recipient_name;
  const recipientEmail = metadata.recipient_email;
  const buyerEmail = metadata.buyer_email;
  const message = metadata.message;

  console.log('Creating voucher after successful checkout:', {
    amount: voucherAmount,
    buyerEmail,
    recipientEmail
  });

  // Create voucher
  const { data: voucherData, error: voucherError } = await supabaseClient
    .rpc('create_voucher_public', {
      voucher_amount: voucherAmount,
      sender_name: senderName,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      voucher_message: message,
      buyer_email: buyerEmail
    });

  if (voucherError) {
    console.error('Error creating voucher:', voucherError);
    return;
  }

  // Update payment record with voucher_id
  const { data: voucher } = await supabaseClient
    .from('vouchers')
    .select('id')
    .eq('code', voucherData[0].voucher_code)
    .single();

  if (voucher) {
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;
      
    if (paymentIntentId) {
      await supabaseClient
        .from('payments')
        .update({ voucher_id: voucher.id })
        .eq('stripe_payment_intent_id', paymentIntentId);
    }
  }

  // Send voucher emails
  await sendVoucherEmails(voucherData[0].voucher_code, voucherAmount, {
    senderName,
    recipientName,
    recipientEmail,
    buyerEmail,
    message
  });
}

async function handleTripReservationFromCheckout(session: Stripe.Checkout.Session, metadata: any) {
  const reservationId = metadata.reservation_id;
  const userEmail = metadata.user_email;

  console.log('Processing trip reservation after successful checkout:', {
    reservationId,
    userEmail,
    sessionId: session.id
  });

  // Update reservation status
  const { data: reservation, error: reservationUpdateError } = await supabaseClient
    .from('reservations')
    .update({ 
      payment_status: 'paid', 
      status: 'confirmed',
      stripe_payment_intent_id: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id
    })
    .eq('id', reservationId)
    .select('*, trips(*)')
    .single();

  if (reservationUpdateError) {
    console.error('Error updating reservation:', reservationUpdateError);
    return;
  }

  // Send reservation confirmation emails
  if (reservation) {
    await sendReservationEmails(reservation, session.payment_intent);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update payment status
  const { error: paymentError } = await supabaseClient
    .from('payments')
    .update({ status: 'canceled' })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (paymentError) {
    console.error('Error updating payment status:', paymentError);
  }

  // Handle trip reservation failure - restore spots
  const { data: payment } = await supabaseClient
    .from('payments')
    .select('reservation_id, reservations(number_of_people, trip_id)')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (payment?.reservation_id && payment.reservations) {
    const reservation = payment.reservations as any;
    
    // Update reservation status
    await supabaseClient
      .from('reservations')
      .update({ 
        payment_status: 'failed', 
        status: 'cancelled' 
      })
      .eq('id', payment.reservation_id);

    // Restore available spots using the new function
    await supabaseClient
      .rpc('restore_trip_spots', {
        p_trip_id: reservation.trip_id,
        p_spots_to_restore: reservation.number_of_people
      });

    console.log(`Restored ${reservation.number_of_people} spots for trip ${reservation.trip_id}`);
  }
}

async function sendReservationEmails(reservation: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    // Email to customer
    await supabaseClient.functions.invoke('send-smtp-email', {
      body: {
        type: 'reservation',
        to: reservation.customer_email,
        subject: `Potwierdzenie płatności - ${reservation.trips.title}`,
        customerName: reservation.customer_name,
        tripTitle: reservation.trips.title,
        destination: reservation.trips.destination,
        totalPrice: reservation.total_price,
        numberOfPeople: reservation.number_of_people,
        paymentId: paymentIntent.id
      }
    });

    // Email to admin
    await supabaseClient.functions.invoke('send-smtp-email', {
      body: {
        type: 'admin_reservation_payment',
        to: Deno.env.get('CONTACT_TO'),
        subject: `Nowa opłacona rezerwacja - ${reservation.trips.title}`,
        customerName: reservation.customer_name,
        customerEmail: reservation.customer_email,
        tripTitle: reservation.trips.title,
        totalPrice: reservation.total_price,
        numberOfPeople: reservation.number_of_people,
        paymentId: paymentIntent.id
      }
    });

    console.log('Reservation confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending reservation emails:', error);
  }
}

async function sendVoucherEmails(voucherCode: string, amount: number, details: any) {
  try {
    // Email to buyer
    if (details.buyerEmail) {
      await supabaseClient.functions.invoke('send-smtp-email', {
        body: {
          type: 'voucher_buyer_confirmation',
          to: details.buyerEmail,
          subject: 'Potwierdzenie zakupu vouchera',
          buyerName: details.senderName,
          voucherCode,
          amount,
          recipientName: details.recipientName,
          recipientEmail: details.recipientEmail
        }
      });
    }

    // Email to recipient
    if (details.recipientEmail) {
      await supabaseClient.functions.invoke('send-smtp-email', {
        body: {
          type: 'voucher',
          to: details.recipientEmail,
          subject: `Voucher na wycieczkę - ${amount} PLN`,
          recipientName: details.recipientName,
          senderName: details.senderName,
          voucherCode,
          amount,
          message: details.message
        }
      });
    }

    // Email to admin
    await supabaseClient.functions.invoke('send-smtp-email', {
      body: {
        type: 'admin_voucher_sale',
        to: Deno.env.get('CONTACT_TO'),
        subject: `Nowa sprzedaż vouchera - ${amount} PLN`,
        voucherCode,
        amount,
        buyerEmail: details.buyerEmail,
        recipientEmail: details.recipientEmail,
        senderName: details.senderName
      }
    });

    console.log('Voucher emails sent successfully');
  } catch (error) {
    console.error('Error sending voucher emails:', error);
  }
}