import { useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Brand from '@/components/Brand';
import { Link } from 'react-router-dom';

const Regulamin = () => {
  const [pdfError, setPdfError] = useState(false);

  // Placeholder content - will be replaced when PDF is uploaded
  const termsContent = [
    {
      title: "§1 Postanowienia ogólne",
      content: "Niniejszy regulamin określa zasady organizacji i przeprowadzania wycieczek turystycznych przez firmę Złoty Żółwik."
    },
    {
      title: "§2 Definicje",
      content: "W niniejszym regulaminie używane są następujące pojęcia: Organizator - firma Złoty Żółwik, Uczestnik - osoba uczestnicząca w wycieczce, Wycieczka - zorganizowana forma wypoczynku."
    },
    {
      title: "§3 Zapisy i rezerwacje",
      content: "Zapisanie się na wycieczkę następuje poprzez złożenie rezerwacji za pośrednictwem strony internetowej lub bezpośrednio w biurze organizatora."
    },
    {
      title: "§4 Płatności",
      content: "Płatność za wycieczkę może być dokonana online kartą płatniczą, przelewem bankowym lub gotówką w biurze organizatora."
    },
    {
      title: "§5 Rezygnacja z wycieczki",
      content: "Uczestnik może zrezygnować z wycieczki z zastrzeżeniem opłat rezygnacyjnych określonych w niniejszym regulaminie."
    },
    {
      title: "§6 Odpowiedzialność",
      content: "Organizator ponosi odpowiedzialność za należyte wykonanie usług turystycznych zgodnie z zawartą umową."
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
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Regulamin wycieczek
            </h1>
            <p className="text-lg text-muted-foreground">
              Zapoznaj się z warunkami uczestnictwa w wycieczkach organizowanych przez Złoty Żółwik
            </p>
          </div>

          {/* PDF Viewer Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Dokument regulaminu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 border border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Plik PDF z regulaminem zostanie tutaj wyświetlony po przesłaniu przez administratora.
                </p>
                <Button variant="outline" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Pobierz regulamin (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Terms Content - Fallback */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Główne postanowienia regulaminu
            </h2>
            
            {termsContent.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Uwaga:</strong> Powyższy tekst stanowi skrócone przedstawienie głównych punktów regulaminu. 
                  Pełna treść regulaminu znajduje się w dokumencie PDF dostępnym do pobrania powyżej. 
                  W przypadku rozbieżności między tekstem a dokumentem PDF, obowiązuje treść dokumentu PDF.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="mt-8 border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-2">
                Masz pytania dotyczące regulaminu?
              </h3>
              <p className="text-muted-foreground mb-4">
                Skontaktuj się z nami, aby uzyskać szczegółowe informacje o warunkach uczestnictwa w naszych wycieczkach.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/#contact">
                  <Button variant="outline" className="border-accent hover:bg-accent/10">
                    Formularz kontaktowy
                  </Button>
                </Link>
                <Button variant="ghost" className="text-accent hover:text-accent/80">
                  kontakt@zlotyzolwik.pl
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Regulamin;