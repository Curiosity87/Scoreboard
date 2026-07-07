import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { sv } from "date-fns/locale";

export const TIME_ZONE = "Europe/Stockholm";

/** Formatera ören som "500 kr" / "512,50 kr". */
export function formatSEK(oren: number): string {
  const kr = oren / 100;
  return (
    new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: Number.isInteger(kr) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(kr) + " kr"
  );
}

export function formatDateTime(date: Date): string {
  return formatInTimeZone(date, TIME_ZONE, "d MMM yyyy 'kl.' HH:mm", { locale: sv });
}

export function formatTime(date: Date): string {
  return formatInTimeZone(date, TIME_ZONE, "HH:mm", { locale: sv });
}

export function formatDate(date: Date): string {
  return formatInTimeZone(date, TIME_ZONE, "d MMM yyyy", { locale: sv });
}

/** Värde för <input type="datetime-local"> i svensk tid. */
export function toDatetimeLocalValue(date: Date): string {
  return formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd'T'HH:mm");
}

/** Tolka ett <input type="datetime-local">-värde som svensk tid → UTC Date. */
export function fromDatetimeLocalValue(value: string): Date {
  return fromZonedTime(value, TIME_ZONE);
}
