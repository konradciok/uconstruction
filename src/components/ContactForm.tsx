'use client';

import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import Button from './ui/Button';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ className = '' }) => {
  const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'mldlknny');
  const [gdprConsent, setGdprConsent] = useState(false);

  if (state.succeeded) {
    return (
      <div className={`${styles.container} ${styles.successContainer} ${className}`}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>Message Sent!</h3>
          <p className={styles.successMessage}>
            Thank you for your message. I&apos;ll get back to you as soon as possible.
          </p>
          <Button onClick={() => window.location.reload()} variant="secondary">
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.formHeader}>
        <h2 className={styles.title}>Get in Touch</h2>
        <p className={styles.subtitle}>
          Have a question or want to discuss a project? I&apos;d love to hear from you!
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputContainer}>
          <label htmlFor="name" className={styles.label}>Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your name"
            className={styles.input}
            required
          />
          <ValidationError 
            prefix="Name" 
            field="name"
            errors={state.errors}
            className={styles.errorMessage}
          />
        </div>

        <div className={styles.inputContainer}>
          <label htmlFor="email" className={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="your.email@example.com"
            className={styles.input}
            required
          />
          <ValidationError 
            prefix="Email" 
            field="email"
            errors={state.errors}
            className={styles.errorMessage}
          />
        </div>

        <div className={styles.inputContainer}>
          <label htmlFor="message" className={styles.label}>Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell me about your project..."
            className={styles.textarea}
            required
            rows={4}
          />
          <ValidationError 
            prefix="Message" 
            field="message"
            errors={state.errors}
            className={styles.errorMessage}
          />
        </div>

        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className={styles.checkbox}
              required
            />
            <span className={styles.checkmark}></span>
            I agree to the privacy policy and consent to being contacted
          </label>
        </div>

        <Button
          type="submit"
          disabled={state.submitting || !gdprConsent}
          className={styles.submitButton}
        >
          {state.submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
};
