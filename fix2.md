# Fix plan status (2025-09-15)

- Completed: 1–13
- Pending: 14 (future)

---

## Step-by-step fix plan (prioritized)

### Critical correctness and stability

#### 1. Fix product route params typing — DONE

What: Updated params to be synchronous in src/app/product/[handle]/page.tsx for both generateMetadata and default export.
Why: Next App Router passes params synchronously.
Result: Clean SSR, correct types; no runtime warnings.

#### 2. Add missing dependency clsx — DONE

What: Ensured clsx in package.json.
Result: Stable installs/builds.

#### 3. Fix undefined CSS variables in accordions — DONE

What: Verified accordion-group.module.css uses valid tokens; no undefined vars present.
Result: Proper borders and transitions.

#### 4. Provide image fallback asset — DONE

What: Fallback points to public/assets/pics/main.png in template-adapters.ts.
Result: No 404s when media is missing.

#### 5. De-duplicate QuantityStepper IDs — DONE

What: Implemented unique IDs via useId and optional id/idSuffix; applied suffixes in Buy Box and Sticky Bar.
Result: Valid, conflict-free labeling.

#### 6. Wire the Cart Modal to open on add-to-cart success — DONE

What: Added onSuccess to AddToCart; passed handler from ProductPageClient via BuyBox/Sticky Bar.
Result: Modal opens after successful add.

#### 7. Normalize price formatting — DONE

What: Added formatting helpers and NaN guards in Buy Box and Sticky Bar.
Result: Consistent currency display; safe comparisons.

### ♿️ Responsiveness and accessibility

#### 8. Lightbox focus management — DONE

What: Focus close on open; restore focus to trigger on close; robust Escape handling.
Result: Predictable keyboard control.

#### 9. Motion and performance tuning — DONE

What: Avoid hydration warnings for reduced-motion by marking animated wrappers appropriately.
Result: Smoother perf and consistent hydration.

#### 10. Image domain audit — DONE

What: Confirmed cdn.shopify.com pattern present and sufficient for current media.
Result: Reliable image rendering.

### 🧹 Cleanup and resilience

#### 11. Remove unused legacy components — DONE

What: Removed variant-selector.tsx and description.tsx after confirming no imports.
Result: Smaller, clearer codebase.

#### 12. Harden compare-at price comparisons — DONE

What: Added NaN guards in both components.
Result: Safe conditional sale pricing.

#### 13. Tidy legacy comments in ProductPageClient.module.css — DONE

What: Cleaned legacy comment blocks.
Result: Easier maintenance.

#### 14. (Future) Clarify caching/SEO strategy — PENDING

Ideas: Adopt explicit revalidate/tags for product data and generateMetadata; add on-demand revalidation endpoint.
Goal: Predictable freshness and performance.

## Order of execution

1. 1–4 (correctness) → 5–7 (UX) → 8–10 (a11y/perf/images) → 11–13 (cleanup)
2. Type-check, lint, and build after step 7; second pass after cleanup.

## Test checklist

- Product page loads, no TS errors, no console errors.
- Gallery: zoom hover, swipe, lightbox open/close/Esc; thumbnails select; fallback image visible when missing media.
- Sticky Bar: appears on mobile only when CTA out of view; quantity changes update button; add-to-cart opens modal; totals correct.
- Buy Box: variant selection updates price; quantity stepper works; add-to-cart succeeds and modal opens.
- A11y: No duplicate IDs; lightbox focus/esc; buttons are real buttons (not divs).
- Performance: No visible jank; reduced-motion respected.
