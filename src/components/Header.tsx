import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from './Container';
import styles from './Header.module.css';

// Header component with logo image and responsive hamburger menu

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
          
          {/* Hamburger Menu Button */}
          <button 
            className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

          {/* Navigation Menu */}
          <nav className={`${styles.navigation} ${isMenuOpen ? styles.navigationOpen : ''} animate-slideInRight`}>
            <Link href="/" className={styles.navLink} onClick={closeMenu}>
              Home
            </Link>
            <Link href="/about" className={styles.navLink} onClick={closeMenu}>
              About
            </Link>
            <Link href="/portfolio" className={styles.navLink} onClick={closeMenu}>
              Portfolio
            </Link>
            <Link href="/commissions" className={styles.navLink} onClick={closeMenu}>
              Commissions
            </Link>
            <Link href="/workshops" className={styles.navLink} onClick={closeMenu}>
              Workshops
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
