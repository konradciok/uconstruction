import React from 'react';
import styles from './WatercolorEffects.module.css';

interface WatercolorEffectsProps {
  className?: string;
}

export default function WatercolorEffects({ className = '' }: WatercolorEffectsProps) {
  return (
    <div className={`${styles.watercolorEffects} ${className}`}>
      {/* Organic watercolor shapes */}
      <div className={styles.shape1}></div>
      <div className={styles.shape2}></div>
      <div className={styles.shape3}></div>
      <div className={styles.shape4}></div>
      
      {/* Floating particles */}
      <div className={styles.particle1}></div>
      <div className={styles.particle2}></div>
      <div className={styles.particle3}></div>
      <div className={styles.particle4}></div>
    </div>
  );
}
