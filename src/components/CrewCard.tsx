import { StyleSheet, Text, View } from 'react-native';
import { personById } from '../data/seed';
import { colors, fonts } from '../theme';
import type { Crew } from '../types';
import { AvatarStack, PressableCard } from './ui';

export function CrewCard({
  crew,
  onPress,
  cta = 'open',
}: {
  crew: Crew;
  onPress: () => void;
  cta?: string;
}) {
  const names = crew.members.map((m) => personById(m.personId).name);
  const spots = crew.capacity - crew.members.length;
  return (
    <PressableCard onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{crew.name}</Text>
          <Text style={styles.prompt} numberOfLines={2}>
            {crew.prompt}
          </Text>
        </View>
        <Text style={styles.cta}>{cta}</Text>
      </View>
      <View style={styles.foot}>
        <AvatarStack names={names} />
        <Text style={styles.spots}>
          {crew.members.length}/{crew.capacity}
          {spots > 0 ? ` · ${spots} open` : ' · full'}
        </Text>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  name: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.text, letterSpacing: -0.4 },
  prompt: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4 },
  cta: { fontFamily: fonts.semi, fontSize: 12, color: colors.lime, marginTop: 4 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  spots: { fontFamily: fonts.medium, fontSize: 12, color: colors.faint },
});
