import React from 'react';
import Container from './Container';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`${styles.footer} animate-fadeInUp`}>
      <Container>
        <div className={styles.footerContent}>
          <div className={`${styles.copyright} animate-slideInLeft`}>
            <p>&copy; {currentYear} Watercolor Artist. All rights reserved.</p>
          </div>
          <div className={`${styles.socialLinks} animate-slideInRight`}>
            {/* Social links will be added later */}
          </div>
        </div>
      </Container>
    </footer>
  );
}
