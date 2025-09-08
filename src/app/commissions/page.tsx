'use client';

import React, { useState } from 'react';
import Container from '../../components/Container';
import { ContactForm } from '../../components/ContactForm';
import heroStyles from '../../components/Hero.module.css';
import styles from './page.module.css';

export default function CommissionsPage() {
  const [showContactForm, setShowContactForm] = useState(false);
  return (
    <div className={styles.commissionsPage}>
      <Container>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={`${styles.title} animate-fadeInUp`}>Commissions</h1>
          </header>

          <div className={styles.sections}>
            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>Let&apos;s make it</h2>
              <p className={styles.description}>
                While you can explore my currently available works in the
                &quot;Shop&quot; section, I also offer bespoke paintings created
                especially for you in a specific format and style. If
                you&apos;re interested in a custom piece, I would be delighted
                to bring your vision to life. Please feel free to contact me so
                we can discuss the details of our collaboration.
              </p>
              <button
                className={styles.contactButton}
                onClick={() => setShowContactForm(true)}
                type="button"
              >
                Contact Me
              </button>
            </section>

            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>Understanding Your Space</h2>
              <p className={styles.description}>
                I find it important to see the space where the painting will
                &quot;live.&quot; Understanding the surrounding forms, colors,
                and how light interacts in your environment greatly influences
                my creative process.
              </p>
            </section>

            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>Collaborative Process</h2>
              <p className={styles.description}>
                Before I begin, I like to have a conversation about your
                favorite watercolors, hues, forms, and artistic preferences.
                Getting to know your sensibilities ensures that the artwork
                fulfills your expectations.
              </p>
            </section>
          </div>
          {showContactForm && (
            <div className={heroStyles.contactFormOverlay}>
              <div className={heroStyles.contactFormContainer}>
                <button
                  className={heroStyles.closeButton}
                  onClick={() => setShowContactForm(false)}
                  aria-label="Close contact form"
                  type="button"
                >
                  ×
                </button>
                <ContactForm />
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
