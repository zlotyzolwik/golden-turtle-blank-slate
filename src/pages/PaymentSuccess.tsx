import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Gift, MapPin } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentType = searchParams.get('type');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Płatność zakończona pomyślnie!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentType === 'voucher' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Gift className="h-5 w-5" />
                <span className="font-medium">Voucher został utworzony</span>
              </div>
              <p className="text-muted-foreground">
                Voucher zostanie przesłany na podany adres email w ciągu kilku minut.
                Potwierdzenie zakupu otrzymasz na swój adres email.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Rezerwacja została opłacona</span>
              </div>
              <p className="text-muted-foreground">
                Potwierdzenie rezerwacji zostanie przesłane na Twój adres email.
                Szczegóły znajdziesz w sekcji "Moje rezerwacje".
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Automatyczne przekierowanie za {countdown} sekund
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link to="/">Wróć do strony głównej</Link>
              </Button>
              
              {paymentType === 'trip' && (
                <Button variant="outline" asChild>
                  <Link to="/my-reservations">Moje rezerwacje</Link>
                </Button>
              )}
              
              {paymentType === 'voucher' && (
                <Button variant="outline" asChild>
                  <Link to="/vouchers">Kup kolejny voucher</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;