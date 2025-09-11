import { Award, Heart, Globe, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const AboutSection = () => {
  const features = [
    {
      icon: Heart,
      title: "Pasja do Podróży",
      description: "Od 15 lat organizujemy wycieczki z miłością do odkrywania nowych miejsc"
    },
    {
      icon: Award,
      title: "Doświadczenie",
      description: "Ponad 10,000 zadowolonych klientów i setki udanych wycieczek"
    },
    {
      icon: Globe,
      title: "Najlepsze Destynacje",
      description: "Starannie wybrane miejsca, które zapadną Ci w pamięć na zawsze"
    },
    {
      icon: Users,
      title: "Profesjonalna Obsługa",
      description: "Doświadczeni przewodnicy i 24/7 wsparcie podczas podróży"
    }
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">O Nas</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Jesteśmy rodziną pasjonatów podróży, którzy od lat pomagają ludziom odkrywać 
            najpiękniejsze zakątki świata. Nasza misja to tworzenie niezapomnianych 
            wspomnień i pokazywanie, że podróżowanie może być proste, bezpieczne i pełne radości.
          </p>
        </div>

        {/* Desktop: Static Grid */}
        <div className="hidden lg:grid grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-card rounded-lg shadow-lg p-8 text-center group hover:shadow-xl transition-all duration-300 h-80 flex flex-col">
                <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground flex-1">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet: Carousel */}
        <div className="lg:hidden">
          <Carousel className="w-full max-w-sm mx-auto md:max-w-2xl">
            <CarouselContent className="-ml-2 md:-ml-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2">
                    <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 text-center group hover:shadow-xl transition-all duration-300 h-72 md:h-80 flex flex-col">
                      <div className="bg-primary/10 rounded-full p-4 md:p-6 w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-card-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-base flex-1">{feature.description}</p>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;