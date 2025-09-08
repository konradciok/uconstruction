'use client';

import React, { useState, useEffect } from 'react';
import { WorkshopDate, WorkshopDatePickerProps } from '../types/workshop';
import { getAvailableDates } from '../lib/workshop-dates';
import { formatCanary } from '../lib/datetime';
import styles from './WorkshopDatePicker.module.css';

export const WorkshopDatePicker: React.FC<WorkshopDatePickerProps> = ({
  onDateSelect,
  className = '',
}) => {
  const [availableDates, setAvailableDates] = useState<WorkshopDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<WorkshopDate | null>(null);

  useEffect(() => {
    // Load available dates from configuration
    const dates = getAvailableDates();
    setAvailableDates(dates);
    setLoading(false);
  }, []);

  const handleDateSelect = (date: WorkshopDate) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loading}>Loading available dates...</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${className}`}
      id="workshop-date-picker"
    >
      <h3 className={styles.title} id="workshop-date-picker-title">
        Select Workshop Date
      </h3>
      <p className={styles.subtitle}>
        Choose your preferred date and time for the watercolor workshop
      </p>

      <div className={styles.dateGrid}>
        {availableDates.map((date) => {
          const isSelected = selectedDate?.dateISO === date.dateISO;
          const isSoldOut = date.isDeactivated;

          return (
            <button
              key={date.dateISO}
              className={`${styles.dateButton} ${
                isSelected ? styles.selected : ''
              } ${isSoldOut ? styles.soldOut : ''}`}
              onClick={() => !isSoldOut && handleDateSelect(date)}
              disabled={isSoldOut}
            >
              <div className={styles.dateContent}>
                <span className={styles.dateText}>
                  {formatCanary(new Date(date.dateISO), 'MMM dd, yyyy')}
                </span>
                <span className={styles.timeText}>
                  {formatCanary(new Date(date.dateISO), 'HH:mm')}
                </span>
                <span className={styles.locationText}>{date.location}</span>
                <span className={styles.capacityText}>
                  {isSoldOut ? 'Sold out' : 'Available'}
                </span>
              </div>

              {isSelected && (
                <div className={styles.selectedIndicator}>
                  <span>✓ Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className={styles.bookingSection}>
          <div className={styles.selectedDateInfo}>
            <h4>Selected Workshop</h4>
            <p>
              <strong>Date:</strong>{' '}
              {formatCanary(
                new Date(selectedDate.dateISO),
                'EEEE, MMMM dd, yyyy'
              )}
            </p>
            <p>
              <strong>Time:</strong> {selectedDate.time}
            </p>
            <p>
              <strong>Location:</strong> {selectedDate.location}
            </p>
            <p>
              <strong>Price:</strong> €50 per person
            </p>
          </div>

          <button
            className={styles.bookWorkshopButton}
            onClick={() => {
              // Redirect to Stripe payment link
              window.location.href = selectedDate.paymentLinkUrl;
            }}
          >
            Book Workshop - €50
          </button>
        </div>
      )}

      {availableDates.length === 0 && (
        <div className={styles.noDates}>
          <p>No workshop dates are currently available.</p>
          <p>Please check back later or contact us for more information.</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopDatePicker;
