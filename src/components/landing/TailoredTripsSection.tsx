import { Button } from "@/components/ui/button";
import GoogleDestinationsMap from "@/components/landing/GoogleDestinationsMap";
import { DESTINATION_CITIES } from "@/components/landing/VirtualDestinationsMap";

const scrollToContact = () => {
  document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
};

const TailoredTripsSection = () => {
  const cityNames = DESTINATION_CITIES.map((c) => c.name).join(", ");

  return (
    <section
      id="wycieczki-szyte-na-miare"
      className="py-20 bg-background scroll-mt-24"
      aria-labelledby="tailored-trips-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="tailored-trips-heading" className="text-4xl font-bold mb-4">
            Wycieczki szyte na miarę – Złoty Żółwik 🐢✨
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            W Złotym Żółwiku specjalizujemy się w wyjazdach „szytych na miarę", dopasowanych do
            potrzeb każdej grupy – od małych zespołów po duże korporacje.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Jak to działa?</h3>
              <p className="text-muted-foreground mb-4">To proste – Ty podajesz nam:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    👉
                  </span>
                  <span>liczbę uczestników</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    👉
                  </span>
                  <span>termin wyjazdu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    👉
                  </span>
                  <span>budżet na osobę</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    👉
                  </span>
                  <span>ewentualnie wymarzone miejsce lub kierunek</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-3">A my zajmujemy się resztą:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ✔️
                  </span>
                  <span>
                    Tworzymy indywidualny plan wycieczki, dopasowany do oczekiwań Twojego zespołu
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ✔️
                  </span>
                  <span>
                    Odbieramy uczestników bezpośrednio spod wskazanego adresu – wygodnie i
                    punktualnie 🚍
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ✔️
                  </span>
                  <span>
                    Zapewniamy komfortowy autokar, przewodnika, bilety wstępu, ubezpieczenie i
                    opiekę koordynatora
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ✔️
                  </span>
                  <span>
                    Gwarantujemy spokój i bezpieczeństwo – wszystko dopięte na ostatni guzik 😉
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Dlaczego warto wybrać Złotego Żółwika?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ⭐
                  </span>
                  <div>
                    <strong>Integracja i motywacja</strong>
                    <p className="text-muted-foreground">
                      Twój zespół spędzi czas razem, lepiej się pozna i stworzy wspólne wspomnienia
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ⭐
                  </span>
                  <div>
                    <strong>Prestiż i wizerunek firmy</strong>
                    <p className="text-muted-foreground">
                      Pokażesz, że inwestujesz w ludzi i dbasz o ich komfort
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ⭐
                  </span>
                  <div>
                    <strong>Elastyczność i wygoda dla zarządu</strong>
                    <p className="text-muted-foreground">
                      My dbamy o całą logistykę, Ty cieszysz się efektem
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden="true">
                    ⭐
                  </span>
                  <div>
                    <strong>Bez ukrytych kosztów</strong>
                    <p className="text-muted-foreground">
                      U nas w jednej cenie: transport, przewodnik, bilety, ubezpieczenie i
                      koordynator
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div id="kierunki" className="mb-8 scroll-mt-24">
          <h3 className="text-xl font-bold mb-6 text-center">Przykładowe kierunki</h3>
          <GoogleDestinationsMap />
          <p className="text-center text-muted-foreground mt-6 max-w-4xl mx-auto">
            {cityNames} – i wiele innych... Nie widzisz swojego kierunku? Zapytaj – organizujemy
            wyjazdy niemal wszędzie, dopasowane do Twojej grupy.
          </p>
        </div>

        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">
            🐢 Złoty Żółwik — bo prawdziwa przygoda zaczyna się tam, gdzie kończy się codzienność.
          </p>
          <p className="text-lg font-medium text-primary">
            Poczuj magię wspólnego odkrywania i stwórz wspomnienia, które zostaną z Wami na całe życie.
          </p>
          <Button size="lg" onClick={scrollToContact} className="mt-6">
            Zapytaj o ofertę
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TailoredTripsSection;
