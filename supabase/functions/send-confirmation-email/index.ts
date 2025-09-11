import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactConfirmationRequest {
  type: "contact" | "reservation" | "voucher";
  customerName: string;
  customerEmail: string;
  details: any;
}

const COMPANY_EMAIL = "biuro@zlotyzoliwk.pl";
const COMPANY_NAME = "Złoty Żółwik";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, customerName, customerEmail, details }: ContactConfirmationRequest = await req.json();

    let subject: string;
    let customerHtml: string;
    let companyHtml: string;

    switch (type) {
      case "contact":
        subject = "Potwierdzenie otrzymania zapytania - Złoty Żółwik";
        customerHtml = `
          <h1>Dziękujemy za kontakt!</h1>
          <p>Dzień dobry ${customerName},</p>
          <p>Otrzymaliśmy Państwa zapytanie i skontaktujemy się w ciągu 24 godzin.</p>
          <h3>Szczegóły zapytania:</h3>
          <p><strong>Imię i nazwisko:</strong> ${details.name}</p>
          <p><strong>E-mail:</strong> ${details.email}</p>
          <p><strong>Wiadomość:</strong><br>${details.message}</p>
          <p>Pozdrawiamy,<br><strong>Zespół ${COMPANY_NAME}</strong></p>
        `;
        companyHtml = `
          <h1>Nowe zapytanie od klienta</h1>
          <h3>Dane klienta:</h3>
          <p><strong>Imię i nazwisko:</strong> ${details.name}</p>
          <p><strong>E-mail:</strong> ${details.email}</p>
          <p><strong>Wiadomość:</strong><br>${details.message}</p>
          <p><strong>Data wysłania:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
        `;
        break;

      case "reservation":
        subject = "Potwierdzenie rezerwacji wycieczki - Złoty Żółwik";
        customerHtml = `
          <h1>Potwierdzenie rezerwacji</h1>
          <p>Dzień dobry ${customerName},</p>
          <p>Dziękujemy za dokonanie rezerwacji wycieczki!</p>
          <h3>Szczegóły rezerwacji:</h3>
          <p><strong>Wycieczka:</strong> ${details.tripTitle}</p>
          <p><strong>Destynacja:</strong> ${details.destination}</p>
          <p><strong>Data wyjazdu:</strong> ${details.departureDate}</p>
          <p><strong>Data powrotu:</strong> ${details.returnDate}</p>
          <p><strong>Liczba osób:</strong> ${details.numberOfPeople}</p>
          <p><strong>Kwota całkowita:</strong> ${details.totalPrice} ${details.currency}</p>
          <p><strong>Status:</strong> ${details.status}</p>
          ${details.notes ? `<p><strong>Uwagi:</strong> ${details.notes}</p>` : ''}
          <p>Skontaktujemy się z Państwem w sprawie dalszych szczegółów.</p>
          <p>Pozdrawiamy,<br><strong>Zespół ${COMPANY_NAME}</strong></p>
        `;
        companyHtml = `
          <h1>Nowa rezerwacja wycieczki</h1>
          <h3>Dane klienta:</h3>
          <p><strong>Imię i nazwisko:</strong> ${details.customerName}</p>
          <p><strong>E-mail:</strong> ${details.customerEmail}</p>
          <p><strong>Telefon:</strong> ${details.customerPhone || 'Nie podano'}</p>
          <h3>Szczegóły rezerwacji:</h3>
          <p><strong>Wycieczka:</strong> ${details.tripTitle}</p>
          <p><strong>Destynacja:</strong> ${details.destination}</p>
          <p><strong>Data wyjazdu:</strong> ${details.departureDate}</p>
          <p><strong>Data powrotu:</strong> ${details.returnDate}</p>
          <p><strong>Liczba osób:</strong> ${details.numberOfPeople}</p>
          <p><strong>Kwota całkowita:</strong> ${details.totalPrice} ${details.currency}</p>
          ${details.notes ? `<p><strong>Uwagi:</strong> ${details.notes}</p>` : ''}
          <p><strong>Data rezerwacji:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
        `;
        break;

      case "voucher":
        subject = "Potwierdzenie zakupu vouchera - Złoty Żółwik";
        customerHtml = `
          <h1>Potwierdzenie zakupu vouchera</h1>
          <p>Dzień dobry ${customerName},</p>
          <p>Dziękujemy za zakup vouchera!</p>
          <h3>Szczegóły vouchera:</h3>
          <p><strong>Kod vouchera:</strong> ${details.code}</p>
          <p><strong>Wartość:</strong> ${details.amount} ${details.currency}</p>
          <p><strong>Odbiorca:</strong> ${details.recipientName}</p>
          <p><strong>E-mail odbiorcy:</strong> ${details.recipientEmail}</p>
          ${details.message ? `<p><strong>Wiadomość:</strong> ${details.message}</p>` : ''}
          <p><strong>Data ważności:</strong> ${details.expiresAt ? new Date(details.expiresAt).toLocaleDateString('pl-PL') : 'Bezterminowy'}</p>
          <p>Voucher został już wysłany na adres odbiorcy.</p>
          <p>Pozdrawiamy,<br><strong>Zespół ${COMPANY_NAME}</strong></p>
        `;
        companyHtml = `
          <h1>Nowy zakup vouchera</h1>
          <h3>Dane kupującego:</h3>
          <p><strong>Imię i nazwisko:</strong> ${details.senderName}</p>
          <p><strong>E-mail:</strong> ${customerEmail}</p>
          <h3>Szczegóły vouchera:</h3>
          <p><strong>Kod:</strong> ${details.code}</p>
          <p><strong>Wartość:</strong> ${details.amount} ${details.currency}</p>
          <p><strong>Odbiorca:</strong> ${details.recipientName}</p>
          <p><strong>E-mail odbiorcy:</strong> ${details.recipientEmail}</p>
          ${details.message ? `<p><strong>Wiadomość:</strong> ${details.message}</p>` : ''}
          <p><strong>Data ważności:</strong> ${details.expiresAt ? new Date(details.expiresAt).toLocaleDateString('pl-PL') : 'Bezterminowy'}</p>
          <p><strong>Data zakupu:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
        `;
        break;

      default:
        throw new Error("Invalid email type");
    }

    // Wysyłanie emaila do klienta
    const customerEmailResponse = await resend.emails.send({
      from: `${COMPANY_NAME} <noreply@zlotyzoliwk.pl>`,
      to: [customerEmail],
      subject: subject,
      html: customerHtml,
    });

    // Wysyłanie emaila do firmy
    const companyEmailResponse = await resend.emails.send({
      from: `${COMPANY_NAME} <noreply@zlotyzoliwk.pl>`,
      to: [COMPANY_EMAIL],
      subject: `[${type.toUpperCase()}] ${subject}`,
      html: companyHtml,
    });

    console.log("Emails sent successfully:", {
      customer: customerEmailResponse,
      company: companyEmailResponse,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      customerEmailId: customerEmailResponse.data?.id,
      companyEmailId: companyEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);