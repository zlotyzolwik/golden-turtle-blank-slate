import { Building2, GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const audiences = [
  {
    icon: Building2,
    title: "Firmy",
    description:
      "Integracja zespołu, która naprawdę działa. Wspólna przygoda buduje relacje lepiej niż jakiekolwiek szkolenie.",
  },
  {
    icon: GraduationCap,
    title: "Szkoły i przedszkola",
    description:
      "Bezpieczne, dobrze zaplanowane wycieczki edukacyjne. Pełna dokumentacja, ubezpieczenie i opieka koordynatora.",
  },
  {
    icon: Users,
    title: "Grupy zorganizowane",
    description:
      "Koła gospodyń wiejskich, stowarzyszenia, grupy parafialne, seniorzy – organizujemy wyjazdy dla każdego.",
  },
];

const ForWhom = () => {
  return (
    <section
      id="dla-kogo"
      className="py-24 bg-muted/30"
      aria-labelledby="for-whom-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="for-whom-heading" className="text-4xl font-bold mb-6">
            Dla kogo organizujemy wyjazdy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {audiences.map((audience) => (
            <Card key={audience.title} className="border-none shadow-sm bg-card">
              <CardContent className="pt-8 pb-8 px-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <audience.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{audience.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForWhom;
