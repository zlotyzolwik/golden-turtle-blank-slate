import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="flex items-start gap-4 p-6">
          <Cookie className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Ta strona używa plików cookies
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Używamy plików cookies, aby zapewnić najlepsze doświadczenia na naszej stronie internetowej. 
                Obejmują one cookies niezbędne do funkcjonowania strony oraz cookies analityczne, 
                które pomagają nam zrozumieć, jak korzystasz z naszej witryny.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleAccept}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Akceptuję wszystkie cookies
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="border-primary/30 hover:bg-primary/5"
              >
                Tylko niezbędne
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/5"
                onClick={() => window.open('/polityka-prywatnosci', '_blank')}
              >
                Więcej informacji
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};