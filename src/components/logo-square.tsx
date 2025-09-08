/**
 * Logo Square Component
 * 
 * Displays the site logo in a square container
 * with customizable size and watercolor artist aesthetic.
 */

import clsx from 'clsx'
import { LogoIcon } from './icons/logo'
import styles from './logo-square.module.css'

interface LogoSquareProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LogoSquare({ size = 'md', className }: LogoSquareProps) {
  return (
    <div
      className={clsx(
        styles.container,
        styles[`container${size.charAt(0).toUpperCase() + size.slice(1)}`],
        className
      )}
    >
      <LogoIcon
        className={clsx(
          styles.icon,
          styles[`icon${size.charAt(0).toUpperCase() + size.slice(1)}`]
        )}
      />
    </div>
  )
}

export default LogoSquare
