

## Plan wymiany klucza Google Maps API

### Zmiana do wykonania

W pliku `src/components/DestinationsMap.tsx` (linia 63) należy zaktualizować klucz API:

**Obecny klucz:**
```
AIzaSyChmqyXmSyRWcrS01NkeinvXld1vS7Uzzk
```

**Nowy klucz:**
```
AIzaSyA095vYT5-WuSJT8u8M1SydzttPXnDXYI0
```

### Szczegóły techniczne

Zmiana dotyczy jednej linii w funkcji `loadGoogleMaps`:

```javascript
// Przed:
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyChmqyXmSyRWcrS01NkeinvXld1vS7Uzzk&libraries=places`;

// Po:
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA095vYT5-WuSJT8u8M1SydzttPXnDXYI0&libraries=places`;
```

### Uwaga dotycząca bezpieczeństwa

Klucz Google Maps API jest kluczem **publicznym** (używanym w przeglądarce), więc jego przechowywanie w kodzie jest akceptowalne. Dla dodatkowego bezpieczeństwa warto upewnić się, że w konsoli Google Cloud Platform masz ustawione:
- Ograniczenie domeny (HTTP referrers) do `zloty-zolwik.pl` i `*.lovable.app`
- Ograniczenie do używanych API (Maps JavaScript API, Places API)

### Rezultat

Po tej zmianie mapa w sekcji "Nasze destynacje" będzie korzystać z nowego klucza API.

