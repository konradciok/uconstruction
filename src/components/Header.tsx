import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import styles from './Header.module.css';

// Header component with logo image

export default function Header() {
  return (
    <header className={`${styles.header} animate-fadeInUp`}>
      <Container>
        <div className={styles.headerContent}>
          <div className={styles.branding}>
            <Link href="/" className={styles.logoLink}>
              <div className={styles.logoContainer}>
                <Image
                  src="/assets/pics/Logotype.avif"
                  alt="Watercolor Artist Logo"
                  width={40}
                  height={40}
                  className={styles.logoImage}
                  priority
                />
                <h1 className={`${styles.logo} animate-slideInLeft`}>Watercolor Artist</h1>
              </div>
            </Link>
          </div>
          <nav className={`${styles.navigation} animate-slideInRight`}>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/commissions" className={styles.navLink}>
              Commissions
            </Link>
            <Link href="/workshops" className={styles.navLink}>
              Workshops
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
