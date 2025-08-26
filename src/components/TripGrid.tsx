import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trips";
import TripCard from "./TripCard";
import { useToast } from "@/hooks/use-toast";

interface TripGridProps {
  searchFilters?: {
    destination: string;
    priceRange: string;
    departureDate: Date | undefined;
  };
  onTripSelect: (trip: Trip) => void;
}

const TripGrid = ({ searchFilters, onTripSelect }: TripGridProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
  }, [searchFilters]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('trips')
        .select('*')
        .eq('is_active', true)
        .order('departure_date', { ascending: true });

      // Apply filters
      if (searchFilters?.destination) {
        query = query.ilike('destination', `%${searchFilters.destination}%`);
      }

      if (searchFilters?.priceRange) {
        const [min, max] = searchFilters.priceRange.includes('+') 
          ? [3000, Infinity]
          : searchFilters.priceRange.split('-').map(Number);
        
        query = query.gte('price', min);
        if (max !== Infinity) {
          query = query.lte('price', max);
        }
      }

      if (searchFilters?.departureDate) {
        const dateStr = searchFilters.departureDate.toISOString().split('T')[0];
        query = query.gte('departure_date', dateStr);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ofert wycieczek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold mb-4">Brak wyników</h3>
        <p className="text-muted-foreground">
          Nie znaleźliśmy wycieczek spełniających Twoje kryteria. 
          Spróbuj zmienić filtry wyszukiwania.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <TripCard 
          key={trip.id} 
          trip={trip} 
          onViewDetails={onTripSelect}
        />
      ))}
    </div>
  );
};

export default TripGrid;