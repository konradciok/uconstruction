import React, { useRef, useEffect } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId = id || `textarea-${props.name || 'default'}`;
  const errorId = `${inputId}-error`;

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value]);

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <textarea
        ref={textareaRef}
        id={inputId}
        className={`${styles.textarea} ${error ? styles.error : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        onInput={adjustHeight}
        {...props}
      />
      {error && (
        <div id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
