import {
  Bus,
  UserCheck,
  Ticket,
  Shield,
  Headphones,
  MapPin,
  ClipboardList,
  BadgeCheck,
} from "lucide-react";

const items = [
  { icon: Bus, label: "Komfortowy autokar z klimatyzacją" },
  { icon: UserCheck, label: "Doświadczony przewodnik" },
  { icon: Ticket, label: "Bilety wstępu do atrakcji" },
  { icon: Shield, label: "Ubezpieczenie uczestników" },
  { icon: Headphones, label: "Opieka koordynatora przez cały wyjazd" },
  { icon: MapPin, label: "Odbiór spod wskazanego adresu" },
  { icon: ClipboardList, label: "Indywidualny program wycieczki" },
  { icon: BadgeCheck, label: "Brak ukrytych kosztów" },
];

const WhatWeProvide = () => {
  return (
    <section
      id="co-zapewniamy"
      className="py-24 bg-background"
      aria-labelledby="what-we-provide-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="what-we-provide-heading" className="text-4xl font-bold mb-6">
            Co zapewniamy w cenie
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 p-6 rounded-lg bg-muted/30"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="font-medium leading-snug pt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeProvide;
