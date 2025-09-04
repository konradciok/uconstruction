'use client';

import React from 'react';
import Image from 'next/image';
import Container from '../../components/Container';
import WorkshopDatePicker from '../../components/WorkshopDatePicker';
import styles from './page.module.css';

export default function WorkshopsPage() {
  return (
    <div className={styles.workshopsPage}>
      <Container>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={`${styles.title} animate-fadeInUp`}>
              Abstract Watercolor Workshop Inspired by Tenerife&apos;s Beauty
            </h1>
            <button
              className={styles.registerButton}
              onClick={() => {
                const titleEl = document.getElementById('workshop-date-picker-title');
                const containerEl = document.getElementById('workshop-date-picker');
                const target = titleEl || containerEl;
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Register now!
            </button>
          </header>
          
          <div className={styles.heroImage}>
            <Image
              src="/assets/pics/workshops.webp"
              alt="Watercolor workshop in Güímar"
              width={800}
              height={600}
              className={styles.image}
              priority
            />
          </div>
          
          <div className={styles.sections}>
            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>Workshop Overview</h2>
              <p className={styles.description}>
                Discover the art of watercolor painting in the heart of Güímar, a charming Canarian town full of history and local charm. Held in a beautiful 100-year-old Canarian home, this workshop invites you to immerse yourself in creativity while connecting with Tenerife&apos;s stunning landscapes and culture.
              </p>
              <div className={styles.workshopDetails}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>When:</span>
                  <span className={styles.detailValue}>Every Friday, 11:00 AM</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Where:</span>
                  <span className={styles.detailValue}>Güímar</span>
                </div>
              </div>
            </section>
            
            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>Who am I?</h2>
              <div className={styles.sectionContent}>
                <div className={styles.textContent}>
                  <p className={styles.description}>
                    I am a painter living on Tenerife, where I dedicate my time to creating and selling artworks to clients who wish to have beautiful, custom-made pieces of art in their new apartments, crafted by a local artist.
                  </p>
                  <p className={styles.description}>
                    In the past, I have conducted workshops at a friendly studio, gaining valuable experience in teaching both children and adults. Recently, I opened my own gallery, where I aim to continue inspiring others to explore and deepen their passion for art in a welcoming and creative environment.
                  </p>
                </div>
                <div className={styles.imageContainer}>
                  <Image
                    src="/assets/pics/workshops2.webp"
                    alt="Workshop environment and teaching"
                    width={400}
                    height={300}
                    className={styles.sectionImage}
                  />
                </div>
              </div>
            </section>
            
            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>Booking Your Watercolor Masterclass</h2>
              <p className={styles.description}>
                Select your preferred workshop date below, then complete your booking through our secure payment system. A confirmation email will be sent once your booking is complete. Ready to paint? Let&apos;s go! 🖌️
              </p>
              <WorkshopDatePicker 
                onDateSelect={(date) => {
                  console.log('Selected date:', date);
                  // The component handles the redirect to Stripe internally
                }}
                className={styles.datePicker}
              />
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
