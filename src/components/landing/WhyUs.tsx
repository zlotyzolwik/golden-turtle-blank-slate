import { BadgeCheck, Heart, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Bez ukrytych kosztów",
    description: "Jedna cena obejmuje wszystko. Nie doliczymy nic na miejscu.",
  },
  {
    icon: Heart,
    title: "Indywidualne podejście",
    description:
      "Każdy wyjazd planujemy od nowa. Dopasowujemy program do Twojej grupy, nie odwrotnie.",
  },
  {
    icon: Award,
    title: "Doświadczenie",
    description:
      "Setki zrealizowanych wyjazdów. Wiemy, co może pójść nie tak – i wiemy, jak temu zapobiec.",
  },
  {
    icon: ShieldCheck,
    title: "Pełna opieka",
    description: "Koordynator jest z grupą przez cały czas. Możesz się zrelaksować.",
  },
];

const WhyUs = () => {
  return (
    <section
      id="dlaczego-my"
      className="py-24 bg-background"
      aria-labelledby="why-us-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="why-us-heading" className="text-4xl font-bold mb-6">
            Dlaczego Złoty Żółwik
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {reasons.map((reason) => (
            <Card key={reason.title} className="border-none shadow-sm bg-card">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <reason.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
