import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trip } from '@/types/trips';

export const MapSection = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripsWithLocations();
  }, []);

  const fetchTripsWithLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .eq('is_active', true);

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Nasze Destynacje</h2>
            <p className="text-xl text-muted-foreground">
              Odkryj miejsca, które odwiedzamy
            </p>
          </div>
          <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Nasze Destynacje</h2>
          <p className="text-xl text-muted-foreground">
            Odkryj miejsca, które odwiedzamy na mapie Europy
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">📍</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{trip.title}</h3>
                  <p className="text-muted-foreground mb-2">{trip.destination}</p>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {trip.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">
                      {trip.price} {trip.currency}
                    </span>
                    <a 
                      href={`/trip/${trip.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Zobacz szczegóły →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {trips.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Brak wycieczek z lokalizacją.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};