import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import TripGrid from "@/components/TripGrid";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import { MapSection } from "@/components/MapSection";
import { Trip } from "@/types/trips";
import Brand from "@/components/Brand";

const Index = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleTripSelect = (trip: Trip) => {
    navigate(`/trip/${trip.id}`);
  };

  return (
    <div className="min-h-screen">
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
      <main>
        <Hero />
        <AboutSection />
        
        <section id="trips-section" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Nasze Wycieczki</h2>
              <p className="text-xl text-muted-foreground">
                Odkryj naszą bogatą ofertę wycieczek do najpiękniejszych miejsc w Polsce i Europie. Każda wycieczka to niezapomniane wspomnienia i profesjonalna opieka koordynatora
              </p>
            </div>
            <TripGrid onTripSelect={handleTripSelect} />
          </div>
        </section>

        <MapSection />
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
              <h4 className="font-semibold mb-4">Szybkie linki</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:opacity-100">O nas</a></li>
                <li><a href="#" className="hover:opacity-100">Oferta</a></li>
                <li><a href="#" className="hover:opacity-100">Kontakt</a></li>
                <li><a href="#" className="hover:opacity-100">Regulamin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>+48 123 456 789</li>
                <li>biuro@wycieczki.pl</li>
                <li>ul. Podróżnicza 123</li>
                <li>00-001 Warszawa</li>
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
            <p>&copy; 2024 Złoty Żółwik. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
