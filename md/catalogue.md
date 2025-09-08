# UConstruction Project Catalogue

## 📋 Project Overview

This repository contains **three separate Next.js applications**:

### 1. Main Watercolor Artist Site (Primary Project)
- **Location**: Root directory (`/`)
- **Purpose**: Professional watercolor artist website for Anna Ciok
- **Status**: Production-ready (98% complete)
- **Features**: Portfolio, e-commerce, workshop booking, contact forms

### 2. Next.js Commerce Template
- **Location**: `nextjs-commerce-temp/`
- **Purpose**: E-commerce boilerplate/template
- **Status**: Template/starting point
- **Features**: Product catalog, cart, Shopify integration

### 3. UConstruction Subdirectory
- **Location**: `uconstruction/`
- **Purpose**: Alternative e-commerce implementation
- **Status**: Separate implementation
- **Features**: Product pages, search, cart system

---

# Specyfikacja: Strona kategorii „Printy FineArt" (katalog produktów)

**Adresat:** agent kodowania *Cloudecode*  
**Stack:** React (JS), CSS (CSS Modules lub `*.css`), bez frameworków UI (czysty CSS)  
**Cel:** minimalistyczny, responsywny katalog produktów, który **świetnie eksponuje mockupy pionowe 4:5**, działa szybko (CWV), jest dostępny (a11y) i konwertuje (UX e‑commerce).

---

## 1) Wymagania biznesowe i UX

- **Układ kolumn:**
  - **Mobile**: 1 kolumna (duży thumbnail, pod spodem tytuł + cena).
  - **Duże ekrany / wysoka rozdzielczość**: **2 szerokie kolumny** (duże miniatury).
- **Obrazy:** wszystkie miniatury utrzymują **proporcję 4:5** (pion). Kadrowanie bez zniekształceń.
- **Karta produktu:** kliknięcie **całej karty** prowadzi do strony produktowej (`/product/:slug`).
- **Teksty pod miniaturą:** mały podpis (tytuł) + cena; cena w lokalnym formacie.
- **Minimalizm:** dużo „oddechu”, brak ramek, subtelny hover.
- **Dostępność:** poprawne `alt`, kontrasty, fokus, semantyka.
- **Wydajność/CWV:** responsywne obrazy (`srcset`/`sizes`), lazy‑loading, `decoding="async"`, prefetch/prioritization pierwszego rzędu, bez CLS (zdefiniowane wymiary).

---

## 2) Model danych (minimalny)

```ts
type Product = {
  id: string
  slug: string
  title: string
  price: number            // w walucie 'currency'
  currency: 'PLN' | 'EUR' | 'USD'
  image: {
    alt: string
    // ścieżki do wariantów szerokości (4:5)
    srcJpg: string         // fallback
    srcWebp?: string       // preferowane
    widths: number[]       // np. [480, 640, 800, 960, 1280]
  }
}
```

> **Założenie buildowe:** obrazy są dostępne w wariantach szerokości odpowiadających `widths`, np. `/images/{slug}-{w}.webp` i `/images/{slug}-{w}.jpg`.

---

## 3) Struktura plików

```
src/
  components/
    ProductGrid.jsx
    ProductCard.jsx
  styles/
    product-grid.css
  utils/
    formatPrice.js
  data/
    products.sample.json   // do prototypu
```

---

## 4) Implementacja

### 4.1 `utils/formatPrice.js`
```js
export function formatPrice(value, currency = 'PLN', locale = 'pl-PL') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}
```

### 4.2 `components/ProductCard.jsx`
```jsx
import React from 'react'
import { formatPrice } from '../utils/formatPrice'
// style dostarczany globalnie przez import w ProductGrid.jsx; dla CSS Modules zastosuj klasy modułowe

export default function ProductCard({ product }) {
  const { slug, title, price, currency, image } = product
  const widths = image.widths || [480, 640, 800, 960, 1280]

  // Zbuduj srcsety (AVIF/WebP/JPG — WebP/JPG w przykładzie)
  const webpSet = image.srcWebp
    ? widths.map(w => `${image.srcWebp.replace('{w}', w)} ${w}w`).join(', ')
    : null
  const jpgSet = widths.map(w => `${image.srcJpg.replace('{w}', w)} ${w}w`).join(', ')

  // Docelowa szerokość kolumny na szerokich ekranach ~600–640px
  const sizes = '(min-width: 1280px) 600px, (min-width: 1024px) 540px, 90vw'

  return (
    <article className="productCard">
      <a className="productLink" href={`/product/${slug}`} aria-label={title}>
        <figure className="thumbWrap">
          <picture>
            {webpSet && <source type="image/webp" srcSet={webpSet} sizes={sizes} />}
            <img
              className="thumb"
              src={image.srcJpg.replace('{w}', widths[0])}
              srcSet={jpgSet}
              sizes={sizes}
              alt={image.alt || title}
              loading="lazy"
              decoding="async"
              width="800"
              height="1000" // 4:5 to 0.8:1; 800x1000 pasuje do ratio i zapobiega CLS
            />
          </picture>
        </figure>
        <div className="meta">
          <h3 className="title">{title}</h3>
          <div className="price" aria-label={`Cena ${formatPrice(price, currency)}`}>
            {formatPrice(price, currency)}
          </div>
        </div>
      </a>
    </article>
  )
}
```

### 4.3 `components/ProductGrid.jsx`
```jsx
import React from 'react'
import ProductCard from './ProductCard'
import '../styles/product-grid.css'

export default function ProductGrid({ products = [] }) {
  return (
    <main className="catalogue" aria-label="Katalog printów FineArt">
      <header className="catalogueHeader">
        <h1>Printy FineArt</h1>
      </header>

      <section className="grid" role="list">
        {products.map(p => (
          <div role="listitem" key={p.id} className="gridItem">
            <ProductCard product={p} />
          </div>
        ))}
      </section>
    </main>
  )
}
```

### 4.4 `styles/product-grid.css`
> **Uwaga:** jeśli używasz CSS Modules, zamień selektory na klasy modułowe. Poniżej czysty CSS.

```css
:root{
  --gap: 2rem;
  --maxw: 1440px;
  --card-radius: 12px;
  --shadow: 0 8px 24px rgba(0,0,0,.08);
  --shadow-hover: 0 12px 28px rgba(0,0,0,.12);
  --border: rgba(0,0,0,.08);
  --text: #111;
  --muted: #666;
  --skeleton: #f3f3f3;
  --focus: 2px solid #111;
}

* { box-sizing: border-box; }

.catalogue {
  margin: 0 auto;
  padding: 1.5rem;
  max-width: var(--maxw);
  color: var(--text);
}

.catalogueHeader h1 {
  font-size: clamp(1.25rem, 1rem + 1.5vw, 2rem);
  letter-spacing: 0.01em;
  margin: 0 0 1rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;          /* 1 kolumna na mobile */
  gap: var(--gap);
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: 1fr 1fr;    /* 2 kolumny na dużych ekranach */
    align-items: start;
  }
}

.gridItem { /* hak na ewentualne container queries w przyszłości */ }

/* Karta produktu */
.productCard {
  display: block;
  background: #fff;
  border-radius: var(--card-radius);
  box-shadow: var(--shadow);
  overflow: clip;
  transition: transform .2s ease, box-shadow .2s ease;
}

.productLink {
  display: grid;
  grid-template-rows: auto auto;
  text-decoration: none;
  color: inherit;
  outline: none;
}

.productLink:focus-visible {
  outline: var(--focus);
  outline-offset: -4px;
}

.thumbWrap {
  margin: 0;
  background: var(--skeleton);
}

.thumb {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;   /* gwarancja 4:5, brak CLS */
  object-fit: cover;
  object-position: center;
  background: var(--skeleton);
  /* opcjonalnie: preferuj antyaliasing */
  image-rendering: auto;
}

.meta {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 0.5rem 1rem;
  padding: 0.875rem 1rem 1rem;
}

.title {
  font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.05rem);
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
}

.price {
  font-size: clamp(0.95rem, 0.9rem + 0.25vw, 1.05rem);
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}

.productCard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Prefers-reduced-motion: ogranicz animacje */
@media (prefers-reduced-motion: reduce) {
  .productCard { transition: none; }
}

/* Wysokie DPI – nic specjalnego w CSS; jakość zapewnia srcset/sizes */
```

---

## 5) SEO i oznaczenia strukturalne

- **Kategoria**: użyj JSON‑LD `ItemList` z listą pozycji (url, pozycja).  
- **Linkowanie**: relatywne linki do `/product/:slug`.
- **Rel prev/next**: jeśli jest paginacja.

### Przykład JSON‑LD (w komponencie strony kategorii)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "url": "https://example.com/product/a"},
    {"@type": "ListItem", "position": 2, "url": "https://example.com/product/b"}
  ]
}
</script>
```

---

## 6) Wydajność i jakość obrazów

- **Wymiary w HTML** (`width`/`height`) + `aspect-ratio: 4/5` → brak **CLS**.
- **`srcset`/`sizes`**: przeglądarka pobierze możliwie mały, ale ostry wariant.
- **Formaty**: preferuj **WebP/AVIF** (jeżeli build je generuje) + fallback JPG.
- **Lazy‑loading**: `loading="lazy"` + `decoding="async"`; pierwsze 1–2 obrazki nad foldem możesz renderować bez `lazy` i z `fetchpriority="high"`.
- **Kompresja**: dobre jakościowo (~80–85 JPG / wizualnie bezstratny WebP/AVIF).
- **Kadrowanie**: przygotuj pliki w 4:5 (unikniesz „pustych” pasków).

---

## 7) Dostępność (a11y)

- **Alternatywy obrazów:** opis `alt` (np. „Print FineArt: *Tytuł*”).
- **Fokus klawiatury:** `:focus-visible` na linku karty.
- **Semantyka listy:** `role="list"` i `role="listitem"` lub `<ul><li>`.
- **Czytelność:** kontrast tekst/cena ≥ WCAG AA, czytelne font‑size.

---

## 8) Integracja (routing / dane)

- **Routing:** jeśli używasz React Router – podmień `<a>` na `<Link to={...}>`.
- **Dane:** komponent `ProductGrid` przyjmuje `products: Product[]`. W SSR/SPA źródło bez znaczenia (REST/GraphQL/static).

---

## 9) Akceptacja / testy ręczne (checklista QA)

1. Mobile ≤ 768px: 1 kolumna; brak poziomych scrolli.
2. ≥ 1024px: **dokładnie 2** szerokie kolumny; miniatury 4:5.
3. Hover/fokus: miękki cień, brak „skakania” układu (**0 CLS**).
4. LCP obraz: ostry na Retinie dzięki `srcset`; brak rozmycia.
5. Lazy‑loading działa: sieć „Slow 3G” — obrazy pod foldem nie pobierają się od razu.
6. A11y: tabem da się przejść przez karty; czytelny fokus.
7. Cena formatuje się lokalnie (`pl-PL`/`PLN` itp.).
8. Link z karty prowadzi do `/product/:slug`.
9. Lighthouse: Performance ≥ 90 na mobile, Accessibility ≥ 95.

---

## 10) Przykładowe dane (`data/products.sample.json`)

```json
[
  {
    "id": "p1",
    "slug": "zloty-swit",
    "title": "Złoty świt",
    "price": 399,
    "currency": "PLN",
    "image": {
      "alt": "Print FineArt – Złoty świt",
      "srcWebp": "/images/zloty-swit-{w}.webp",
      "srcJpg": "/images/zloty-swit-{w}.jpg",
      "widths": [480, 640, 800, 960, 1280]
    }
  }
]
```

---

## 11) Zadania dla *Cloudecode* (kroki wdrożenia)

1. **Stwórz pliki** wg struktury z rozdz. 3 i wklej kod z rozdz. 4.
2. **Dodaj sample** z rozdz. 10; wyrenderuj `ProductGrid` w stronie kategorii.
3. **Wprowadź generowanie wariantów obrazów** (task opcjonalny, jeśli CDN/build już to robi):
   - konwencja nazw: `{slug}-{w}.webp|jpg`.
   - szerokości: `[480, 640, 800, 960, 1280]`.
4. **Sprawdź responsywność**: 1 kolumna (≤768px), 2 kolumny (≥1024px).
5. **A11y i CWV**: poprawny fokus, brak CLS, sensowny LCP.
6. **Dostosuj kolory/typografię** do brandu (zmienne CSS `:root`).

---

## 12) Pola do uzupełnienia (po stronie projektu)

- Kolory/typografia marki (podmień zmienne CSS).
- Sposób routingu (`<a>` vs `<Link>`).
- Dokładny maksymalny kontener (obecnie `--maxw: 1440px`).

---

## 13) Rozszerzenia na później (opcjonalnie)

- Filtry/sortowanie (np. rozmiar papieru, kolekcja, cena).
- „Quick view” w modalu (bez utraty prostoty).
- Szkielet ładowania (LQIP/blur data URL).

---

## 14) Notatki techniczne

- **Priorytetyzacja obrazów nad foldem:** rozważ `fetchpriority="high"` dla 1–2 pierwszych `<img>` w siatce (bez `loading="lazy"`).
- **Container Queries** (opcjonalnie) do drobnych korekt typografii w zależności od szerokości karty — wsparcie przeglądarek w 2025 jest powszechne.
- **Czystość DOM:** `article > a > figure + meta`, unikamy zagnieżdżania niepotrzebnych wrapperów.
- **Bezskończone scrollowanie**: na razie pomijamy; zalecana klasyczna paginacja.

---

## 15) Kryterium „Definition of Done”

- Layout zgodny z sekcją 1 i 4.
- UX/A11y zgodne z sekcją 7.
- CWV: brak CLS, LCP obraz z `srcset`, lazy‑loading aktywny.
- QA checklist przechodzi w Lighthouse (mobile).

---

# Uzupełnienie specyfikacji (React Router, backend, globalne kolory/typo)

## Zmiany kluczowe
- **Routing:** używamy **React Router** – zamieniamy `<a>` na `<Link>`.
- **Dane:** produkty i warianty pochodzą z **backendu/DB** (REST/GraphQL). Dodano hook `useProducts` z paginacją.
- **Kolory/typografia:** korzystamy z **globalnych tokenów projektu** (CSS variables/design tokens) – layout nie narzuca brandu.

## 1) Aktualizacja komponentów (React Router)

### `components/ProductCard.jsx`
```jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'

export default function ProductCard({ product }) {
  const { slug, title, price, currency, image } = product
  const widths = image.widths || [480, 640, 800, 960, 1280]

  const webpSet = image.srcWebp
    ? widths.map(w => `${image.srcWebp.replace('{w}', w)} ${w}w`).join(', ')
    : null
  const jpgSet = widths.map(w => `${image.srcJpg.replace('{w}', w)} ${w}w`).join(', ')

  const sizes = '(min-width: 1280px) 600px, (min-width: 1024px) 540px, 90vw'

  return (
    <article className="productCard">
      <Link className="productLink" to={`/product/${slug}`} aria-label={title}>
        <figure className="thumbWrap">
          <picture>
            {webpSet && <source type="image/webp" srcSet={webpSet} sizes={sizes} />}
            <img
              className="thumb"
              src={image.srcJpg.replace('{w}', widths[0])}
              srcSet={jpgSet}
              sizes={sizes}
              alt={image.alt || title}
              loading="lazy"
              decoding="async"
              width="800"
              height="1000"
            />
          </picture>
        </figure>
        <div className="meta">
          <h3 className="title">{title}</h3>
          <div className="price" aria-label={`Cena ${formatPrice(price, currency)}`}>
            {formatPrice(price, currency)}
          </div>
        </div>
      </Link>
    </article>
  )
}
```

### `components/ProductGrid.jsx` (bez zmian funkcjonalnych, tylko import CSS globalnie)
```jsx
import React from 'react'
import ProductCard from './ProductCard'
import '../styles/product-grid.css'

export default function ProductGrid({ products = [] }) {
  return (
    <main className="catalogue" aria-label="Katalog printów FineArt">
      <header className="catalogueHeader">
        <h1>Printy FineArt</h1>
      </header>
      <section className="grid" role="list">
        {products.map(p => (
          <div role="listitem" key={p.id} className="gridItem">
            <ProductCard product={p} />
          </div>
        ))}
      </section>
    </main>
  )
}
```

## 2) Pobieranie danych z backendu (REST) z paginacją i stanami

### `hooks/useProducts.jsx`
```jsx
import { useEffect, useState } from 'react'

export function useProducts({ page = 1, pageSize = 12, signal } = {}) {
  const [data, setData] = useState({ items: [], total: 0, page, pageSize })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = signal ? null : new AbortController()
    const abortSignal = signal || controller.signal
    setLoading(true)
    fetch(`/api/products?page=${page}&pageSize=${pageSize}`, { signal: abortSignal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(json => setData(json))
      .catch(e => {
        if (e.name !== 'AbortError') setError(e)
      })
      .finally(() => setLoading(false))

    return () => controller?.abort()
  }, [page, pageSize, signal])

  return { ...data, loading, error }
}
```

> **Odpowiedź API (propozycja):**
```json
{
  "items": [
    {
      "id": "p1",
      "slug": "zloty-swit",
      "title": "Złoty świt",
      "price": 399,
      "currency": "PLN",
      "image": {
        "alt": "Print FineArt – Złoty świt",
        "srcWebp": "/images/zloty-swit-{w}.webp",
        "srcJpg": "/images/zloty-swit-{w}.jpg",
        "widths": [480, 640, 800, 960, 1280]
      }
    }
  ],
  "total": 120,
  "page": 1,
  "pageSize": 12
}
```

### Przykładowa strona „Kategoria” z hookiem
```jsx
import React, { useState } from 'react'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../hooks/useProducts'

export default function CategoryPage() {
  const [page, setPage] = useState(1)
  const { items, total, pageSize, loading, error } = useProducts({ page, pageSize: 12 })

  if (error) return <p role="alert">Błąd wczytywania produktów.</p>

  return (
    <>
      {loading && <p aria-live="polite">Ładowanie…</p>}
      <ProductGrid products={items} />
      <nav aria-label="Paginacja" className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Poprzednia</button>
        <span>{page} / {Math.ceil(total / pageSize || 1)}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total}>Następna</button>
      </nav>
    </>
  )
}
```

## 3) Globalne kolory i typografia
- Layout **używa tylko zmiennych CSS** i nie wymusza brandingu.  
- Podłącz istniejący arkusz z tokenami (np. `:root { --text: …; --muted: … }`), a w `product-grid.css` korzystamy z nich bez redefiniowania.

Jeżeli globalne tokeny mają inne nazwy, podmień referencje w `product-grid.css` (np. `--color-text`, `--color-muted`, `--elevation-1`).

## 4) SSR / SEO (opcjonalnie)
- Jeśli masz SSR/SSG – pobierz pierwszą stronę `items` na serwerze; w `<head>` dodaj JSON-LD `ItemList`.  
- Pierwsze 1–2 obrazy nad „foldem” można wyrenderować bez `loading="lazy"` i z `fetchpriority="high"`.

## 5) Definition of Done – doprecyzowanie
- Linki kart używają `Link` z React Router i prawidłowo nawigują do `/product/:slug` (bez pełnego przeładowania).  
- Paginacja działa i jest **dostępna** (aria-label, disabled state).  
- Kolory/typo biorą się wprost z globalnych tokenów; Lighthouse (mobile) ≥ 90/95 (Perf/A11y).