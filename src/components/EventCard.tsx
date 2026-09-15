import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { formatWhen } from '../lib/dates';
import { colors, fonts, radius } from '../theme';
import type { TechEvent } from '../types';
import { AvatarStack, PressableCard, VibeChip } from './ui';

export function EventCard({
  event,
  forming,
  faces,
  onPress,
}: {
  event: TechEvent;
  forming: number;
  faces: string[];
  onPress: () => void;
}) {
  const when = formatWhen(event.startsAt);
  return (
    <PressableCard onPress={onPress} style={styles.wrap}>
      <LinearGradient
        colors={[event.accent + '55', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blob}
      />
      <View style={styles.top}>
        <Text style={styles.when}>
          {when.weekday} {when.day} · {when.time}
        </Text>
        <View style={styles.sourcePill}>
          <Text style={styles.source}>{event.source}</Text>
        </View>
      </View>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>
        {event.venue} · {event.neighborhood}
      </Text>
      <View style={styles.tags}>
        {event.vibeTags.slice(0, 4).map((id) => (
          <VibeChip key={id} id={id} compact />
        ))}
      </View>
      <View style={styles.footer}>
        {faces.length ? <AvatarStack names={faces} /> : <View />}
        <Text style={[styles.forming, forming > 0 && { color: colors.lime }]}>
          {forming > 0 ? `${forming} crew${forming === 1 ? '' : 's'} forming` : 'no crews yet'}
        </Text>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14, overflow: 'hidden', padding: 18 },
  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    right: -40,
    top: -50,
    borderRadius: 90,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  when: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 1.2,
  },
  sourcePill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  source: { fontFamily: fonts.medium, fontSize: 10, color: colors.faint, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.8,
    marginTop: 10,
    lineHeight: 28,
  },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  forming: { fontFamily: fonts.semi, fontSize: 12, color: colors.faint },
});
