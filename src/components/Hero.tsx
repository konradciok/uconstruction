'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from './Container';
import Button from './ui/Button';
import WatercolorEffects from './WatercolorEffects';
import { ContactForm } from './ContactForm';
import styles from './Hero.module.css';

export default function Hero() {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <section className={styles.hero}>
      <WatercolorEffects />
      <Container>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.headline}>
              Explore My Art Portfolio
            </h1>
            <p className={styles.subtext}>
              Welcome to my world of creativity. I&apos;m Anna Ciok, an artist living and working in Tenerife. On this website, you&apos;ll have the chance to explore my artworks — both past creations and those currently available. You can also contact me directly to discuss custom commissions. Additionally, I invite you to glimpse my gallery in Guimar, where you can view my latest works in person. I hope your visit here will be a delightful and inspiring experience!
            </p>
            <div className={styles.ctaButtons}>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowContactForm(true)}
              >
                Take a look!
              </Button>
              <Link href="/portfolio">
                <Button variant="outline" size="lg">
                  Visit Gallery
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image 
              src="/assets/pics/main.png" 
              alt="Anna Ciok&apos;s artwork showcase" 
              width={600}
              height={400}
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
        
        {showContactForm && (
          <div className={styles.contactFormOverlay}>
            <div className={styles.contactFormContainer}>
              <button 
                className={styles.closeButton}
                onClick={() => setShowContactForm(false)}
                aria-label="Close contact form"
              >
                ×
              </button>
              <ContactForm />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
