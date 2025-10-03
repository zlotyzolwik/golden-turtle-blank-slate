import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import TripGrid from "@/components/TripGrid";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import { Trip } from "@/types/trips";
import Brand from "@/components/Brand";
import SEOHead from "@/components/SEOHead";
import DestinationsMap from "@/components/DestinationsMap";
const Index = () => {
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const handleTripSelect = (trip: Trip) => {
    navigate(`/trip/${trip.id}`);
  };
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Złoty Żółwik",
    "description": "Organizator wycieczek po Polsce i Europie od 2008 roku",
    "url": "https://zloty-zolwik.pl",
    "telephone": ["514176996", "517398308"],
    "email": "kontakt@zloty-zolwik.pl",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL",
      "addressLocality": "Polska"
    },
    "sameAs": ["https://facebook.com/zloty-zolwik", "https://instagram.com/zloty-zolwik"],
    "offers": {
      "@type": "Offer",
      "category": "Wycieczki",
      "description": "Wycieczki po Polsce i Europie"
    }
  };
  return <div className="min-h-screen">
      <SEOHead structuredData={homeStructuredData} canonicalUrl="https://zloty-zolwik.pl" />
      {/* Navigation */}
      <header>
        <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b" role="navigation" aria-label="Główna nawigacja">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Brand />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')} aria-label="Przejdź do strony głównej">Strona główna</Button>
              <Button variant="ghost" onClick={() => navigate('/vouchers')} aria-label="Zobacz vouchery">Vouchery</Button>
              {user ? <div className="flex items-center space-x-2">
                  <Link to="/my-reservations">
                    <Button variant="ghost" aria-label="Zobacz moje rezerwacje">
                      Moje Rezerwacje
                    </Button>
                  </Link>
                  {isAdmin && <Button variant="outline" onClick={() => navigate('/admin')} aria-label="Przejdź do panelu administracyjnego">
                      Panel Admin
                    </Button>}
                  <Button variant="outline" onClick={() => signOut()} aria-label="Wyloguj się">
                    Wyloguj
                  </Button>
                </div> : <Button onClick={() => navigate('/auth')} aria-label="Zaloguj się">
                  Zaloguj się
                </Button>}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main role="main">
        <Hero />
        
        <section id="trips-section" className="py-20 bg-background" aria-labelledby="trips-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="trips-heading" className="text-4xl font-bold mb-6">Nasze Wycieczki</h2>
              <p className="text-xl text-muted-foreground">
                Odkryj naszą bogatą ofertę wycieczek do najpiękniejszych miejsc w Polsce i Europie. Każda wycieczka to niezapomniane wspomnienia i profesjonalna opieka koordynatora
              </p>
            </div>
            <TripGrid onTripSelect={handleTripSelect} />
          </div>
        </section>

        {/* Destinations Section */}
        <section className="py-20 bg-muted/30" aria-labelledby="destinations-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="destinations-heading" className="text-4xl font-bold mb-4">Nasze destynacje</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Odkryj miejsca, które odwiedzamy podczas naszych wycieczek. Każdy punkt na mapie to niezapomniana przygoda
              </p>
            </div>
            <DestinationsMap onDestinationSelect={handleTripSelect} />
          </div>
        </section>

        {/* Corporate Trips Section */}
        <section className="py-20 bg-background" aria-labelledby="corporate-trips-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="corporate-trips-heading" className="text-4xl font-bold mb-4">
                Wycieczki „szyte na miarę" dla Firm – Złoty Żółwik 🐢✨
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Twoja firma zasługuje na wyjątkową integrację, która nie tylko zbliży zespół, ale też wzmocni jego lojalność i motywację. 
                W Złotym Żółwiku specjalizujemy się w jednodniowych wyjazdach „szytych na miarę", dopasowanych do potrzeb każdej firmy – 
                od małych zespołów po duże korporacje.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Jak to działa?</h3>
                  <p className="text-muted-foreground mb-4">To proste – Ty podajesz nam:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">👉</span>
                      <span>liczbę uczestników</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">👉</span>
                      <span>termin wyjazdu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">👉</span>
                      <span>budżet na osobę</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-2xl">👉</span>
                      <span>ewentualnie wymarzone miejsce lub kierunek</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-3">A my zajmujemy się resztą:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-xl">✔️</span>
                      <span>Tworzymy indywidualny plan wycieczki, dopasowany do oczekiwań Twojego zespołu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">✔️</span>
                      <span>Odbieramy pracowników bezpośrednio spod wskazanego adresu – wygodnie i punktualnie 🚍</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">✔️</span>
                      <span>Zapewniamy komfortowy autokar, przewodnika, bilety wstępu, ubezpieczenie i opiekę koordynatora</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">✔️</span>
                      <span>Gwarantujemy spokój i bezpieczeństwo – wszystko dopięte na ostatni guzik 😉</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Dlaczego warto wybrać Złotego Żółwika?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-xl">⭐</span>
                      <div>
                        <strong>Integracja i motywacja</strong>
                        <p className="text-muted-foreground">Twój zespół spędzi czas razem, lepiej się pozna i stworzy wspólne wspomnienia</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">⭐</span>
                      <div>
                        <strong>Prestiż i wizerunek firmy</strong>
                        <p className="text-muted-foreground">Pokażesz, że inwestujesz w ludzi i dbasz o ich komfort</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">⭐</span>
                      <div>
                        <strong>Elastyczność i wygoda dla zarządu</strong>
                        <p className="text-muted-foreground">My dbamy o całą logistykę, Ty cieszysz się efektem</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-xl">⭐</span>
                      <div>
                        <strong>Bez ukrytych kosztów</strong>
                        <p className="text-muted-foreground">U nas w jednej cenie: transport, przewodnik, bilety, ubezpieczenie i koordynator</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-bold mb-4 text-center">Przykładowe kierunki:</h3>
              <p className="text-center text-muted-foreground">
                Kraków, Wrocław, Gdańsk, Kazimierz Dolny, Sandomierz, Budapeszt, Wiedeń, Skalne Miasto Adršpach i wiele innych – 
                wybór należy do Ciebie i Twojego zespołu.
              </p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-xl font-semibold">
                💼 Złoty Żółwik – bo prawdziwa integracja zaczyna się od wspólnej podróży.
              </p>
              <p className="text-lg font-medium text-primary">
                Złoty Żółwik - spraw, aby Twoi pracownicy byli dumni, że stanowią część Twojej Firmy.
              </p>
              <Button 
                size="lg" 
                onClick={() => {
                  const contactSection = document.querySelector('#contact-section');
                  contactSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6"
              >
                Zapytaj o ofertę dla firm
              </Button>
            </div>
          </div>
        </section>

        <Gallery />
        <FAQ />
        <ContactForm />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/lovable-uploads/a27c4817-15d6-48be-941e-7b8c03441f76.png" 
                  alt="Złoty Żółwik logo" 
                  width="32"
                  height="32"
                  className="h-8 w-8 object-contain block shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <h3 className="text-xl font-bold">Złoty Żółwik</h3>
              </div>
              <p className="text-sm opacity-80">
                Organizujemy niezapomniane wycieczki po najpiękniejszych zakątkach świata od 2008 roku.
              </p>
            </div>
            <div>
              
              
            </div>
            <div className="mx-0">
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>514 176 996</li>
                <li>517 398 308</li>
                <li>kontakt@zloty-zolwik.pl</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Obserwuj nas</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-sm opacity-80 hover:opacity-100">Facebook</a>
                <a href="#" className="text-sm opacity-80 hover:opacity-100">Instagram</a>
                <a href="#" className="text-sm opacity-80 hover:opacity-100">YouTube</a>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p>&copy; 2024 Złoty Żółwik. Wszystkie prawa zastrzeżone.</p>
              <div className="flex gap-4">
                <Link to="/regulamin" className="hover:opacity-100">Regulamin</Link>
                <Link to="/polityka-prywatnosci" className="hover:opacity-100">Polityka prywatności</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;