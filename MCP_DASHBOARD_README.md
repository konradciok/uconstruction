# MCP Admin Dashboard - Instrukcje Uruchomienia

## Przegląd
Dashboard admin do zarządzania operacjami MCP (Model Context Protocol) dla synchronizacji produktów między PostgreSQL a Stripe.

## Wymagania
- Node.js 18+
- PostgreSQL (uruchomiony)
- Stripe API keys skonfigurowane
- MCP pakiety zainstalowane

## Instalacja

### 1. Zainstaluj zależności
```bash
npm install @heroicons/react
```

### 2. Sprawdź konfigurację MCP
```bash
# Sprawdź czy MCP pakiety są zainstalowane
npm run mcp:test

# Sprawdź połączenie z bazą danych
npm run prisma:studio
```

### 3. Uruchom aplikację
```bash
npm run dev
```

## Dostęp do Dashboardu

### URL Dashboardu
```
http://localhost:3000/admin/mcp
```

### Strony Dashboardu
- **Główna:** `/admin/mcp` - Status overview i quick actions
- **Produkty:** `/admin/mcp/products` - Zarządzanie produktami
- **Logi:** `/admin/mcp/logs` - Monitorowanie aktywności

## Funkcjonalności

### 1. Status Overview
- **PostgreSQL:** Liczba produktów i status synchronizacji
- **Stripe:** Liczba produktów w Stripe
- **Sync Status:** Procent zsynchronizowanych produktów

### 2. Quick Actions
- **Sync Database → Stripe:** Synchronizacja wszystkich produktów z bazy do Stripe
- **Sync Stripe → Database:** Aktualizacja mapowania Stripe ID w bazie
- **Check Status:** Odświeżenie statusu

### 3. Zarządzanie Produktami
- **Lista produktów** z filtrami i wyszukiwaniem
- **Status synchronizacji** dla każdego produktu
- **Sync individual** - synchronizacja pojedynczego produktu
- **View details** - szczegóły produktu

### 4. Logi i Monitoring
- **Real-time logs** z operacji synchronizacji
- **Filtry** według poziomu i operacji
- **Export** logów (w przyszłości)

## API Endpoints

### Status
```typescript
GET /api/admin/mcp/status
// Zwraca status synchronizacji
```

### Synchronizacja
```typescript
POST /api/admin/mcp/sync/database-to-stripe
POST /api/admin/mcp/sync/stripe-to-database
// Uruchamia synchronizację
```

### Produkty
```typescript
GET /api/admin/mcp/products
// Lista produktów z filtrami
POST /api/admin/mcp/products/[id]/sync
// Synchronizacja pojedynczego produktu
```

### Logi
```typescript
GET /api/admin/mcp/logs
// Lista logów z filtrami
```

## Konfiguracja

### Environment Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Database Configuration
DATABASE_URL=postgresql://...

# MCP Configuration
MCP_STRIPE_ENABLED=true
MCP_POSTGRES_ENABLED=true
```

### Bezpieczeństwo
- Dashboard jest dostępny tylko w trybie development
- W produkcji dodaj autoryzację (NextAuth.js)
- Ogranicz dostęp do adminów

## Rozwiązywanie Problemów

### 1. Błąd połączenia z bazą danych
```bash
# Sprawdź czy PostgreSQL działa
docker-compose ps

# Sprawdź połączenie
npm run prisma:studio
```

### 2. Błąd MCP
```bash
# Sprawdź instalację MCP
npm run mcp:test

# Sprawdź zmienne środowiskowe
echo $STRIPE_SECRET_KEY
```

### 3. Błąd synchronizacji
- Sprawdź logi w dashboardzie
- Sprawdź czy produkty mają poprawne dane
- Sprawdź połączenie z Stripe API

## Rozszerzenia

### 1. Dodanie autoryzacji
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Sprawdź autoryzację admin
}
```

### 2. Real-time updates
```typescript
// WebSocket dla logów na żywo
const eventSource = new EventSource('/api/admin/mcp/stream')
```

### 3. Scheduled sync
```typescript
// Cron job dla automatycznej synchronizacji
// Użyj Vercel Cron lub podobnego
```

## Struktura Plików

```
src/app/admin/mcp/
├── page.tsx                    # Dashboard główny
├── products/
│   └── page.tsx               # Zarządzanie produktami
├── logs/
│   └── page.tsx               # Logi
└── api/
    ├── status/route.ts        # API status
    ├── sync/
    │   ├── database-to-stripe/route.ts
    │   └── stripe-to-database/route.ts
    ├── products/
    │   ├── route.ts
    │   └── [id]/sync/route.ts
    └── logs/route.ts
```

## Roadmap

### Phase 1: Basic Dashboard ✅
- [x] Status overview
- [x] Manual sync operations
- [x] Basic product listing
- [x] Logs viewer

### Phase 2: Advanced Features
- [ ] Real-time logs
- [ ] Bulk operations
- [ ] Error handling improvements
- [ ] Product details modal

### Phase 3: Automation
- [ ] Scheduled sync
- [ ] Webhooks
- [ ] Email notifications
- [ ] Performance metrics

## Wsparcie

W przypadku problemów:
1. Sprawdź logi w dashboardzie
2. Sprawdź konfigurację MCP
3. Sprawdź połączenia z bazą danych i Stripe
4. Sprawdź zmienne środowiskowe

---

**Dashboard jest gotowy do użycia! Uruchom `npm run dev` i przejdź do `http://localhost:3000/admin/mcp`**
