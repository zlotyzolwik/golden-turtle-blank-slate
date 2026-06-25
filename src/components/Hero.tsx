import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

const Hero = () => {
  const scrollToContact = () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-20"
      aria-labelledby="hero-heading"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        }}
        role="img"
        aria-label="Piękny krajobraz górski - tło strony głównej"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center text-white space-y-8 px-4 max-w-4xl mx-auto">
        <h1
          id="hero-heading"
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-yellow-500"
        >
          Organizujemy wycieczki, które ludzie pamiętają latami.
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={scrollToContact} className="text-base px-8">
            Zapytaj o wyjazd
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base px-8 bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white"
          >
            <a href="tel:514176996" className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Zadzwoń: 514 176 996
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
