import { useState } from "react";

export interface MapCity {
  name: string;
  lat: number;
  lng: number;
}

export const DESTINATION_CITIES: MapCity[] = [
  { name: "Kazimierz Dolny", lat: 51.32, lng: 21.95 },
  { name: "Gdańsk", lat: 54.35, lng: 18.65 },
  { name: "Szczecin", lat: 53.43, lng: 14.55 },
  { name: "Białowieża", lat: 52.7, lng: 23.85 },
  { name: "Kraków", lat: 50.06, lng: 19.94 },
  { name: "Wrocław", lat: 51.11, lng: 17.04 },
  { name: "Toruń", lat: 53.01, lng: 18.61 },
  { name: "Warszawa", lat: 52.23, lng: 21.01 },
  { name: "Suwałki", lat: 54.1, lng: 22.93 },
  { name: "Berlin", lat: 52.52, lng: 13.41 },
  { name: "Drezno", lat: 51.05, lng: 13.74 },
  { name: "Praga", lat: 50.08, lng: 14.44 },
  { name: "Ostrawa", lat: 49.83, lng: 18.29 },
  { name: "Bratysława", lat: 48.15, lng: 17.11 },
  { name: "Wilno", lat: 54.69, lng: 25.28 },
  { name: "Częstochowa", lat: 50.81, lng: 19.12 },
];

const MAP_BOUNDS = {
  minLat: 47.2,
  maxLat: 55.5,
  minLng: 12.5,
  maxLng: 26.5,
};

const project = (lat: number, lng: number) => {
  const x =
    ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y =
    ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { x, y };
};

const VirtualDestinationsMap = () => {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 100 72"
        className="w-full h-auto rounded-xl border border-border shadow-sm bg-card"
        role="img"
        aria-label="Mapa przykładowych kierunków wycieczek w Polsce i Europie Środkowej"
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
          </radialGradient>
          <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.4" stdDeviation="0.5" floodOpacity="0.25" />
          </filter>
        </defs>

        <rect x="0" y="0" width="100" height="72" fill="url(#mapGlow)" />

        {/* Simplified regional shapes — stylized, not geographic precision */}
        <path
          d="M 18 28 L 28 18 L 42 16 L 58 14 L 72 20 L 78 32 L 76 48 L 68 58 L 52 62 L 38 58 L 24 48 L 16 38 Z"
          fill="hsl(var(--muted))"
          fillOpacity="0.45"
          stroke="hsl(var(--border))"
          strokeWidth="0.3"
        />
        <path
          d="M 38 20 L 52 18 L 68 22 L 82 30 L 88 42 L 84 54 L 72 60 L 56 58 L 44 50 L 36 38 Z"
          fill="hsl(var(--primary))"
          fillOpacity="0.12"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />
        <path
          d="M 52 48 L 64 46 L 78 50 L 86 58 L 82 66 L 68 68 L 56 64 L 50 56 Z"
          fill="hsl(var(--muted))"
          fillOpacity="0.35"
          stroke="hsl(var(--border))"
          strokeWidth="0.25"
        />
        <path
          d="M 72 14 L 88 12 L 96 22 L 94 36 L 86 44 L 76 40 L 72 28 Z"
          fill="hsl(var(--muted))"
          fillOpacity="0.3"
          stroke="hsl(var(--border))"
          strokeWidth="0.25"
        />

        <text x="52" y="38" textAnchor="middle" fontSize="3.2" fill="hsl(var(--muted-foreground))" opacity="0.6">
          Polska
        </text>

        {DESTINATION_CITIES.map((city) => {
          const { x, y } = project(city.lat, city.lng);
          const isActive = activeCity === city.name;

          return (
            <g
              key={city.name}
              transform={`translate(${x}, ${y})`}
              onMouseEnter={() => setActiveCity(city.name)}
              onMouseLeave={() => setActiveCity(null)}
              onFocus={() => setActiveCity(city.name)}
              onBlur={() => setActiveCity(null)}
              tabIndex={0}
              role="button"
              aria-label={city.name}
              className="cursor-pointer outline-none"
            >
              <circle
                r={isActive ? 2.2 : 1.6}
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth="0.35"
                filter="url(#markerShadow)"
                className="transition-all duration-200"
              />
              {isActive && (
                <>
                  <circle r="3.5" fill="hsl(var(--primary))" fillOpacity="0.2" />
                  <text
                    y="-3"
                    textAnchor="middle"
                    fontSize="2.4"
                    fontWeight="600"
                    fill="hsl(var(--foreground))"
                  >
                    {city.name}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {DESTINATION_CITIES.map((city) => (
          <button
            key={city.name}
            type="button"
            onMouseEnter={() => setActiveCity(city.name)}
            onMouseLeave={() => setActiveCity(null)}
            onFocus={() => setActiveCity(city.name)}
            onBlur={() => setActiveCity(null)}
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

export default VirtualDestinationsMap;
