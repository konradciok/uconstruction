import { zonedTimeToUtc, formatInTimeZone } from 'date-fns-tz';

export const CANARY_TZ = 'Atlantic/Canary';

export function toUtcFromCanary(date: string, time: string) {
  // date='2025-09-12', time='11:00' => UTC Date keeps DST correct
  return zonedTimeToUtc(`${date}T${time}:00`, CANARY_TZ);
}

export function formatCanary(dt: Date, fmt = 'MMM dd, yyyy HH:mm') {
  return formatInTimeZone(dt, CANARY_TZ, fmt);
}

export function formatCanaryDate(dt: Date, fmt = 'MMM dd, yyyy') {
  return formatInTimeZone(dt, CANARY_TZ, fmt);
}

export function formatCanaryTime(dt: Date, fmt = 'HH:mm') {
  return formatInTimeZone(dt, CANARY_TZ, fmt);
}
