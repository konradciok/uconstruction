export interface WorkshopDate {
  dateISO: string;
  paymentLinkUrl: string;
  capacity: number;
  time: string;
  location: string;
  paymentLinkId?: string; // For mapping in webhooks
  isDeactivated?: boolean; // Added for UI display
}

export interface WorkshopConfig {
  capacity: number;
  duration: number; // in minutes
  location: string;
  defaultTime: string;
  productId: string;
  productName: string;
}

export interface OrderDetails {
  customer_email?: string;
  amount_total?: number;
  currency?: string;
  workshop: {
    name: string;
    date: string | null;
    time: string;
    location: string;
  };
}

export interface WorkshopDatePickerProps {
  onDateSelect: (date: WorkshopDate) => void;
  className?: string;
}
