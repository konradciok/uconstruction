import { WorkshopDate, WorkshopConfig } from '../types/workshop';
import { toUtcFromCanary } from './datetime';

// Workshop configuration
export const WORKSHOP_CONFIG: WorkshopConfig = {
  capacity: 8,
  duration: 120, // 2 hours
  location: 'Güímar, Tenerife',
  defaultTime: '11:00',
  productId: 'prod_SOWATu1c4uQeh0',
  productName: 'workshop_friday'
};

// Available workshop dates with placeholder payment links
// TODO: Replace with actual Stripe payment links when created
export const WORKSHOP_DATES: WorkshopDate[] = [
  {
    dateISO: toUtcFromCanary('2025-03-14', '11:00').toISOString(),
    paymentLinkUrl: 'https://buy.stripe.com/placeholder_link_1?locale=es',
    capacity: WORKSHOP_CONFIG.capacity,
    time: '11:00',
    location: WORKSHOP_CONFIG.location,
    paymentLinkId: 'plink_placeholder_1'
  },
  {
    dateISO: toUtcFromCanary('2025-03-21', '11:00').toISOString(),
    paymentLinkUrl: 'https://buy.stripe.com/placeholder_link_2?locale=es',
    capacity: WORKSHOP_CONFIG.capacity,
    time: '11:00',
    location: WORKSHOP_CONFIG.location,
    paymentLinkId: 'plink_placeholder_2'
  },
  {
    dateISO: toUtcFromCanary('2025-03-28', '11:00').toISOString(),
    paymentLinkUrl: 'https://buy.stripe.com/placeholder_link_3?locale=es',
    capacity: WORKSHOP_CONFIG.capacity,
    time: '11:00',
    location: WORKSHOP_CONFIG.location,
    paymentLinkId: 'plink_placeholder_3'
  },
  {
    dateISO: toUtcFromCanary('2025-04-04', '11:00').toISOString(),
    paymentLinkUrl: 'https://buy.stripe.com/placeholder_link_4?locale=es',
    capacity: WORKSHOP_CONFIG.capacity,
    time: '11:00',
    location: WORKSHOP_CONFIG.location,
    paymentLinkId: 'plink_placeholder_4'
  }
];

// Helper function to get available dates (not sold out)
export function getAvailableDates(): WorkshopDate[] {
  return WORKSHOP_DATES.filter(date => !date.isDeactivated);
}

// Helper function to find date by ISO string
export function findDateByISO(dateISO: string): WorkshopDate | undefined {
  return WORKSHOP_DATES.find(date => date.dateISO === dateISO);
}
