import { useCallback, useEffect, useRef, useState } from "react";
import { DESTINATION_CITIES } from "@/components/landing/VirtualDestinationsMap";

declare global {
  interface Window {
    google: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyA095vYT5-WuSJT8u8M1SydzttPXnDXYI0";

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e4f0" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f0e1" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e8dcc8" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b896" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#8a7355" }] },
];

const GoogleDestinationsMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const initStartedRef = useRef(false);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const highlightCity = useCallback((cityName: string | null) => {
    setActiveCity(cityName);
    if (!googleMapRef.current || !infoWindowRef.current) return;

    if (!cityName) {
      infoWindowRef.current.close();
      return;
    }

    const marker = markersRef.current.find((m) => m.getTitle() === cityName);
    if (marker) {
      infoWindowRef.current.setContent(
        `<div style="padding:8px 4px;font-weight:600;color:#5c4a2e;">${cityName}</div>`
      );
      infoWindowRef.current.open(googleMapRef.current, marker);
    }
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || googleMapRef.current || initStartedRef.current) return;
    initStartedRef.current = true;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: 51.9194, lng: 19.1451 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: MAP_STYLES,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    googleMapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    const bounds = new google.maps.LatLngBounds();

    DESTINATION_CITIES.forEach((city) => {
      const position = { lat: city.lat, lng: city.lng };

      const marker = new google.maps.Marker({
        position,
        map,
        title: city.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#E6B800",
          fillOpacity: 1,
          strokeColor: "#FDF8E8",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => highlightCity(city.name));
      marker.addListener("mouseover", () => highlightCity(city.name));
      marker.addListener("mouseout", () => highlightCity(null));

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (markersRef.current.length > 0) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });

      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 7) map.setZoom(7);
        google.maps.event.removeListener(listener);
      });
    }

    setMapReady(true);
  }, [highlightCity]);

  useEffect(() => {
    const onScriptLoad = () => initializeMap();

    if (window.google?.maps) {
      initializeMap();
      return () => {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        infoWindowRef.current?.close();
        infoWindowRef.current = null;
        googleMapRef.current = null;
        initStartedRef.current = false;
      };
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", onScriptLoad);
      if (window.google?.maps) initializeMap();
      return () => {
        existingScript.removeEventListener("load", onScriptLoad);
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        infoWindowRef.current?.close();
        infoWindowRef.current = null;
        googleMapRef.current = null;
        initStartedRef.current = false;
      };
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = onScriptLoad;
    script.onerror = () => setLoadError(true);
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      googleMapRef.current = null;
      initStartedRef.current = false;
    };
  }, [initializeMap]);

  if (loadError) {
    return (
      <div className="w-full h-80 md:h-96 rounded-xl border border-border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Nie udało się załadować mapy Google</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative w-full h-80 md:h-96">
        {/* Map container must stay empty — Google Maps owns this DOM */}
        <div
          ref={mapRef}
          className="w-full h-full rounded-xl shadow-sm border border-border overflow-hidden"
          style={{ minHeight: "320px", background: "hsl(43 74% 95%)" }}
          role="img"
          aria-label="Mapa Google z przykładowymi kierunkami wycieczek w Polsce i Europie Środkowej"
        />
        {!mapReady && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted animate-pulse pointer-events-none"
            aria-hidden="true"
          >
            <p className="text-muted-foreground">Ładowanie mapy...</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {DESTINATION_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onMouseEnter={() => highlightCity(city.name)}
            onMouseLeave={() => highlightCity(null)}
            onFocus={() => highlightCity(city.name)}
            onBlur={() => highlightCity(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCity === city.name
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GoogleDestinationsMap;
