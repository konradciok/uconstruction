'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Container from '../../components/Container';
import { OrderDetails } from '../../types/workshop';
import styles from './page.module.css';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // For now, we'll show a generic success message
      // In the future, this can fetch real order details from the API
      try {
        // Simulate potential API call that could fail
        // In the future, replace this with actual API call
        setOrderDetails({
          customer_email: 'customer@example.com',
          amount_total: 5000, // €50.00 in cents
          currency: 'eur',
          workshop: {
            name: 'Abstract Watercolor Workshop',
            date: 'March 15, 2025',
            time: '11:00',
            location: 'Güímar, Tenerife'
          }
        });
        setLoading(false);
      } catch {
        setError('Failed to load booking details');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className={styles.successPage}>
        <Container>
          <div className={styles.content}>
            <div className={styles.loading}>Loading your booking details...</div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.successPage}>
      <Container>
        <div className={styles.content}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <span>✓</span>
            </div>
            
            <h1 className={styles.title}>Thank you for your booking!</h1>
            
            <p className={styles.subtitle}>
              Your watercolor workshop has been successfully booked. We&apos;ve sent a confirmation email with all the details.
            </p>

            {orderDetails && (
              <div className={styles.orderDetails}>
                <h2 className={styles.detailsTitle}>Booking Details</h2>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Workshop:</span>
                  <span className={styles.detailValue}>{orderDetails.workshop?.name}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date:</span>
                  <span className={styles.detailValue}>{orderDetails.workshop?.date}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Time:</span>
                  <span className={styles.detailValue}>{orderDetails.workshop?.time}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Location:</span>
                  <span className={styles.detailValue}>{orderDetails.workshop?.location}</span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Amount:</span>
                  <span className={styles.detailValue}>
                    €{(orderDetails.amount_total || 0) / 100}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.whatsNext}>
              <h3 className={styles.whatsNextTitle}>What&apos;s Next?</h3>
              <ul className={styles.whatsNextList}>
                <li>Check your email for the confirmation and workshop details</li>
                <li>Mark your calendar for the workshop date</li>
                <li>We&apos;ll send you a reminder 24 hours before the workshop</li>
                <li>Bring comfortable clothes and your creativity!</li>
              </ul>
            </div>

            <div className={styles.actions}>
              <Link href="/workshops" className={styles.backButton}>
                ← Back to Workshops
              </Link>
              
              <Link href="/" className={styles.homeButton}>
                Go to Homepage
              </Link>
            </div>

            {error && (
              <div className={styles.error}>
                <p>There was an issue loading your booking details, but your payment was successful.</p>
                <p>Please check your email for confirmation, or contact us if you have any questions.</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.successPage}>
        <Container>
          <div className={styles.content}>
            <div className={styles.loading}>Loading your booking details...</div>
          </div>
        </Container>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
