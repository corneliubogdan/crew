export function daysFromNow(days: number, hours = 19, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function hoursFromNow(hours: number): string {
  const d = new Date();
  d.setTime(d.getTime() + hours * 3600 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString();
}

export function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isDayOf(iso: string, now = new Date()): boolean {
  const start = new Date(iso);
  const t = start.getTime();
  const n = now.getTime();
  if (t < n - 2 * 3600 * 1000) return false;
  if (isSameDay(start, now)) return true;
  return t > n && t < n + 18 * 3600 * 1000;
}

export function formatWhen(iso: string): { weekday: string; day: string; time: string; label: string } {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return { weekday, day, time, label: `${weekday} ${day} · ${time}` };
}

export function formatRange(startIso: string, endIso?: string): string {
  const start = formatWhen(startIso);
  if (!endIso) return start.label;
  const end = new Date(endIso);
  const time = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (isSameDay(new Date(startIso), end)) return `${start.label} → ${time}`;
  return `${start.label} → ${formatWhen(endIso).label}`;
}
