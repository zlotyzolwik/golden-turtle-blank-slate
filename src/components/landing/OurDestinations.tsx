import VirtualDestinationsMap, {
  DESTINATION_CITIES,
} from "@/components/landing/VirtualDestinationsMap";

/**
 * Standalone destinations section — uses virtual map (no Google Maps API).
 * Primary map display is in TailoredTripsSection; this component is preserved
 * for re-enable via Index.tsx if needed.
 */
const OurDestinations = () => {
  const cityNames = DESTINATION_CITIES.map((c) => c.name).join(", ");

  return (
    <section
      id="kierunki"
      className="py-24 bg-muted/30"
      aria-labelledby="destinations-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="destinations-heading" className="text-4xl font-bold mb-6">
            Nasze kierunki
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Odkryj miejsca, do których organizujemy wyjazdy w Polsce i Europie Środkowej
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <VirtualDestinationsMap />
          <p className="text-center text-muted-foreground mt-8 text-lg max-w-3xl mx-auto">
            {cityNames} – i wiele innych. Nie widzisz swojego kierunku? Zapytaj – organizujemy
            wyjazdy niemal wszędzie.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurDestinations;
