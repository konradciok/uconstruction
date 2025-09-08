/**
 * Mobile Menu Component - Template Implementation
 * 
 * Mobile navigation menu with hamburger toggle
 * integrated with the main site's design system.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './mobile-menu.module.css'

interface MenuItem {
  title: string
  path: string
}

interface MobileMenuProps {
  menu: MenuItem[]
}

export function MobileMenu({ menu }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuClick = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <div className={styles.mobileMenu}>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={styles.hamburgerButton}
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`} />
        <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`} />
        <span className={`${styles.hamburgerLine} ${isOpen ? styles.hamburgerLineOpen : ''}`} />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.menuPanel} onClick={(e) => e.stopPropagation()}>
            {/* Menu Header */}
            <div className={styles.menuHeader}>
              <h2 className={styles.menuTitle}>Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.closeButton}
                aria-label="Close mobile menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Menu Items */}
            <nav className={styles.menuNav}>
              <ul className={styles.menuList}>
                <li>
                  <Link
                    href="/"
                    onClick={() => handleMenuClick('/')}
                    className={styles.menuLink}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    onClick={() => handleMenuClick('/shop')}
                    className={styles.menuLink}
                  >
                    Shop
                  </Link>
                </li>
                {menu.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      onClick={() => handleMenuClick(item.path)}
                      className={styles.menuLink}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/about"
                    onClick={() => handleMenuClick('/about')}
                    className={styles.menuLink}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={() => handleMenuClick('/contact')}
                    className={styles.menuLink}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Menu Footer */}
            <div className={styles.menuFooter}>
              <p className={styles.menuFooterText}>
                Discover beautiful watercolor artwork
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      className={styles.closeIcon}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}
