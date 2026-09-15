export const colors = {
  bg: '#050506',
  bgElevated: '#0C0C10',
  card: '#121218',
  cardSoft: '#18181F',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.14)',
  text: '#F4F4F6',
  muted: '#9A9AA8',
  faint: '#6E6E7A',
  lime: '#C8FF3D',
  limeInk: '#12180A',
  pink: '#FF3D8A',
  cyan: '#5CFFE7',
  violet: '#B794FF',
  orange: '#FF8A4C',
  blue: '#5B8CFF',
  danger: '#FF5C7A',
  overlay: 'rgba(0,0,0,0.72)',
};

export const fonts = {
  display: 'Syne_800ExtraBold',
  displayBold: 'Syne_700Bold',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semi: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const AVATAR_PALETTE = [
  '#FF3D8A',
  '#C8FF3D',
  '#5CFFE7',
  '#B794FF',
  '#FF8A4C',
  '#5B8CFF',
  '#FF5C7A',
  '#F5D76E',
];

export function colorForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
