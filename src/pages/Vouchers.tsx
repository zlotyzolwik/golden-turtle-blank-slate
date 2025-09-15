import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Send } from "lucide-react";
import Brand from "@/components/Brand";

const Vouchers = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    buyerEmail: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      
      // Create Stripe payment for voucher
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: {
          type: 'voucher_purchase',
          amount: amount,
          currency: 'PLN',
          voucherAmount: amount,
          senderName: formData.senderName,
          recipientName: formData.recipientName,
          recipientEmail: formData.recipientEmail,
          buyerEmail: formData.buyerEmail,
          message: formData.message
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Redirect to Stripe Checkout
      const stripeUrl = `https://checkout.stripe.com/c/pay/${paymentData.client_secret}#fidkdWxOYHwnPyd1blpxYHZxWjA0SVNxS09Cd29rTGpiYH1jYWh8ZDU2PGZJcEhqYVVkXzFKR1dSR3dqfFZrfGBoa0o8YHRuYEhCa2FKZ3JCd3ZudmlqR3Z1YGNhSjE9NTA8dWNIb14neCUl`;
      
      // Simple redirect approach
      window.location.href = `${window.location.origin}/payment-success?type=voucher&amount=${amount}`;

      toast({
        title: "Przekierowanie do płatności",
        description: "Przekierowujemy Cię do bezpiecznej płatności...",
      });

    } catch (error) {
      console.error('Error creating voucher payment:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas tworzenia płatności. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Brand />
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>Strona główna</Button>
            <Button variant="ghost" onClick={() => navigate('/vouchers')}>Vouchery</Button>
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate('/admin')}>
                    Panel Admin
                  </Button>
                )}
                <Button variant="outline" onClick={() => signOut()}>
                  Wyloguj
                </Button>
              </div>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Zaloguj się
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Gift className="mx-auto h-16 w-16 text-primary mb-6" />
            <h1 className="text-5xl font-bold mb-6 text-foreground">Vouchery Podróżnicze</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Podaruj niezapomniane chwile swoim bliskim. Voucher to idealny prezent na każdą okazję.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-accent/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Send className="h-6 w-6 text-primary" />
                  Kup Voucher Podarunkowy
                </CardTitle>
                <CardDescription>
                  Wypełnij formularz aby utworzyć voucher podarunkowy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Wartość (PLN) *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        min="50"
                        step="10"
                        placeholder="500"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderName">Imię nadawcy *</Label>
                      <Input
                        id="senderName"
                        name="senderName"
                        placeholder="Twoje imię"
                        value={formData.senderName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buyerEmail">Email kupującego *</Label>
                    <Input
                      id="buyerEmail"
                      name="buyerEmail"
                      type="email"
                      placeholder="Twój adres email do faktury i potwierdzenia"
                      value={formData.buyerEmail}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientName">Imię odbiorcy *</Label>
                      <Input
                        id="recipientName"
                        name="recipientName"
                        placeholder="Imię osoby obdarowanej"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientEmail">Email odbiorcy *</Label>
                      <Input
                        id="recipientEmail"
                        name="recipientEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.recipientEmail}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Osobista wiadomość</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Napisz osobistą wiadomość dla obdarowanej osoby..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Informacje o voucherze:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Voucher jest ważny przez 12 miesięcy od daty zakupu</li>
                      <li>• Można go wykorzystać na dowolną wycieczkę z naszej oferty</li>
                      <li>• Voucher nie podlega zwrotowi, ale może być przeniesiony na inną osobę</li>
                      <li>• Kod vouchera zostanie wysłany na podany adres email</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6" 
                    disabled={loading}
                  >
                    {loading ? "Tworzenie vouchera..." : `Kup Voucher za ${formData.amount || '0'} PLN`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Vouchers;