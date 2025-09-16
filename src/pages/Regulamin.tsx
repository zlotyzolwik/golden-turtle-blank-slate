import { useState } from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Brand from '@/components/Brand';
import { Link } from 'react-router-dom';

const Regulamin = () => {
  const [pdfError, setPdfError] = useState(false);


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