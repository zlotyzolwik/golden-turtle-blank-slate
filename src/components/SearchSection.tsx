import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface SearchSectionProps {
  onSearch: (filters: {
    destination: string;
    priceRange: string;
    departureDate: Date | undefined;
  }) => void;
}

const SearchSection = ({ onSearch }: SearchSectionProps) => {
  const [destination, setDestination] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();

  const handleSearch = () => {
    onSearch({
      destination,
      priceRange,
      departureDate
    });
  };

  return (
    <section id="search-section" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Znajdź Idealną Wycieczkę</h2>
          <p className="text-xl text-muted-foreground">
            Użyj filtrów, aby znaleźć wycieczkę dopasowaną do Twoich potrzeb
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label htmlFor="destination">Destynacja</Label>
              <Input
                id="destination"
                placeholder="np. Włochy, Chorwacja..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Przedział cenowy</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz cenę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1000">Do 1000 PLN</SelectItem>
                  <SelectItem value="1000-2000">1000 - 2000 PLN</SelectItem>
                  <SelectItem value="2000-3000">2000 - 3000 PLN</SelectItem>
                  <SelectItem value="3000+">Powyżej 3000 PLN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data wyjazdu</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? (
                      format(departureDate, "PPP", { locale: pl })
                    ) : (
                      <span>Wybierz datę</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button size="lg" onClick={handleSearch} className="h-11">
              <Search className="mr-2 h-4 w-4" />
              Szukaj
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;