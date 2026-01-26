import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types/trips";
import { useToast } from "@/hooks/use-toast";

// Declare google maps types
declare global {
  interface Window {
    google: typeof google;
  }
}

interface DestinationsMapProps {
  onDestinationSelect?: (trip: Trip) => void;
}

const DestinationsMap = ({ onDestinationSelect }: DestinationsMapProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTripsWithCoordinates();
  }, []);

  useEffect(() => {
    if (trips.length > 0 && !loading) {
      loadGoogleMaps();
    }
  }, [trips, loading]);

  const fetchTripsWithCoordinates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('is_active', true)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('departure_date', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać destynacji",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA095vYT5-WuSJT8u8M1SydzttPXnDXYI0&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      toast({
        title: "Błąd",
        description: "Nie udało się załadować mapy Google",
        variant: "destructive",
      });
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || trips.length === 0) return;

    // Center map on Poland
    const map = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 51.9194, lng: 19.1451 }, // Poland center
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    googleMapRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each trip
    const bounds = new google.maps.LatLngBounds();

    trips.forEach((trip) => {
      if (trip.location_lat && trip.location_lng) {
        const position = {
          lat: Number(trip.location_lat),
          lng: Number(trip.location_lng)
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: trip.title,
          icon: {
            url: '/lovable-uploads/a27c4817-15d6-48be-941e-7b8c03441f76.png',
            scaledSize: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(16, 32)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-sm">
              <h3 class="font-bold text-lg mb-2">${trip.title}</h3>
              <p class="text-sm text-gray-600 mb-2">${trip.destination}</p>
              <p class="text-sm mb-3">${trip.description || ''}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-primary">${trip.price} ${trip.currency}</span>
                <span class="text-xs text-gray-500">${new Date(trip.departure_date).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onDestinationSelect) {
            onDestinationSelect(trip);
          }
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 10) map.setZoom(10);
        google.maps.event.removeListener(listener);
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Ładowanie mapy...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Brak dostępnych destynacji z koordynatami</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg shadow-lg border"
      style={{ minHeight: '400px' }}
    />
  );
};

export default DestinationsMap;