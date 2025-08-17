import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
}: CardProps) {
  const cardClasses = [
    styles.card,
    styles[variant],
    onClick ? styles.clickable : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
}
