import { colors } from '../theme';
import type { VibeId } from '../types';

export const VIBES: { id: VibeId; label: string; color: string }[] = [
  { id: 'hacky', label: 'hacky', color: colors.lime },
  { id: 'chill', label: 'chill', color: colors.cyan },
  { id: 'loud', label: 'loud', color: colors.pink },
  { id: 'late-night', label: 'late night', color: colors.violet },
  { id: 'beginner-ok', label: 'beginner ok', color: colors.blue },
  { id: 'ai', label: 'ai', color: colors.lime },
  { id: 'design', label: 'design', color: colors.pink },
  { id: 'founders', label: 'founders', color: colors.orange },
  { id: 'career-lite', label: 'career-lite', color: colors.orange },
  { id: 'open-source', label: 'open source', color: colors.cyan },
  { id: 'hardware', label: 'hardware', color: colors.violet },
];

export function vibeLabel(id: VibeId): string {
  return VIBES.find((v) => v.id === id)?.label ?? id;
}

export function vibeColor(id: VibeId): string {
  return VIBES.find((v) => v.id === id)?.color ?? colors.muted;
}
