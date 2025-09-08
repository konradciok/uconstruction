import React from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${props.name || 'default'}`;
  const errorId = `${checkboxId}-error`;

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.checkboxWrapper}>
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.checkbox}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        <label htmlFor={checkboxId} className={styles.label}>
          <span className={styles.checkmark}></span>
          {label}
        </label>
      </div>
      {error && (
        <div id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
