import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createTransport } from "npm:nodemailer@6.9.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting SMTP configuration test...");
    
    // Get SMTP configuration
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT") || "587";
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const contactTo = Deno.env.get("CONTACT_TO") || "kontakt@zloty-zolwik.pl";

    // Check if all required env vars are present
    const missingVars = [];
    if (!smtpHost) missingVars.push("SMTP_HOST");
    if (!smtpUser) missingVars.push("SMTP_USER");
    if (!smtpPass) missingVars.push("SMTP_PASS");

    if (missingVars.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing SMTP configuration",
        missingVariables: missingVars,
        availableVariables: {
          SMTP_HOST: !!smtpHost,
          SMTP_PORT: !!Deno.env.get("SMTP_PORT"),
          SMTP_USER: !!smtpUser,
          SMTP_PASS: !!smtpPass,
          CONTACT_TO: !!Deno.env.get("CONTACT_TO")
        }
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    console.log("SMTP Configuration:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      hasPassword: !!smtpPass,
      contactTo: contactTo
    });

    // Create transporter
    const transporter = createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    console.log("Testing SMTP connection...");
    
    // Test connection
    const connectionResult = await transporter.verify();
    console.log("Connection test result:", connectionResult);

    // Test sending email
    console.log("Testing email send...");
    const testEmailResult = await transporter.sendMail({
      from: `"Złoty Żółwik Test" <${smtpUser}>`,
      to: contactTo,
      subject: "SMTP Test - System sprawny",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">✅ Test SMTP zakończony sukcesem</h2>
          <p>To jest wiadomość testowa z systemu Złoty Żółwik.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Informacje o teście:</h3>
            <ul>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pl-PL')}</li>
              <li><strong>Serwer SMTP:</strong> ${smtpHost}:${smtpPort}</li>
              <li><strong>Użytkownik:</strong> ${smtpUser}</li>
              <li><strong>Połączenie:</strong> Nawiązane pomyślnie</li>
              <li><strong>Wysyłka:</strong> Zakończona sukcesem</li>
            </ul>
          </div>
          <p style="color: #16a34a; font-weight: bold;">Konfiguracja SMTP działa prawidłowo!</p>
        </div>
      `
    });

    console.log("Test email sent successfully:", testEmailResult.messageId);

    return new Response(JSON.stringify({
      success: true,
      message: "SMTP test completed successfully",
      details: {
        connection: "✅ Connected successfully",
        emailSent: "✅ Test email sent",
        messageId: testEmailResult.messageId,
        smtpHost: smtpHost,
        smtpPort: smtpPort,
        smtpUser: smtpUser,
        contactTo: contactTo,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("SMTP test failed:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: "SMTP test failed",
      details: {
        message: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
        stack: error.stack
      }
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);