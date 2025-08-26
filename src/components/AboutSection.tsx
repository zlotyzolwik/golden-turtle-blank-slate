import { Award, Heart, Globe, Users } from "lucide-react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center group">
                <div className="bg-primary/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;