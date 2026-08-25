const pad = (n) => String(n).padStart(2, "0");

/** Format Date as datetime-local value (YYYY-MM-DDTHH:mm) */
export function toLocalDatetimeString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse datetime-local string to Date (local timezone) */
export function parseLocalDatetime(str) {
  if (!str?.trim()) return null;
  const match = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (match) {
    const y = Number(match[1]);
    const mo = Number(match[2]);
    const d = Number(match[3]);
    const h = Number(match[4]);
    const mi = Number(match[5]);
    const date = new Date(y, mo - 1, d, h, mi, 0, 0);
    return isNaN(date.getTime()) ? null : date;
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** 24h → { hour12: 1–12, period: 'AM' | 'PM' } */
export function to12Hour(hour24) {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, period };
}

/** 12h + AM/PM → 24h (0–23) */
export function to24Hour(hour12, period) {
  const h = hour12 % 12;
  return period === "PM" ? h + 12 : h;
}

export function toLocalDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseLocalDate(str) {
  if (!str?.trim()) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, month: month - 1, year, current: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, month: month + 1, year, current: false });
  }

  return cells;
}

export function normalizeMonthYear(month, year) {
  const d = new Date(year, month, 1);
  return { month: d.getMonth(), year: d.getFullYear() };
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDisplay(value, includeTime = true) {
  const d = parseLocalDatetime(value) || parseLocalDate(value);
  if (!d) return "";
  const datePart = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!includeTime) return datePart;
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} · ${timePart}`;
}
