'use client';

import { useEffect } from 'react';
import Container from '../components/Container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Container>
        <div style={{ 
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            color: '#111111'
          }}>
            Something went wrong!
          </h2>
          <p style={{ 
            marginBottom: '2rem',
            color: '#666666',
            lineHeight: '1.6'
          }}>
            We encountered an unexpected error. Please try again or contact us if the problem persists.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#80A6F2',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#80A6F2',
                border: '2px solid #80A6F2',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
