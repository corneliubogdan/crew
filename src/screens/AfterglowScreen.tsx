import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, BackHeader, PrimaryButton } from '../components/ui';
import { MEMORY } from '../data/seed';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';

export function AfterglowScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const votes = useAppStore((s) => s.afterglowVotes);
  const vote = useAppStore((s) => s.voteAfterglow);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <BackHeader title="afterglow" subtitle={MEMORY.whenLabel} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.title}>{MEMORY.title}</Text>
        <Text style={styles.sub}>who&apos;d you go with again? stub only — no social graph yet.</Text>
        {MEMORY.people.map((p) => {
          const v = votes[p.id];
          return (
            <View key={p.id} style={styles.row}>
              <Avatar name={p.name} />
              <Text style={styles.name}>{p.name}</Text>
              <Pressable onPress={() => vote(p.id, 'again')} style={[styles.vote, v === 'again' && styles.voteOn]}>
                <Text style={[styles.voteTxt, v === 'again' && styles.voteTxtOn]}>again</Text>
              </Pressable>
              <Pressable onPress={() => vote(p.id, 'nah')} style={[styles.vote, v === 'nah' && styles.voteNah]}>
                <Text style={[styles.voteTxt, v === 'nah' && styles.voteTxtOn]}>nah</Text>
              </Pressable>
            </View>
          );
        })}
        <PrimaryButton label="noted (stub)" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
        <Text style={styles.todo}>TODO: persist a real graph + suggest crews next time.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 18, paddingTop: 8 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text, letterSpacing: -0.8 },
  sub: { fontFamily: fonts.body, color: colors.muted, marginTop: 6, marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  name: { flex: 1, fontFamily: fonts.semi, color: colors.text, fontSize: 16 },
  vote: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  voteOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  voteNah: { backgroundColor: colors.pink, borderColor: colors.pink },
  voteTxt: { fontFamily: fonts.semi, color: colors.text, fontSize: 12 },
  voteTxtOn: { color: '#050506' },
  todo: { fontFamily: fonts.body, color: colors.faint, fontSize: 12, marginTop: 16, textAlign: 'center' },
});
