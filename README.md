# Watercolor Artist Website

Professional watercolor artist website for Anna Ciok featuring elegant watercolor-inspired design, contact forms, and workshop booking functionality.

## 📚 Documentation

This project includes comprehensive documentation:

- **[📖 Complete Documentation](DOCUMENTATION.md)** - Full project overview, features, and implementation details
- **[⚡ Development Guide](DEVELOPMENT.md)** - Quick reference for developers
- **[🚀 Deployment Checklist](DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[📋 Original Plan](PLAN.md)** - Original project planning and progress tracking

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## ✨ Features

- **🎨 Elegant Design**: Watercolor-inspired styling with CSS Modules
- **📱 Responsive Layout**: Mobile-first design that works on all devices
- **📧 Contact Form**: Integrated with Formspree for reliable email delivery
- **🎨 Workshop Booking**: Stripe Payment Link integration for workshop registrations
- **⚡ Performance**: Optimized for speed and user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 with TypeScript
- **Styling**: CSS Modules with CSS variables for design tokens
- **Forms**: Formspree for contact form handling
- **Payments**: Stripe for workshop bookings
- **Deployment**: Ready for Vercel deployment

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── ui/             # UI components (Button, Input, etc.)
│   └── *.module.css    # Component-scoped styles
├── styles/
│   └── globals.css     # Global styles and CSS variables
└── types/              # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Background**: `#F2F2F2` (light gray)
- **Text**: `#111111` (dark gray)
- **Primary Blue**: `#80A6F2` (soft blue)
- **Accent**: `#F2EDA7` (pale yellow)

### Styling Approach
- **CSS Variables**: Design tokens (colors, spacing, typography)
- **CSS Modules**: Component-scoped styling with `.module.css` files
- **Global Utilities**: Custom utility classes for common patterns
- **Responsive Design**: Mobile-first approach with CSS media queries

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🌍 Environment Variables

Required environment variables (see `env.example`):

```bash
NEXT_PUBLIC_FORMSPREE_FORM_ID=your_formspree_form_id
STRIPE_SECRET_KEY=sk_test_..._or_sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..._or_pk_live_...
```

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📖 Development

For detailed development information, see [DEVELOPMENT.md](DEVELOPMENT.md).

## 📋 Current Status

**✅ Production Ready (95% Complete)**

- ✅ Beautiful, responsive design
- ✅ Contact form functionality
- ✅ Workshop booking system
- ✅ Clean, maintainable codebase
- ⚠️ Production environment configuration needed

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Use CSS Modules for styling
3. Maintain TypeScript type safety
4. Test changes thoroughly before committing

## 📞 Support

- **Documentation**: See [DOCUMENTATION.md](DOCUMENTATION.md) for complete details
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md) for development guide
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions

---

**Status**: Production Ready | **Framework**: Next.js 15.4.6 | **Styling**: CSS Modules
