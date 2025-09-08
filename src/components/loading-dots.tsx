/**
 * Loading Dots Component
 * 
 * Animated loading indicator with three dots
 * using the main site's design system.
 */

import clsx from 'clsx'
import styles from './loading-dots.module.css'

interface LoadingDotsProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white'
}

export function LoadingDots({ 
  className, 
  size = 'md', 
  color = 'primary' 
}: LoadingDotsProps) {
  return (
    <span className={clsx(styles.container, className)}>
      <span className={clsx(styles.dot, styles[`dot${size.charAt(0).toUpperCase() + size.slice(1)}`], styles[`dot${color.charAt(0).toUpperCase() + color.slice(1)}`])} />
      <span className={clsx(styles.dot, styles[`dot${size.charAt(0).toUpperCase() + size.slice(1)}`], styles[`dot${color.charAt(0).toUpperCase() + color.slice(1)}`], styles.delay200)} />
      <span className={clsx(styles.dot, styles[`dot${size.charAt(0).toUpperCase() + size.slice(1)}`], styles[`dot${color.charAt(0).toUpperCase() + color.slice(1)}`], styles.delay400)} />
    </span>
  )
}

export default LoadingDots
