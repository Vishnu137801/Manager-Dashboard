export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate + (isoDate.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTimeDisplay(timeStr?: string): string {
  return timeStr || '—';
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
