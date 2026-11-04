// India time helpers shared by the Sales and Support desks (admin and the
// backend jobs). IST is a fixed UTC+5:30 (no DST), so we shift the clock
// instead of depending on the browser's or server's time zone. Working hours are passed in (sales 11–7 fixed,
// support from its settings); they default to the sales hours.
import {
  SALES_WORK_DAYS,
  SALES_WORK_END_HOUR,
  SALES_WORK_START_HOUR,
} from "./sales-desk";

export interface WorkHours {
  startHour: number;
  endHour: number;
  days: number[]; // 0 = Sunday
}

export const SALES_HOURS: WorkHours = {
  startHour: SALES_WORK_START_HOUR,
  endHour: SALES_WORK_END_HOUR,
  days: SALES_WORK_DAYS,
};

const IST_OFFSET_MS = 330 * 60_000;
const DAY_MS = 86_400_000;

export interface IstParts {
  year: number;
  month: number; // 0-based
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = Sunday
}

export function istParts(d: Date): IstParts {
  const s = new Date(d.getTime() + IST_OFFSET_MS);
  return {
    year: s.getUTCFullYear(),
    month: s.getUTCMonth(),
    day: s.getUTCDate(),
    hour: s.getUTCHours(),
    minute: s.getUTCMinutes(),
    weekday: s.getUTCDay(),
  };
}

export function istDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(Date.UTC(year, month, day, hour, minute) - IST_OFFSET_MS);
}

export function startOfIstDay(d: Date): Date {
  const p = istParts(d);
  return istDate(p.year, p.month, p.day);
}

export function endOfIstDay(d: Date): Date {
  return new Date(startOfIstDay(d).getTime() + DAY_MS);
}

export function sameIstDay(a: Date, b: Date): boolean {
  return startOfIstDay(a).getTime() === startOfIstDay(b).getTime();
}

function atIstTime(day: Date, hour: number, minute = 0): Date {
  const p = istParts(day);
  return istDate(p.year, p.month, p.day, hour, minute);
}

function isWorkDay(d: Date, h: WorkHours): boolean {
  return h.days.includes(istParts(d).weekday);
}

export function isWorkingTime(d: Date, h: WorkHours = SALES_HOURS): boolean {
  const p = istParts(d);
  return isWorkDay(d, h) && p.hour >= h.startHour && p.hour < h.endHour;
}

// The next working day's start strictly after the given day.
export function nextWorkDayStart(d: Date, h: WorkHours = SALES_HOURS): Date {
  let day = new Date(startOfIstDay(d).getTime() + DAY_MS);
  while (!isWorkDay(day, h)) day = new Date(day.getTime() + DAY_MS);
  return atIstTime(day, h.startHour);
}

// Moves a time into working hours: before the start → the start that day;
// after the end or on a day off → the start of the next working day.
export function snapToWorking(d: Date, h: WorkHours = SALES_HOURS): Date {
  if (isWorkingTime(d, h)) return d;
  const p = istParts(d);
  if (isWorkDay(d, h) && p.hour < h.startHour) return atIstTime(d, h.startHour);
  return nextWorkDayStart(d, h);
}

// Start of the current or next working session (for the off-hours banner).
export function nextSessionStart(now: Date, h: WorkHours = SALES_HOURS): Date {
  return snapToWorking(now, h);
}

// Same time of day, n working days later, kept inside working hours.
export function addWorkDays(d: Date, n: number, h: WorkHours = SALES_HOURS): Date {
  const p = istParts(d);
  let day = d;
  for (let i = 0; i < n; i++) day = nextWorkDayStart(day, h);
  return snapToWorking(atIstTime(day, p.hour, p.minute), h);
}

// Minutes between two times (b − a), rounded.
export function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60_000);
}

// --------------------------------------------------------------- formatting

export function fmtTime(d: Date): string {
  const p = istParts(d);
  const h = p.hour % 12 || 12;
  const m = String(p.minute).padStart(2, "0");
  return `${h}:${m} ${p.hour < 12 ? "am" : "pm"}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "3:00 pm" today, "Tomorrow 11:00 am", "Thu 6 Nov, 3:00 pm".
export function fmtWhen(d: Date, now = new Date()): string {
  const today = startOfIstDay(now).getTime();
  const day = startOfIstDay(d).getTime();
  if (day === today) return fmtTime(d);
  if (day === today + DAY_MS) return `Tomorrow ${fmtTime(d)}`;
  if (day === today - DAY_MS) return `Yesterday ${fmtTime(d)}`;
  const p = istParts(d);
  return `${WEEKDAYS[p.weekday]} ${p.day} ${MONTHS[p.month]}, ${fmtTime(d)}`;
}

// "5m", "2h", "3d".
export function fmtDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m}m`;
  if (m < 60 * 24) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r && h < 10 ? `${h}h ${r}m` : `${h}h`;
  }
  return `${Math.floor(m / (60 * 24))}d`;
}

export function fmtAgo(d: Date, now = new Date()): string {
  return `${fmtDuration(minutesBetween(d, now))} ago`;
}

// <input type="datetime-local"> works in the browser's zone; we read and write
// it as IST so times are right on any laptop.
export function toIstInputValue(d: Date): string {
  const p = istParts(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function fromIstInputValue(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  if (!m) return null;
  return istDate(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
}
