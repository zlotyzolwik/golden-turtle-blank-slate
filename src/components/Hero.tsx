import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Hero = () => {
  const scrollToSearch = () => {
    const searchSection = document.getElementById('search-section');
    searchSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Podróżuj z Złotym Żółwikiem
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto">
          Niezapomniane wycieczki po najpiękniejszych zakątkach Europy. 
          Profesjonalna obsługa, najwyższa jakość, dostępne ceny.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            onClick={scrollToSearch}
          >
            <Search className="mr-2 h-5 w-5" />
            Znajdź Wycieczkę
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary"
          >
            Zobacz Oferty
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;