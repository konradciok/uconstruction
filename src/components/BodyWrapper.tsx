'use client';

import Header from './Header';
import Footer from './Footer';

interface BodyWrapperProps {
  children: React.ReactNode;
}

export default function BodyWrapper({ children }: BodyWrapperProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
