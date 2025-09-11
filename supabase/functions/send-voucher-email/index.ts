import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoucherEmailRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  voucherCode: string;
  amount: number;
  currency: string;
  message?: string;
  expiresAt: string;
}

const COMPANY_NAME = "Złoty Żółwik";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      senderName, 
      voucherCode, 
      amount, 
      currency, 
      message, 
      expiresAt 
    }: VoucherEmailRequest = await req.json();

    const expiryDate = new Date(expiresAt).toLocaleDateString('pl-PL');

    const voucherHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: linear-gradient(135deg, #f6f8fc 0%, #e9f2ff 100%); padding: 20px;">
        <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; margin-bottom: 10px;">🎁 Voucher Podarunkowy</h1>
            <h2 style="color: #64748b; font-size: 24px; margin: 0;">${COMPANY_NAME}</h2>
          </div>

          <!-- Greeting -->
          <div style="margin-bottom: 30px;">
            <p style="font-size: 18px; color: #1e293b; margin: 0;">Cześć ${recipientName}!</p>
            <p style="font-size: 16px; color: #475569; margin: 10px 0 0 0;">
              ${senderName} przygotował(a) dla Ciebie wyjątkowy prezent - voucher na niezapomnianą podróż!
            </p>
          </div>

          <!-- Personal Message -->
          ${message ? `
            <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
              <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Osobista wiadomość od ${senderName}:</h3>
              <p style="color: #475569; margin: 0; font-style: italic; line-height: 1.6;">"${message}"</p>
            </div>
          ` : ''}

          <!-- Voucher Details -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h3 style="margin: 0 0 20px 0; font-size: 20px;">Twój Kod Vouchera</h3>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <code style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #fbbf24;">${voucherCode}</code>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
              <div style="text-align: left;">
                <div style="font-size: 14px; opacity: 0.8;">Wartość:</div>
                <div style="font-size: 28px; font-weight: bold;">${amount.toLocaleString('pl-PL')} ${currency}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; opacity: 0.8;">Ważny do:</div>
                <div style="font-size: 18px; font-weight: bold;">${expiryDate}</div>
              </div>
            </div>
          </div>

          <!-- How to Use -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0;">Jak wykorzystać voucher?</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
              <li>Wybierz wycieczkę z naszej oferty na stronie internetowej</li>
              <li>Podczas rezerwacji podaj kod vouchera: <strong>${voucherCode}</strong></li>
              <li>Wartość vouchera zostanie automatycznie odjęta od ceny wycieczki</li>
              <li>Jeśli koszt wycieczki przekracza wartość vouchera, dopłać różnicę</li>
            </ol>
          </div>

          <!-- Important Info -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Ważne informacje:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Voucher można wykorzystać na dowolną wycieczkę z naszej oferty</li>
              <li>Voucher nie podlega zwrotowi, ale może być przeniesiony na inną osobę</li>
              <li>W przypadku rezygnacji z wycieczki, voucher zachowuje ważność</li>
              <li>Voucher można łączyć z innymi promocjami</li>
            </ul>
          </div>

          <!-- Contact -->
          <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 25px;">
            <p style="color: #475569; margin: 0 0 10px 0;">Masz pytania? Skontaktuj się z nami:</p>
            <p style="color: #2563eb; margin: 0; font-weight: bold;">
              📧 biuro@zlotyzoliwk.pl | ☎️ +48 123 456 789
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              Dziękujemy za zaufanie i życzymy wspaniałej podróży!<br>
              <strong>Zespół ${COMPANY_NAME}</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: `${COMPANY_NAME} <noreply@zlotyzoliwk.pl>`,
      to: [recipientEmail],
      subject: `🎁 Voucher podarunkowy od ${senderName} - ${COMPANY_NAME}`,
      html: voucherHtml,
    });

    console.log("Voucher email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-voucher-email function:", error);
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