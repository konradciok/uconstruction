import type { Metadata } from 'next';
import '../styles/globals.css';
import { Navbar } from '../components/layout/navbar';
import { Footer } from '../components/layout/footer';
import { CartProvider } from '../components/cart';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Watercolor Artist Site',
  description:
    'Discover beautiful watercolor artwork and prints. Handpicked collection of unique pieces from talented artists.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased-text" suppressHydrationWarning={true}>
        <CartProvider>
          <div className={styles.layout}>
            <Navbar 
              menu={[
                { title: 'Home', path: '/' },
                { title: 'About', path: '/about' },
                { title: 'Gallery', path: '/gallery' },
                { title: 'Commissions', path: '/commissions' },
                { title: 'Workshops', path: '/workshops' }
              ]}
              siteName="Watercolor Artist"
            />
            <main className={styles.main}>
              {children}
            </main>
            <Footer 
              menu={[
                { title: 'Home', path: '/' },
                { title: 'About', path: '/about' },
                { title: 'Gallery', path: '/gallery' },
                { title: 'Commissions', path: '/commissions' },
                { title: 'Workshops', path: '/workshops' }
              ]}
              siteName="Watercolor Artist"
              companyName="Watercolor Artist"
            />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
