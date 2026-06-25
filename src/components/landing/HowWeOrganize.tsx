import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: 1,
    title: "Słuchamy",
    description:
      "Mówisz nam czego potrzebujesz – termin, liczba osób, budżet, kierunek. Resztą zajmujemy się my.",
  },
  {
    number: 2,
    title: "Planujemy",
    description:
      "Tworzymy indywidualny program wycieczki dopasowany do Twojej grupy. Żadnych gotowych szablonów.",
  },
  {
    number: 3,
    title: "Organizujemy",
    description:
      "Rezerwujemy autokar, przewodnika, bilety wstępu i ubezpieczenie. Wszystko w jednej cenie.",
  },
  {
    number: 4,
    title: "Jedziemy razem",
    description:
      "Koordynator towarzyszy grupie przez cały wyjazd. Jesteś pod opieką od wyjazdu do powrotu.",
  },
];

const HowWeOrganize = () => {
  return (
    <section
      id="jak-organizujemy"
      className="py-24 bg-background"
      aria-labelledby="how-we-organize-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 id="how-we-organize-heading" className="text-4xl font-bold mb-6">
            Jak organizujemy wycieczki
          </h2>
          <p className="text-xl text-muted-foreground">
            Nie jesteśmy biurem podróży. Jesteśmy organizatorem, który bierze na siebie całą logistykę.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="border-none shadow-sm bg-card">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeOrganize;
