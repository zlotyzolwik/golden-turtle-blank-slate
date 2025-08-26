import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import SearchSection from "@/components/SearchSection";
import TripGrid from "@/components/TripGrid";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import { Trip } from "@/types/trips";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<any>();

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    const tripsSection = document.getElementById('trips-section');
    tripsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTripSelect = (trip: Trip) => {
    navigate(`/trip/${trip.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">WycieczkiPL</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>Strona główna</Button>
            {user ? (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Panel Admin
              </Button>
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
        <SearchSection onSearch={handleSearch} />
        
        <section id="trips-section" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Nasze Wycieczki</h2>
              <p className="text-xl text-muted-foreground">
                Odkryj najpiękniejsze zakątki Europy z naszymi starannie przygotowanymi wycieczkami
              </p>
            </div>
            <TripGrid searchFilters={searchFilters} onTripSelect={handleTripSelect} />
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
              <h3 className="text-xl font-bold mb-4">WycieczkiPL</h3>
              <p className="text-sm opacity-80">
                Organizujemy niezapomniane wycieczki po Europie od 2008 roku.
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
            <p>&copy; 2024 WycieczkiPL. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
