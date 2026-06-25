import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// const LEGACY_FAQS = [
//   {
//     question: "Jak mogę dokonać rezerwacji?",
//     answer: "Rezerwacji możesz dokonać online poprzez naszą stronę internetową, telefonicznie lub osobiście w naszym biurze. Wystarczy wybrać interesującą Cię wycieczkę i kliknąć 'Rezerwuj teraz'."
//   },
//   {
//     question: "Jakie są warunki anulowania?",
//     answer: "Anulowanie do 30 dni przed wyjazdem - 100% zwrotu kosztów. Od 29 do 15 dni - 50% zwrotu. Poniżej 14 dni - brak zwrotu, chyba że znajdziemy zastępstwo."
//   },
//   {
//     question: "Czy cena zawiera ubezpieczenie?",
//     answer: "Tak, wszystkie nasze wycieczki zawierają podstawowe ubezpieczenie turystyczne KL/NNW. Oferujemy również rozszerzone ubezpieczenie za dodatkową opłatą."
//   },
//   {
//     question: "Czy można płacić w ratach?",
//     answer: "Tak, oferujemy możliwość płatności w ratach. Wpłata zaliczki 30% przy rezerwacji, pozostała kwota do 14 dni przed wyjazdem."
//   },
//   {
//     question: "Co jest wliczone w cenę wycieczki?",
//     answer: "W cenę wliczone są: transport, noclegi, wyżywienie według programu, opieka pilota, ubezpieczenie podstawowe oraz zwiedzanie zgodnie z programem."
//   },
//   {
//     question: "Jakie dokumenty są potrzebne?",
//     answer: "Do krajów UE wystarczy dowód osobisty ważny minimum 3 miesiące od daty powrotu. Do innych krajów może być wymagany paszport - szczegóły znajdziesz w opisie wycieczki."
//   },
//   {
//     question: "Czy jest możliwość zmiany terminu?",
//     answer: "Tak, zmiana terminu jest możliwa w zależności od dostępności miejsc i poniesienia ewentualnych kosztów różnicy cenowej oraz opłaty manipulacyjnej."
//   },
//   {
//     question: "Co w przypadku złej pogody?",
//     answer: "Program wycieczki może zostać nieznacznie zmodyfikowany w przypadku niekorzystnych warunków pogodowych, jednak nie wpływa to na zwrot kosztów."
//   }
// ];

const FAQ = () => {
  const faqs = [
    {
      question: "Jak dokonać rezerwacji?",
      answer:
        "Wystarczy wypełnić formularz kontaktowy lub zadzwonić. Oddzwonimy w ciągu 24 godzin i omówimy szczegóły.",
    },
    {
      question: "Ile kosztuje wycieczka?",
      answer:
        "Cena zależy od kierunku, liczby osób i programu. Wycenę przygotowujemy indywidualnie – zawsze bezpłatnie.",
    },
    {
      question: "Co jest wliczone w cenę?",
      answer:
        "Transport, przewodnik, bilety wstępu, ubezpieczenie i opieka koordynatora. Bez dopłat na miejscu.",
    },
    {
      question: "Czy można anulować wyjazd?",
      answer: "Tak. Szczegółowe warunki anulowania podajemy przy każdej wycenie.",
    },
    {
      question: "Czy można płacić w ratach?",
      answer: "Tak, dla grup zorganizowanych i firm oferujemy płatność w ratach.",
    },
    {
      question: "Jakie dokumenty są potrzebne?",
      answer:
        "Dla wyjazdów krajowych wystarczy dowód osobisty. Dla wyjazdów zagranicznych – dowód lub paszport.",
    },
    {
      question: "Co w przypadku złej pogody?",
      answer:
        "Staramy się planować program tak, aby pogoda nie wpłynęła na atrakcje. W razie potrzeby mamy alternatywne opcje.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-background" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="faq-heading" className="text-4xl font-bold mb-6">
            Najczęściej zadawane pytania
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
