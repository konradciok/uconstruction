import React, { forwardRef } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  className = '',
  onClick,
}, ref) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    onClick ? styles.clickable : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
