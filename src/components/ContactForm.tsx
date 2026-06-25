import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
  hideHeader?: boolean;
  embedded?: boolean;
}

const ContactForm = ({ hideHeader = false, embedded = false }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Zapisanie wiadomości w bazie danych
      const {
        error: dbError
      } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        message: formData.message,
        phone: formData.phone || null,
        subject: formData.subject
      }]);
      if (dbError) throw dbError;

      // Get technical information
      const ip = 'N/A'; // Client-side can't get real IP
      const userAgent = navigator.userAgent;

      // Wysłanie emaila potwierdzającego do klienta
      const {
        error: customerEmailError
      } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          type: 'contact',
          to: formData.email,
          subject: 'Potwierdzenie otrzymania wiadomości - Złoty Żółwik',
          data: {
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            contactSubject: formData.subject,
            contactMessage: formData.message
          }
        }
      });

      // Wysłanie powiadomienia do administratora
      const {
        error: adminEmailError
      } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          type: 'admin_notification',
          to: 'kontakt@zloty-zolwik.pl',
          replyTo: formData.email,
          subject: `[Kontakt] ${formData.subject || 'Brak tematu'}`,
          data: {
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            contactSubject: formData.subject,
            contactMessage: formData.message,
            ip: ip,
            userAgent: userAgent
          }
        }
      });
      if (customerEmailError || adminEmailError) {
        console.error('Email errors:', {
          customerEmailError,
          adminEmailError
        });
        // Nie przerywamy procesu jeśli emaile się nie wysłały
      }
      toast({
        title: "Wiadomość wysłana!",
        description: "Dziękujemy za kontakt. Odpowiemy w ciągu 24 godzin."
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const content = (
    <>
        {!hideHeader && (
          <div className="text-center mb-16">
            <h2 id="contact-heading" className="text-4xl font-bold mb-6">Skontaktuj się z nami</h2>
            <p className="text-xl text-muted-foreground">
              Masz pytania? Chętnie na nie odpowiemy!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Wyślij wiadomość</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Imię i nazwisko</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adres e-mail</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Temat</Label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość</Label>
                  <Textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Wysyłanie..." : "Wyślij wiadomość"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">E-mail</h3>
                    <p className="text-muted-foreground">kontakt@zloty-zolwik.pl</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Telefon</h3>
                    <p className="text-muted-foreground">514 176 996</p>
                    
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <section id="contact-section" aria-labelledby="contact-heading" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">{content}</div>
    </section>
  );
};
export default ContactForm;