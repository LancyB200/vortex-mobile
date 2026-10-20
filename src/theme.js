export const colors = {
  bg: '#070b14',
  card: '#0d1320',
  cardAlt: '#111a29',
  border: '#1d2738',
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  text: '#f8fafc',
  textSoft: '#e2e8f0',
  muted: '#64748b',
  mutedLight: '#94a3b8',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
};

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}