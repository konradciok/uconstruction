# MCP Admin Dashboard - Specyfikacja

## Przegląd
Prosty dashboard admin do zarządzania operacjami MCP (Model Context Protocol) dla synchronizacji produktów między PostgreSQL a Stripe.

## Architektura

### Stack Technologiczny
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma
- **Database:** PostgreSQL (istniejąca)
- **MCP Integration:** Stripe MCP + PostgreSQL MCP
- **UI Components:** Headless UI + Heroicons

## Struktura Dashboardu

### 1. Strona Główna (`/admin/mcp`)
```
┌─────────────────────────────────────────────────────────┐
│ MCP Admin Dashboard                                    │
├─────────────────────────────────────────────────────────┤
│ Status Overview                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ PostgreSQL  │ │ Stripe      │ │ Sync Status │        │
│ │ ✅ 66 prod  │ │ ✅ 68 prod  │ │ ✅ 100%     │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│ Quick Actions                                          │
│ [Sync All Products] [Check Status] [View Logs]         │
└─────────────────────────────────────────────────────────┘
```

### 2. Strony Funkcjonalne

#### A. Synchronizacja Produktów (`/admin/mcp/sync`)
- **Sync Database → Stripe**
  - Lista produktów do synchronizacji
  - Progress bar dla operacji
  - Logi w czasie rzeczywistym
  - Przycisk "Start Sync"

- **Sync Stripe → Database**
  - Lista produktów Stripe
  - Mapowanie z bazą danych
  - Przycisk "Update Database"

#### B. Zarządzanie Produktami (`/admin/mcp/products`)
- **Tabela produktów** z filtrami:
  - Status synchronizacji
  - Nazwa produktu
  - Stripe ID
  - Data ostatniej synchronizacji
- **Akcje na produktach:**
  - Sync individual
  - View details
  - Edit mapping

#### C. Logi i Monitoring (`/admin/mcp/logs`)
- **Logi operacji** w czasie rzeczywistym
- **Filtry:** Data, typ operacji, status
- **Export logów** do CSV

## Komponenty UI

### 1. Status Cards
```typescript
interface StatusCardProps {
  title: string
  value: string | number
  status: 'success' | 'warning' | 'error'
  icon: React.ComponentType
}
```

### 2. Sync Progress
```typescript
interface SyncProgressProps {
  total: number
  completed: number
  current: string
  logs: string[]
}
```

### 3. Product Table
```typescript
interface ProductTableProps {
  products: Product[]
  onSync: (id: string) => void
  onView: (id: string) => void
  filters: FilterState
}
```

## API Endpoints

### 1. Status Endpoints
```typescript
// GET /api/admin/mcp/status
interface StatusResponse {
  postgres: {
    totalProducts: number
    syncedProducts: number
    lastSync: string
  }
  stripe: {
    totalProducts: number
    lastSync: string
  }
  syncStatus: {
    percentage: number
    lastFullSync: string
  }
}
```

### 2. Sync Endpoints
```typescript
// POST /api/admin/mcp/sync/database-to-stripe
interface SyncRequest {
  productIds?: string[] // Optional: sync specific products
  force?: boolean // Force sync even if already synced
}

// POST /api/admin/mcp/sync/stripe-to-database
interface StripeSyncRequest {
  updateExisting?: boolean
}
```

### 3. Product Endpoints
```typescript
// GET /api/admin/mcp/products
interface ProductsResponse {
  products: Array<{
    id: string
    handle: string
    title: string
    stripeProductId: string | null
    lastSynced: string | null
    status: 'synced' | 'pending' | 'error'
  }>
  pagination: {
    page: number
    limit: number
    total: number
  }
}

// POST /api/admin/mcp/products/sync/:id
// POST /api/admin/mcp/products/update-mapping
```

## Funkcjonalności

### 1. Automatyczna Synchronizacja
- **Scheduled Sync:** Cron job co X godzin
- **Real-time Sync:** WebSocket dla logów na żywo
- **Incremental Sync:** Tylko zmienione produkty

### 2. Monitoring i Alerty
- **Health Checks:** Sprawdzanie połączeń MCP
- **Error Notifications:** Alerty przy błędach
- **Performance Metrics:** Czas synchronizacji, throughput

### 3. Bulk Operations
- **Mass Sync:** Wszystkie produkty naraz
- **Selective Sync:** Wybrane produkty
- **Rollback:** Cofnięcie ostatniej synchronizacji

## Implementacja

### 1. Struktura Plików
```
src/app/admin/mcp/
├── page.tsx                 # Dashboard główny
├── sync/
│   ├── page.tsx            # Strona synchronizacji
│   └── components/
│       ├── SyncProgress.tsx
│       └── SyncLogs.tsx
├── products/
│   ├── page.tsx            # Lista produktów
│   └── components/
│       ├── ProductTable.tsx
│       └── ProductFilters.tsx
├── logs/
│   ├── page.tsx            # Logi
│   └── components/
│       └── LogViewer.tsx
└── components/
    ├── StatusCard.tsx
    ├── MCPStatus.tsx
    └── DashboardLayout.tsx
```

### 2. API Routes
```
src/app/api/admin/mcp/
├── status/route.ts
├── sync/
│   ├── database-to-stripe/route.ts
│   └── stripe-to-database/route.ts
├── products/
│   ├── route.ts
│   └── [id]/sync/route.ts
└── logs/route.ts
```

### 3. Hooks i Utilities
```typescript
// hooks/useMCPStatus.ts
export function useMCPStatus() {
  // Real-time status updates
}

// hooks/useSync.ts
export function useSync() {
  // Sync operations with progress
}

// lib/mcp-client.ts
export class MCPClient {
  // Wrapper for MCP operations
}
```

## Bezpieczeństwo

### 1. Autoryzacja
- **Admin-only access:** Middleware sprawdzający uprawnienia
- **Session management:** NextAuth.js lub podobne
- **API rate limiting:** Ograniczenie zapytań

### 2. Walidacja
- **Input validation:** Zod schemas
- **MCP response validation:** Sprawdzanie odpowiedzi MCP
- **Error handling:** Graceful error recovery

## Konfiguracja

### 1. Environment Variables
```env
# MCP Configuration
MCP_STRIPE_ENABLED=true
MCP_POSTGRES_ENABLED=true
MCP_SYNC_INTERVAL=3600 # seconds

# Admin Dashboard
ADMIN_DASHBOARD_ENABLED=true
ADMIN_SESSION_SECRET=your-secret
```

### 2. Database Schema
```sql
-- Tabela dla logów synchronizacji
CREATE TABLE sync_logs (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela dla konfiguracji
CREATE TABLE mcp_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Roadmap

### Phase 1: Basic Dashboard
- [ ] Status overview
- [ ] Manual sync operations
- [ ] Basic product listing

### Phase 2: Advanced Features
- [ ] Real-time logs
- [ ] Bulk operations
- [ ] Error handling

### Phase 3: Automation
- [ ] Scheduled sync
- [ ] Webhooks
- [ ] Notifications

## Przykłady Użycia

### 1. Sprawdzenie Statusu
```typescript
const status = await fetch('/api/admin/mcp/status')
const data = await status.json()
console.log(`Synced: ${data.postgres.syncedProducts}/${data.postgres.totalProducts}`)
```

### 2. Synchronizacja Produktów
```typescript
const syncResponse = await fetch('/api/admin/mcp/sync/database-to-stripe', {
  method: 'POST',
  body: JSON.stringify({ force: false })
})
```

### 3. Monitorowanie Postępu
```typescript
const eventSource = new EventSource('/api/admin/mcp/sync/stream')
eventSource.onmessage = (event) => {
  const progress = JSON.parse(event.data)
  updateProgressBar(progress)
}
```

## UI/UX Guidelines

### 1. Design System
- **Colors:** Tailwind CSS palette
- **Typography:** Inter font family
- **Spacing:** 4px grid system
- **Components:** Headless UI base

### 2. Responsive Design
- **Mobile-first:** Progressive enhancement
- **Breakpoints:** sm, md, lg, xl
- **Touch-friendly:** Minimum 44px touch targets

### 3. Accessibility
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support

---

**Ten dashboard zapewni prosty i intuicyjny sposób zarządzania wszystkimi operacjami MCP, umożliwiając efektywną synchronizację produktów między PostgreSQL a Stripe.**
