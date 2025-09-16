import { useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Brand from '@/components/Brand';
import { Link } from 'react-router-dom';

const Regulamin = () => {
  const [pdfError, setPdfError] = useState(false);

  const termsContent = [
    {
      title: "§1 Postanowienia ogólne",
      content: "Polish Brokerage Agency Sp. z o.o. z siedzibą w Warszawie przy ul. Królewskiej 16 lok. 11, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS 0000846950, REGON 520023985, NIP 5252901936, kapitał zakładowy 15.000,00 zł, działająca pod nazwą handlową 'Złoty Żółwik' organizuje wycieczki krajowe i zagraniczne."
    },
    {
      title: "§2 Rezerwacja i płatności",
      content: "Rezerwacja wycieczki następuje poprzez wniesienie opłaty rezerwacyjnej lub całej kwoty wycieczki. Płatność można dokonać online kartą płatniczą lub przelewem bankowym. Całość płatności musi być uregulowana najpóźniej na 7 dni przed rozpoczęciem wycieczki."
    },
    {
      title: "§3 Rezygnacja z wycieczki",
      content: "W przypadku rezygnacji z wycieczki pobierane są opłaty manipulacyjne: do 30 dni przed wyjazdem - 30% ceny wycieczki, od 15 do 29 dni - 50%, od 8 do 14 dni - 80%, mniej niż 7 dni przed wyjazdem - 100% ceny wycieczki."
    },
    {
      title: "§4 Zmiany w programie wycieczki",
      content: "Organizator zastrzega sobie prawo do wprowadzenia zmian w programie wycieczki z przyczyn niezależnych od niego. W przypadku istotnych zmian uczestnik ma prawo do rezygnacji z wycieczki bez ponoszenia kosztów rezygnacyjnych."
    },
    {
      title: "§5 Obowiązki uczestnika wycieczki",
      content: "Uczestnik zobowiązuje się do przestrzegania regulaminu wycieczki, wykonywania poleceń pilota, punktualnego stawiania się w ustalonych miejscach i terminach oraz ponoszenia odpowiedzialności za ewentualne szkody przez siebie wyrządzone."
    },
    {
      title: "§6 Odpowiedzialność koordynatora wycieczki",
      content: "Organizator odpowiada za należyte wykonanie usług objętych programem wycieczki. Odpowiedzialność organizatora ograniczona jest do wysokości ceny wycieczki, z wyłączeniem szkód na osobie."
    },
    {
      title: "§7 Ochrona danych osobowych (RODO)",
      content: "Dane osobowe uczestników wycieczek są przetwarzane zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO). Szczegółowe informacje o przetwarzaniu danych osobowych dostępne są w polityce prywatności."
    },
    {
      title: "§8 Postanowienia końcowe",
      content: "W sprawach nieuregulowanych niniejszym regulaminem stosuje się przepisy Kodeksu Cywilnego oraz ustawy o usługach turystycznych. Ewentualne spory będą rozstrzygane przez sąd właściwy dla siedziby organizatora."
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
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Pełna treść regulaminu dostępna w dokumencie PDF do pobrania.
                </p>
                <a href="/regulamin.pdf" download="Regulamin_Zloty_Zolwik.pdf">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Pobierz regulamin (PDF)
                  </Button>
                </a>
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
                Skontaktuj się z Polish Brokerage Agency Sp. z o.o. (Złoty Żółwik), aby uzyskać szczegółowe informacje o warunkach uczestnictwa w naszych wycieczkach.
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