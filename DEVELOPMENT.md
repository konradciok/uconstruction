# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## Project Overview

**Status**: 95% Complete - Production Ready
**Framework**: Next.js 15.4.6 + TypeScript
**Styling**: CSS Modules + CSS Variables
**Deployment**: Vercel (ready)

## Key Files

### Core Components

- `src/app/page.tsx` - Home page
- `src/components/Hero.tsx` - Hero section
- `src/components/ContactForm.tsx` - Contact form
- `src/components/WorkshopDatePicker.tsx` - Workshop booking

### Styling

- `src/styles/globals.css` - Global styles and CSS variables
- `src/components/*.module.css` - Component-scoped styles

### Configuration

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration

## Styling System

### CSS Variables (Design Tokens)

```css
:root {
  --color-background: #f2f2f2;
  --color-text: #111111;
  --color-primary: #80a6f2;
  --color-accent: #f2eda7;
  --spacing-md: 1rem;
  --font-size-base: 1rem;
}
```

### CSS Modules Usage

```typescript
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>Content</div>;
}
```

### Utility Classes

```css
.text-lg {
  font-size: var(--font-size-lg);
}
.p-md {
  padding: var(--spacing-md);
}
.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out;
}
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_FORMSPREE_FORM_ID=your_form_id
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Common Tasks

### Adding a New Page

1. Create `src/app/new-page/page.tsx`
2. Add CSS module: `src/app/new-page/page.module.css`
3. Update navigation if needed

### Adding a New Component

1. Create `src/components/NewComponent.tsx`
2. Create `src/components/NewComponent.module.css`
3. Import and use in pages

### Modifying Styles

1. Update CSS variables in `globals.css` for global changes
2. Modify component `.module.css` files for component-specific changes
3. Use utility classes for common patterns

### Adding Workshop Dates

1. Update `src/lib/workshop-dates.ts`
2. Create Stripe Payment Link for each date
3. Test booking flow

## Development Workflow

### Before Starting

```bash
npm install
npm run type-check
```

### During Development

```bash
npm run dev
# Visit http://localhost:3000
```

### Before Committing

```bash
npm run lint
npm run format
npm run type-check
npm run build
```

## Troubleshooting

### Build Issues

```bash
# Clear cache
rm -rf .next
rm -f tsconfig.tsbuildinfo
npm run build
```

### Styling Issues

- Check CSS Module imports
- Verify CSS variable definitions
- Clear browser cache

### TypeScript Errors

```bash
npm run type-check
# Fix any type errors before committing
```

## Code Standards

### TypeScript

- Use strict mode
- Define interfaces for props
- Use proper typing for all functions

### CSS

- Use CSS Modules for component styles
- Use CSS variables for design tokens
- Mobile-first responsive design

### React

- Use functional components
- Use hooks for state management
- Follow Next.js App Router patterns

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Environment Variables for Production

- Use live Stripe keys
- Use production Formspree form ID
- Set up custom domain (optional)

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript checking

# Dependencies
npm install          # Install dependencies
npm update           # Update dependencies
```

## Local DB (Prisma + SQLite)

1. Create `.env.local` in the project root with:
   ```bash
   DATABASE_URL="file:./prisma/dev.db"
   ```
2. Install dependencies (includes Prisma and client):
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Initialize the SQLite DB and baseline migration (no models yet):
   ```bash
   npm run prisma:migrate
   ```

This will create `prisma/dev.db` and the Prisma client in `src/generated/prisma` (gitignored).

## File Structure Reference

```
src/
├── app/                    # Pages (App Router)
│   ├── about/
│   ├── commissions/
│   ├── workshops/
│   ├── success/
│   ├── layout.tsx
│   └── page.tsx
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── Hero.tsx
│   ├── ContactForm.tsx
│   └── *.module.css
├── styles/
│   └── globals.css       # Global styles
├── lib/                  # Utilities
└── types/                # TypeScript types
```

## Support

- **Documentation**: See `DOCUMENTATION.md` for complete details
- **Issues**: Check troubleshooting section above
- **External Docs**: Next.js, Stripe, Formspree documentation
