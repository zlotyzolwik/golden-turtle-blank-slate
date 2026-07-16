# Progress — zloty-zolwik.pl (25.06.2026)

Dziennik zmian z sesji przebudowy publicznej strony z aplikacji sprzedaży wycieczek na landing organizatora wyjazdów.

---

## Cel projektu

Przebudowa **publicznego frontendu** na landing page bez usuwania:
- kodu backendu / panelu admina / autoryzacji
- tabel i danych Supabase
- tras `/admin/*`, `/trip/:id`, `/vouchers` itd.

Ukrywanie zamiast kasowania: flagi w `src/config/siteFeatures.ts`, komponent `LegacyHomeSections.tsx`.

---

## Infrastruktura i architektura

### Nowe pliki

| Plik | Rola |
|------|------|
| `src/config/siteFeatures.ts` | Flagi: `showTripsCatalog`, `showDestinationsMap`, `showGallery`, `showVouchersInNav` (wszystkie `false`) |
| `src/components/layout/PublicNav.tsx` | Nawigacja z kotwicami + auth/admin |
| `src/components/layout/PublicFooter.tsx` | Stopka (kontakt, linki prawne) |
| `src/components/landing/LegacyHomeSections.tsx` | Stary kod strony głównej (TripGrid, mapa tripów, sekcja firmowa, Gallery, FAQ, ContactForm) |
| `src/components/landing/TailoredTripsSection.tsx` | Główna sekcja „Wycieczki szyte na miarę” (2 kolumny + mapa + CTA) |
| `src/components/landing/GoogleDestinationsMap.tsx` | Mapa Google z markerami miast |
| `src/components/landing/VirtualDestinationsMap.tsx` | SVG mapa + `DESTINATION_CITIES` (zachowana, nieużywana na landingu) |
| `src/components/landing/FinalCTA.tsx` | Sekcja „Gotowy na wyjazd?” + formularz |
| `src/components/landing/HowWeOrganize.tsx` | 4 kroki (zakomentowane w Index) |
| `src/components/landing/ForWhom.tsx` | Firmy / szkoły / grupy (zakomentowane w Index) |
| `src/components/landing/WhatWeProvide.tsx` | Co zapewniamy w cenie |
| `src/components/landing/OurDestinations.tsx` | Statyczne kierunki (zakomentowane w Index) |
| `src/components/landing/WhyUs.tsx` | Dlaczego my (zakomentowane w Index) |
| `src/components/landing/Testimonials.tsx` | Opinie (karuzela, dane statyczne) |

### Zmodyfikowane pliki

- `src/pages/Index.tsx` — nowy układ landingu; `useLocation` + scroll do `#contact-section` z podstron
- `src/components/Hero.tsx` — nowy nagłówek, CTA, bez podtytułu
- `src/components/FAQ.tsx` — treść B2B; stara tablica jako zakomentowane `LEGACY_FAQS`
- `src/components/ContactForm.tsx` — propsy `hideHeader`, `embedded` dla FinalCTA
- `src/pages/PolitykaPrywatnosci.tsx` — email + link do formularza
- `src/pages/Regulamin.tsx` — email + link do formularza
- `src/pages/TripDetails.tsx` — jeden numer telefonu `514 176 996`
- `src/components/layout/PublicFooter.tsx` — branding, usunięty podtytuł pod logo

### Commit i deploy

- Commit: `483d984` — *Rebuild public site as trip-organization landing page.*
- Push: `main` → `origin/main` (repo: `zlotyzolwik/golden-turtle-blank-slate`)
- CI: workflow `.github/workflows/deploy.yml` → GitHub Pages → **zloty-zolwik.pl**
- Deploy run: [#28183479444](https://github.com/zlotyzolwik/golden-turtle-blank-slate/actions/runs/28183479444) (build ~27s, deploy z opóźnieniem ~5 min)

---

## Układ strony głównej (`/`)

Kolejność sekcji:

1. **Hero** — „Organizujemy wycieczki, które ludzie pamiętają latami.” + CTA
2. **TailoredTripsSection** — wycieczki szyte na miarę, jak to działa / dlaczego my, mapa kierunków
3. **WhatWeProvide** — co zapewniamy w cenie
4. **Gallery** — galeria z Supabase (`gallery_images`)
5. **Testimonials** — opinie statyczne
6. **FAQ** — 7 pytań B2B
7. **FinalCTA** — formularz kontaktowy (`#contact-section`)
8. **PublicFooter**

Zakomentowane (kod zachowany): `HowWeOrganize`, `ForWhom`, `OurDestinations`, `WhyUs`, `LegacyHomeSections`.

---

## Treści i copy (kluczowe)

### Hero
- Nagłówek: *Organizujemy wycieczki, które ludzie pamiętają latami.*
- Usunięty podtytuł o jednodniowych wyjazdach
- CTA: „Zapytaj o wyjazd” → `#contact-section`; „Zadzwoń: 514 176 996”

### TailoredTripsSection
- Tytuł: *Wycieczki szyte na miarę – Złoty Żółwik 🐢✨*
- Slogany końcowe (żółwik): przygoda / wspomnienia na całe życie
- Mapa: **Google Maps** (klucz jak w `DestinationsMap.tsx`)

### Miasta na mapie (`DESTINATION_CITIES`)

Kazimierz Dolny, Gdańsk, Szczecin, Białowieża, Kraków, Wrocław, Toruń, Warszawa, Suwałki, Berlin, Drezno, Praga, Ostrawa, Bratysława, Wilno, Częstochowa + tekst „i wiele innych…”

### Telefon
Wszędzie zamieniono **517 398 308** → **514 176 996** (Hero, FinalCTA, ContactForm, stopka, Index schema.org, TripDetails).

### Stopka
- Tytuł: *Złoty Żółwik – Organizator wyjazdów*
- Usunięto: *Jednodniowe wyjazdy dla firm, szkół i grup zorganizowanych.*

---

## Nawigacja (`PublicNav`)

| Link | Cel (`#id`) | Uwagi |
|------|-------------|--------|
| Jak działamy | `wycieczki-szyte-na-miare` | Początek sekcji szytych na miarę |
| Kierunki | `kierunki` | Blok mapy w TailoredTripsSection |
| Kontakt | `contact-section` | FinalCTA / formularz |
| ~~Dla kogo~~ | — | **Usunięte** z menu |

`scroll-mt-24` na sekcjach pod fixed navbar.

---

## Formularz kontaktowy

- Komponent: `ContactForm.tsx` → Supabase `contact_messages` + edge function `send-smtp-email`
- Osadzenie: `FinalCTA` (`embedded`, `hideHeader`)
- Linki z polityki/regulaminu: `Link to="/" state={{ scrollTo: "contact-section" }}` + `useEffect` w `Index.tsx`
- **HashRouter:** `/#contact` nie działa — używamy `location.state`

### Email RODO / regulamin
- `rodo@zlotyzolwik.pl` / `kontakt@zlotyzolwik.pl` → **`kontakt@zloty-zolwik.pl`** + `mailto:`

---

## Bugfixy

### GoogleDestinationsMap — crash React
- **Problem:** `NotFoundError: removeChild` — overlay ładowania wewnątrz `div` mapy
- **Fix:** pusty kontener mapy; spinner jako sibling; cleanup markerów przy unmount

### Navbar — martwe linki
- Stare ID (`jak-organizujemy`, `dla-kogo`, `kierunki`) były w wyłączonych komponentach
- Naprawiono ID w `TailoredTripsSection`; usunięto „Dla kogo”

---

## Co NIE zostało zrobione (do rozważenia)

- [ ] Webhook **n8n** przy wysyłce formularza (omówione, nie zaimplementowane)
- [ ] Plik **`public/regulamin.pdf`** — link na `/regulamin` zwraca 404
- [ ] `index.html` — statyczny `<title>` nadal stary; React `SEOHead` nadpisuje po załadowaniu JS
- [ ] Ponowne włączenie katalogu wycieczek: `siteFeatures.showTripsCatalog: true` + odkomentować `LegacyHomeSections` lub `TripGrid` w Index

---

## Dev / deploy — notatki

- Lokalny dev: `npm run dev` → **http://localhost:8080**
- Build: `npm run build` → `dist/`
- Domena: `CNAME` → `zloty-zolwik.pl`
- Supabase project: `xgvvcovmjqcpfmghawdy`
- Cache GitHub Pages: do ~10 min — po deployu twarde odświeżenie (Cmd+Shift+R)

---

## Stan repozytorium

- Branch: `main` (zsynchronizowany z origin po pushu 25.06.2026)
- Poprzedni commit na produkcji: `7ee7c9a` (Update Google Maps key)
- Aktualny commit landingu: `483d984`
