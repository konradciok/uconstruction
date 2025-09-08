/**
 * Footer Menu Component
 * 
 * Displays footer navigation menu
 * with watercolor artist aesthetic.
 */

import Link from 'next/link'
import styles from './footer-menu.module.css'

interface MenuItem {
  title: string
  path: string
}

interface FooterMenuProps {
  menu: MenuItem[]
}

export function FooterMenu({ menu }: FooterMenuProps) {
  if (!menu.length) {
    return (
      <div className={styles.footerMenu}>
        <div className={styles.menuSection}>
          <h3 className={styles.menuTitle}>Quick Links</h3>
          <ul className={styles.menuList}>
            <li>
              <Link href="/" className={styles.menuLink}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className={styles.menuLink}>
                Shop
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.menuLink}>
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className={styles.menuLink}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
        
        <div className={styles.menuSection}>
          <h3 className={styles.menuTitle}>Support</h3>
          <ul className={styles.menuList}>
            <li>
              <Link href="/shipping" className={styles.menuLink}>
                Shipping Info
              </Link>
            </li>
            <li>
              <Link href="/returns" className={styles.menuLink}>
                Returns
              </Link>
            </li>
            <li>
              <Link href="/faq" className={styles.menuLink}>
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/size-guide" className={styles.menuLink}>
                Size Guide
              </Link>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.footerMenu}>
      <div className={styles.menuSection}>
        <h3 className={styles.menuTitle}>Navigation</h3>
        <ul className={styles.menuList}>
          {menu.map((item) => (
            <li key={item.title}>
              <Link href={item.path} className={styles.menuLink}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
