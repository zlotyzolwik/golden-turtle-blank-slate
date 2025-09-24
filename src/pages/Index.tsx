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
    "telephone": "514176996",
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

        
        <Gallery />
        <FAQ />
        <ContactForm />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Złoty Żółwik</h3>
              <p className="text-sm opacity-80">
                Organizujemy niezapomniane wycieczki po najpiękniejszych zakątkach świata od 2008 roku.
              </p>
            </div>
            <div>
              
              
            </div>
            <div className="mx-0">
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>514176996</li>
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