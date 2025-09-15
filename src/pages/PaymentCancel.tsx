import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-muted/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            Płatność została anulowana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Twoja płatność nie została zrealizowana. Możesz spróbować ponownie
            lub skontaktować się z nami, jeśli potrzebujesz pomocy.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button asChild>
              <Link to="/" className="flex items-center justify-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Wróć do strony głównej</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/vouchers" className="flex items-center justify-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Spróbuj ponownie</span>
              </Link>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Potrzebujesz pomocy?</p>
            <p>Skontaktuj się z nami: <strong>kontakt@zloty-zolwik.pl</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;