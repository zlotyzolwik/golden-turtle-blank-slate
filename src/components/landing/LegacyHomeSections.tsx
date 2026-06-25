import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TripGrid from "@/components/TripGrid";
import Gallery from "@/components/Gallery";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import DestinationsMap from "@/components/DestinationsMap";
import { Trip } from "@/types/trips";
import { SITE_FEATURES } from "@/config/siteFeatures";

/**
 * Legacy homepage sections from the trip-sales era.
 * Preserved for potential re-enable via SITE_FEATURES flags.
 */
const LegacyHomeSections = () => {
  const navigate = useNavigate();

  const handleTripSelect = (trip: Trip) => {
    navigate(`/trip/${trip.id}`);
  };

  return (
    <>
      {SITE_FEATURES.showTripsCatalog && (
        <section id="trips-section" className="py-20 bg-background" aria-labelledby="trips-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="trips-heading" className="text-4xl font-bold mb-6">
                Nasze Wycieczki
              </h2>
              <p className="text-xl text-muted-foreground">
                Odkryj naszą bogatą ofertę wycieczek do najpiękniejszych miejsc w Polsce i Europie.
                Każda wycieczka to niezapomniane wspomnienia i profesjonalna opieka koordynatora
              </p>
            </div>
            <TripGrid onTripSelect={handleTripSelect} />
          </div>
        </section>
      )}

      {SITE_FEATURES.showDestinationsMap && (
        <section className="py-20 bg-muted/30" aria-labelledby="destinations-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 id="destinations-heading" className="text-4xl font-bold mb-4">
                Nasze destynacje
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Odkryj miejsca, które odwiedzamy podczas naszych wycieczek. Każdy punkt na mapie to
                niezapomniana przygoda
              </p>
            </div>
            <DestinationsMap onDestinationSelect={handleTripSelect} />
          </div>
        </section>
      )}

      {/* Corporate Trips Section — original homepage content */}
      <section className="py-20 bg-background" aria-labelledby="corporate-trips-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 id="corporate-trips-heading" className="text-4xl font-bold mb-4">
              Wycieczki „szyte na miarę" dla Firm – Złoty Żółwik 🐢✨
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Twoja firma zasługuje na wyjątkową integrację, która nie tylko zbliży zespół, ale też
              wzmocni jego lojalność i motywację. W Złotym Żółwiku specjalizujemy się w
              jednodniowych wyjazdach „szytych na miarę", dopasowanych do potrzeb każdej firmy – od
              małych zespołów po duże korporacje.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4">Jak to działa?</h3>
                <p className="text-muted-foreground mb-4">To proste – Ty podajesz nam:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">👉</span>
                    <span>liczbę uczestników</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">👉</span>
                    <span>termin wyjazdu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">👉</span>
                    <span>budżet na osobę</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">👉</span>
                    <span>ewentualnie wymarzone miejsce lub kierunek</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-3">A my zajmujemy się resztą:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-xl">✔️</span>
                    <span>
                      Tworzymy indywidualny plan wycieczki, dopasowany do oczekiwań Twojego zespołu
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">✔️</span>
                    <span>
                      Odbieramy pracowników bezpośrednio spod wskazanego adresu – wygodnie i
                      punktualnie 🚍
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">✔️</span>
                    <span>
                      Zapewniamy komfortowy autokar, przewodnika, bilety wstępu, ubezpieczenie i
                      opiekę koordynatora
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">✔️</span>
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
                    <span className="text-xl">⭐</span>
                    <div>
                      <strong>Integracja i motywacja</strong>
                      <p className="text-muted-foreground">
                        Twój zespół spędzi czas razem, lepiej się pozna i stworzy wspólne wspomnienia
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <strong>Prestiż i wizerunek firmy</strong>
                      <p className="text-muted-foreground">
                        Pokażesz, że inwestujesz w ludzi i dbasz o ich komfort
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <strong>Elastyczność i wygoda dla zarządu</strong>
                      <p className="text-muted-foreground">
                        My dbamy o całą logistykę, Ty cieszysz się efektem
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">⭐</span>
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

          <div className="bg-muted/30 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Przykładowe kierunki:</h3>
            <p className="text-center text-muted-foreground">
              Kraków, Wrocław, Gdańsk, Kazimierz Dolny, Sandomierz, Budapeszt, Wiedeń, Skalne Miasto
              Adršpach i wiele innych – wybór należy do Ciebie i Twojego zespołu.
            </p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xl font-semibold">
              💼 Złoty Żółwik – bo prawdziwa integracja zaczyna się od wspólnej podróży.
            </p>
            <p className="text-lg font-medium text-primary">
              Złoty Żółwik - spraw, aby Twoi pracownicy byli dumni, że stanowią część Twojej Firmy.
            </p>
            <Button
              size="lg"
              onClick={() => {
                const contactSection = document.querySelector("#contact-section");
                contactSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-6"
            >
              Zapytaj o ofertę dla firm
            </Button>
          </div>
        </div>
      </section>

      {SITE_FEATURES.showGallery && <Gallery />}
      <FAQ />
      <ContactForm />
    </>
  );
};

export default LegacyHomeSections;
