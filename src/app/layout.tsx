import type { Metadata } from 'next';
import '../styles/globals.css';
import BodyWrapper from '../components/BodyWrapper';

export const metadata: Metadata = {
  title: 'Watercolor Artist - Coming Soon',
  description:
    'Professional watercolor artist website coming soon. Contact for commissions and workshops.',
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
        <BodyWrapper>{children}</BodyWrapper>
      </body>
    </html>
  );
}
