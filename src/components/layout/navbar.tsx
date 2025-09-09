/**
 * Navbar Component - Template Implementation
 * 
 * Main navigation bar with logo, menu, search, and cart
 * integrated with the main site's design system.
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense, useState } from 'react'
import { CartModal, useCart } from '../cart'
import { Search } from './search'
import { MobileMenu } from './mobile-menu'
import styles from './navbar.module.css'

interface MenuItem {
  title: string
  path: string
}

interface NavbarProps {
  menu?: MenuItem[]
  siteName?: string
}

export function Navbar({ menu = [], siteName = 'Watercolor Artist' }: NavbarProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { getItemCount } = useCart()

  const itemCount = getItemCount()

  return (
    <nav className={`${styles.navbar} animate-fadeInUp`}>
      {/* Mobile Menu Button */}
      <div className={styles.mobileMenuButton}>
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>

      <div className={styles.navbarContent}>
        {/* Logo and Main Menu */}
        <div className={styles.logoSection}>
          <Link
            href="/"
            prefetch={true}
            className={styles.logoLink}
          >
            <div className={styles.logoContainer}>
              <Image
                src="/assets/pics/Logotype.avif"
                alt="Watercolor Artist Logo"
                width={40}
                height={40}
                className={styles.logoImage}
                priority
              />
              <h1 className={`${styles.logo} animate-slideInLeft`}>
                {siteName}
              </h1>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          {menu.length > 0 && (
            <ul className={`${styles.desktopMenu} animate-slideInRight`}>
              {menu.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className={styles.menuLink}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search */}
        <div className={styles.searchSection}>
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* Cart */}
        <div className={styles.cartSection}>
          <button
            onClick={() => setIsCartOpen(true)}
            className={styles.cartButton}
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <svg
              className={styles.cartIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
            {itemCount > 0 && (
              <span className={styles.cartBadge}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  )
}

function SearchSkeleton() {
  return (
    <div className={styles.searchSkeleton}>
      <div className={styles.searchSkeletonInput} />
    </div>
  )
}
