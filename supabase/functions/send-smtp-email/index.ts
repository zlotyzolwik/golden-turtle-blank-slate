import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'contact' | 'reservation' | 'voucher' | 'admin_notification';
  to: string;
  subject: string;
  data: {
    customerName?: string;
    customerEmail?: string;
    senderName?: string;
    recipientName?: string;
    recipientEmail?: string;
    voucherCode?: string;
    amount?: number;
    currency?: string;
    message?: string;
    expiryDate?: string;
    tripTitle?: string;
    tripDate?: string;
    totalPrice?: number;
    numberOfPeople?: number;
    notes?: string;
    contactMessage?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, subject, data }: EmailRequest = await req.json();

    // Create nodemailer transporter with SMTP configuration
    const transporter = createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    // Get logo attachment with error handling
    let logoAttachment: any[] = [];
    try {
      const logoUrl = "https://xgvvcovmjqcpfmghawdy.supabase.co/storage/v1/object/public/images/logo-zloty-zolwik.png";
      console.log('Attempting to fetch logo from:', logoUrl);
      
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        logoAttachment = [{
          filename: 'logo-zloty-zolwik.png',
          content: new Uint8Array(logoBuffer),
          cid: 'logo@zz'
        }];
        console.log('Logo attachment created successfully');
      } else {
        console.warn('Logo not found, sending email without logo attachment');
      }
    } catch (error) {
      console.warn('Failed to load logo attachment:', error);
      // Continue without logo - don't fail the entire email
    }

    // Generate HTML content based on email type
    let htmlContent = "";
    
    if (type === 'contact') {
      htmlContent = generateContactEmailHtml(data, logoUrl);
    } else if (type === 'reservation') {
      htmlContent = generateReservationEmailHtml(data, logoUrl);
    } else if (type === 'voucher') {
      htmlContent = generateVoucherEmailHtml(data, logoUrl);
    } else if (type === 'admin_notification') {
      htmlContent = generateAdminNotificationHtml(data, logoUrl, subject);
    }

    const mailOptions = {
      from: `"Złoty Żółwik" <${Deno.env.get("SMTP_USER")}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: logoAttachment,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.messageId 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-smtp-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateContactEmailHtml(data: any, logoUrl: string): string {
  const safeName = data.customerName || '';
  const safeSubject = data.contactSubject || '';
  const safeMessage = (data.contactMessage || '').replace(/\n/g, '<br>');
  const referenceNumber = Date.now();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo@zz" alt="Złoty Żółwik" style="max-width: 200px;" onerror="this.style.display='none'">
      </div>
      
      <h2 style="color: #D6B336; border-bottom: 2px solid #D6B336; padding-bottom: 10px;">
        Potwierdzenie złożenia zapytania
      </h2>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Dzień dobry ${safeName},</strong></p>
        <p>Dziękujemy za kontakt z Złotym Żółwikiem!</p>
        <p>Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej jak to możliwe.</p>
      </div>
      
      <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="color: #333; margin-top: 0;">Szczegóły Twojego zapytania:</h3>
        <div style="line-height: 1.6; color: #555;">
          <p><strong>Temat:</strong> ${safeSubject}</p>
          <p><strong>Wiadomość:</strong></p>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${safeMessage}
          </div>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px; font-size: 12px; color: #666;">
        <p><strong>Informacje:</strong></p>
        <p>Data złożenia: ${new Date().toLocaleString('pl-PL')}</p>
        <p>Numer referencyjny: ${referenceNumber}</p>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #666;">
        <p>Z poważaniem,<br>Zespół Złoty Żółwik</p>
      </div>
    </div>
  `;
}

function generateReservationEmailHtml(data: any, logoUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potwierdzenie rezerwacji</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 30px 20px; text-align: center;">
          <img src="${logoUrl}" alt="Złoty Żółwik" style="height: 60px; width: auto; margin-bottom: 15px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            Złoty Żółwik
          </h1>
          <p style="color: #e0f2fe; margin: 5px 0 0; font-size: 16px;">Twoje przygody zaczynają się tutaj</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
            <h2 style="color: #15803d; margin: 0 0 10px; font-size: 24px;">Rezerwacja potwierdzona!</h2>
            <p style="color: #166534; margin: 0; font-size: 16px;">
              Dziękujemy za wybór naszej wycieczki. Skontaktujemy się z Tobą wkrótce w sprawie szczegółów.
            </p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #334155; margin: 0 0 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
              Szczegóły rezerwacji:
            </h3>
            <div style="space-y: 10px;">
              <p style="margin: 8px 0; color: #475569;">
                <strong style="color: #1e293b;">Wycieczka:</strong> ${data.tripTitle}
              </p>
              <p style="margin: 8px 0; color: #475569;">
                <strong style="color: #1e293b;">Data:</strong> ${data.tripDate}
              </p>
              <p style="margin: 8px 0; color: #475569;">
                <strong style="color: #1e293b;">Liczba osób:</strong> ${data.numberOfPeople}
              </p>
              <p style="margin: 8px 0; color: #475569;">
                <strong style="color: #1e293b;">Łączna cena:</strong> ${data.totalPrice} ${data.currency || 'PLN'}
              </p>
              <p style="margin: 8px 0; color: #475569;">
                <strong style="color: #1e293b;">Kontakt:</strong> ${data.customerName} (${data.customerEmail})
              </p>
              ${data.notes ? `
              <div style="margin: 15px 0;">
                <strong style="color: #1e293b;">Uwagi:</strong>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 5px; border-left: 3px solid #cbd5e1;">
                  <p style="margin: 0; color: #475569; white-space: pre-line;">${data.notes}</p>
                </div>
              </div>
              ` : ''}
            </div>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h4 style="color: #92400e; margin: 0 0 10px; font-size: 16px;">ℹ️ Ważne informacje:</h4>
            <ul style="color: #b45309; margin: 0; padding-left: 20px;">
              <li>Skontaktujemy się z Tobą w ciągu 24 godzin</li>
              <li>Płatność zostanie potwierdzona przed wyjazdem</li>
              <li>W razie pytań, napisz na kontakt@zloty-zolwik.pl</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #f1c40f; margin: 0 0 10px; font-size: 20px;">Złoty Żółwik</h3>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">Twoje przygody zaczynają się tutaj</p>
          </div>
          
          <div style="border-top: 1px solid #374151; padding-top: 20px; font-size: 14px;">
            <p style="margin: 5px 0; color: #9ca3af;">
              📧 Email: <a href="mailto:kontakt@zloty-zolwik.pl" style="color: #60a5fa; text-decoration: none;">kontakt@zloty-zolwik.pl</a>
            </p>
            <p style="margin: 15px 0 5px; color: #6b7280; font-size: 12px;">
              © 2025 Złoty Żółwik. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateVoucherEmailHtml(data: any, logoUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Voucher Złoty Żółwik</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #f1c40f 50%, #fbbf24 100%); padding: 30px 20px; text-align: center;">
          <img src="${logoUrl}" alt="Złoty Żółwik" style="height: 60px; width: auto; margin-bottom: 15px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🎁 Voucher Prezentowy
          </h1>
          <p style="color: #fef3c7; margin: 5px 0 0; font-size: 16px;">Od Złoty Żółwik</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 24px;">
              Cześć ${data.recipientName}! 👋
            </h2>
            <p style="color: #475569; margin: 0; font-size: 16px;">
              ${data.senderName} przygotował(a) dla Ciebie wyjątkowy prezent!
            </p>
          </div>

          <!-- Voucher Card -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #f1c40f; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; position: relative;">
            <div style="background-color: #f1c40f; color: #92400e; font-size: 12px; font-weight: bold; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
              Voucher Prezentowy
            </div>
            
            <h3 style="color: #1e293b; margin: 0 0 15px; font-size: 36px; font-weight: bold;">
              ${data.amount} ${data.currency || 'PLN'}
            </h3>
            
            <div style="background-color: #ffffff; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Kod vouchera:
              </p>
              <div style="background-color: #1e293b; color: #f1c40f; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
                ${data.voucherCode}
              </div>
            </div>
            
            ${data.expiryDate ? `
            <p style="color: #ef4444; margin: 15px 0 0; font-size: 14px;">
              ⏰ Ważny do: ${data.expiryDate}
            </p>
            ` : ''}
          </div>

          ${data.message ? `
          <div style="background-color: #fef7f0; border-left: 4px solid #f97316; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #c2410c; margin: 0 0 10px; font-size: 16px;">💌 Wiadomość od ${data.senderName}:</h4>
            <p style="color: #9a3412; margin: 0; font-style: italic; white-space: pre-line;">${data.message}</p>
          </div>
          ` : ''}

          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #0c4a6e; margin: 0 0 10px; font-size: 16px;">🎯 Jak wykorzystać voucher:</h4>
            <ol style="color: #075985; margin: 0; padding-left: 20px;">
              <li>Wybierz wycieczkę na naszej stronie</li>
              <li>Podczas rezerwacji wpisz kod vouchera</li>
              <li>Kwota zostanie automatycznie odjęta od ceny</li>
              <li>Ciesz się przygodą!</li>
            </ol>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #f1c40f; margin: 0 0 10px; font-size: 20px;">Złoty Żółwik</h3>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">Twoje przygody zaczynają się tutaj</p>
          </div>
          
          <div style="border-top: 1px solid #374151; padding-top: 20px; font-size: 14px;">
            <p style="margin: 5px 0; color: #9ca3af;">
              📧 Email: <a href="mailto:kontakt@zloty-zolwik.pl" style="color: #60a5fa; text-decoration: none;">kontakt@zloty-zolwik.pl</a>
            </p>
            <p style="margin: 15px 0 5px; color: #6b7280; font-size: 12px;">
              © 2025 Złoty Żółwik. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotificationHtml(data: any, logoUrl: string, subject: string): string {
  // Escape HTML for safety
  const safeName = data.customerName || '';
  const safeEmail = data.customerEmail || '';
  const safePhone = data.customerPhone || '';
  const safeSubject = data.contactSubject || subject || '';
  const safeMessage = (data.contactMessage || data.message || data.notes || '').replace(/\n/g, '<br>');
  const ip = data.ip || 'N/A';
  const userAgent = data.userAgent || 'N/A';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo@zz" alt="Złoty Żółwik" style="max-width: 200px;">
      </div>
      
      <h2 style="color: #D6B336; border-bottom: 2px solid #D6B336; padding-bottom: 10px;">
        Nowa wiadomość kontaktowa
      </h2>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Imię i nazwisko:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>Telefon:</strong> ${safePhone}</p>` : ''}
        <p><strong>Temat:</strong> ${safeSubject}</p>
        
        ${data.voucherCode ? `<p><strong>Kod vouchera:</strong> ${data.voucherCode}</p>` : ''}
        ${data.amount ? `<p><strong>Kwota:</strong> ${data.amount} ${data.currency || 'PLN'}</p>` : ''}
        ${data.tripTitle ? `<p><strong>Wycieczka:</strong> ${data.tripTitle}</p>` : ''}
        ${data.totalPrice ? `<p><strong>Łączna cena:</strong> ${data.totalPrice} ${data.currency || 'PLN'}</p>` : ''}
      </div>
      
      <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="color: #333; margin-top: 0;">Wiadomość:</h3>
        <div style="line-height: 1.6; color: #555;">
          ${safeMessage}
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px; font-size: 12px; color: #666;">
        <p><strong>Informacje techniczne:</strong></p>
        <p>IP: ${ip}</p>
        <p>User-Agent: ${userAgent}</p>
        <p>Data: ${new Date().toLocaleString('pl-PL')}</p>
      </div>
    </div>
  `;
}

serve(handler);