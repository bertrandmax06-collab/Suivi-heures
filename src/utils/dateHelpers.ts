import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export const LOCALE = fr;

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { locale: LOCALE });
  const calEnd = endOfWeek(monthEnd, { locale: LOCALE });
  return eachDayOfInterval({ start: calStart, end: calEnd });
}

export function formatMonthYear(year: number, month: number): string {
  return format(new Date(year, month), 'MMMM yyyy', { locale: LOCALE });
}

export function formatDayLabel(date: Date): string {
  return format(date, 'EEEE d MMMM yyyy', { locale: LOCALE });
}

export function formatShortDate(date: Date): string {
  return format(date, 'd MMM', { locale: LOCALE });
}

export {
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
};
