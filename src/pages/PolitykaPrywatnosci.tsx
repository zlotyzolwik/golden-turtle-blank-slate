import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Brand from '@/components/Brand';
import { Link } from 'react-router-dom';

const PolitykaPrywatnosci = () => {
  const privacyPoints = [
    {
      title: "Administrator danych osobowych",
      content: "Administratorem Twoich danych osobowych jest firma Złoty Żółwik z siedzibą w Polsce. Dane kontaktowe znajdziesz w sekcji kontakt na naszej stronie."
    },
    {
      title: "Jakie dane zbieramy",
      content: "Zbieramy tylko dane niezbędne do realizacji usług: imię i nazwisko, adres e-mail, numer telefonu, dane płatnicze (obsługiwane przez Stripe)."
    },
    {
      title: "Cel przetwarzania danych",
      content: "Twoje dane przetwarzamy w celu realizacji rezerwacji wycieczek, kontaktu z Tobą, obsługi płatności oraz wysyłki voucherów."
    },
    {
      title: "Podstawa prawna",
      content: "Przetwarzamy dane na podstawie zawartej umowy (rezerwacja wycieczki), uzasadnionego interesu (marketing) oraz Twojej zgody (newsletter)."
    },
    {
      title: "Udostępnianie danych",
      content: "Dane mogą być udostępniane tylko sprawdzonym partnerom: procesorom płatności (Stripe), usługom e-mail (do wysyłki potwierdzeń)."
    },
    {
      title: "Czas przechowywania",
      content: "Dane przechowujemy przez czas realizacji umowy oraz przez okres wymagany przepisami prawa (zwykle 5 lat dla dokumentów księgowych)."
    },
    {
      title: "Twoje prawa",
      content: "Masz prawo do dostępu, sprostowania, usunięcia danych, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu."
    },
    {
      title: "Pliki cookies",
      content: "Używamy cookies niezbędnych do funkcjonowania strony oraz analitycznych (Google Analytics) do poprawy naszych usług."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <Brand />
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót na stronę główną
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Polityka prywatności
            </h1>
            <p className="text-lg text-muted-foreground">
              Dowiedz się, jak chronimy i przetwarzamy Twoje dane osobowe zgodnie z RODO
            </p>
          </div>

          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                <strong>Szanujemy Twoją prywatność.</strong> Niniejsza polityka prywatności wyjaśnia, 
                jak zbieramy, używamy i chronimy Twoje dane osobowe podczas korzystania z naszych usług. 
                Dokument został przygotowany zgodnie z Rozporządzeniem RODO.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {privacyPoints.map((point, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {point.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {point.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact for Data Protection */}
          <Card className="mt-8 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Kontakt w sprawach ochrony danych
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Jeśli masz pytania dotyczące przetwarzania danych osobowych lub chcesz skorzystać 
                ze swoich praw, skontaktuj się z nami:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/" state={{ scrollTo: "contact-section" }}>
                  <Button variant="outline" className="border-accent hover:bg-accent/10">
                    Formularz kontaktowy
                  </Button>
                </Link>
                <Button variant="ghost" className="text-accent hover:text-accent/80" asChild>
                  <a href="mailto:kontakt@zloty-zolwik.pl">kontakt@zloty-zolwik.pl</a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Masz również prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych, 
                jeśli uważasz, że przetwarzanie Twoich danych narusza przepisy RODO.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Polityka prywatności została ostatnio zaktualizowana: {new Date().toLocaleDateString('pl-PL')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PolitykaPrywatnosci;