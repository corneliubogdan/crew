import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, PrimaryButton, SectionLabel } from '../components/ui';
import { MEMORY, personById } from '../data/seed';
import { formatWhen, isDayOf } from '../lib/dates';
import type { RootStackParamList, RootTabParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';

export function GoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<
    CompositeNavigationProp<BottomTabNavigationProp<RootTabParamList, 'Go'>, StackNavigationProp<RootStackParamList>>
  >();
  const me = useAppStore((s) => s.me);
  const events = useAppStore((s) => s.events);
  const crews = useAppStore((s) => s.crews);
  const toggleHere = useAppStore((s) => s.toggleHere);
  const mine = crews.filter((c) => c.members.some((m) => m.personId === me.id));

  const dayOf = mine
    .map((crew) => ({ crew, event: events.find((e) => e.id === crew.eventId) }))
    .filter((row) => row.event && isDayOf(row.event.startsAt));

  const upcoming = mine
    .map((crew) => ({ crew, event: events.find((e) => e.id === crew.eventId) }))
    .filter((row) => row.event && !isDayOf(row.event.startsAt))
    .sort((a, b) => new Date(a.event!.startsAt).getTime() - new Date(b.event!.startsAt).getTime());

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>go</Text>
        <Text style={styles.title}>day-of</Text>
        <Text style={styles.sub}>roster + pin. tickets still live on the host page.</Text>

        {dayOf.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>nothing on the roster tonight</Text>
            <Text style={styles.emptyBody}>
              join a crew on Discover. if it&apos;s today (or in the next 18h) it lands here.
            </Text>
          </View>
        ) : (
          dayOf.map(({ crew, event }) => {
            const you = crew.members.find((m) => m.personId === me.id);
            return (
              <View key={crew.id} style={styles.tonight}>
                <Text style={styles.live}>tonight · {crew.name}</Text>
                <Text style={styles.eventTitle}>{event!.title}</Text>
                <Text style={styles.when}>{formatWhen(event!.startsAt).label}</Text>
                <View style={styles.pin}>
                  <Text style={styles.pinKicker}>pin</Text>
                  <Text style={styles.pinTxt}>{crew.meetupSpot}</Text>
                </View>
                <SectionLabel>who&apos;s going</SectionLabel>
                {crew.members.map((m) => {
                  const p = personById(m.personId);
                  return (
                    <View key={m.personId} style={styles.member}>
                      <Avatar name={p.name} size={32} />
                      <Text style={styles.memberName}>{p.name}</Text>
                      <Text style={styles.here}>{m.here ? 'here' : m.ticketStatus}</Text>
                    </View>
                  );
                })}
                <PrimaryButton
                  label={you?.here ? "you're here ✓" : "i'm here"}
                  tone={you?.here ? 'dark' : 'lime'}
                  onPress={() => toggleHere(crew.id)}
                  style={{ marginTop: 8 }}
                />
                <View style={{ height: 10 }} />
                <PrimaryButton
                  label="open crew room"
                  tone="ghost"
                  onPress={() => navigation.navigate('CrewRoom', { crewId: crew.id })}
                />
              </View>
            );
          })
        )}

        {upcoming.length > 0 ? (
          <View style={{ marginTop: 22 }}>
            <SectionLabel>later with a crew</SectionLabel>
            {upcoming.map(({ crew, event }) => (
              <View key={crew.id} style={styles.later}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.laterTitle}>{event!.title}</Text>
                  <Text style={styles.laterMeta}>
                    {crew.name} · {formatWhen(event!.startsAt).label}
                  </Text>
                </View>
                <Text
                  onPress={() => navigation.navigate('CrewRoom', { crewId: crew.id })}
                  style={styles.link}
                >
                  room
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <SectionLabel>after · who&apos;d you go with again</SectionLabel>
          <View style={styles.memory}>
            <Text style={styles.memWhen}>{MEMORY.whenLabel}</Text>
            <Text style={styles.memTitle}>{MEMORY.title}</Text>
            <Text style={styles.memBody}>light stub — tap through, no graph yet.</Text>
            <PrimaryButton
              label="who was good"
              tone="ghost"
              onPress={() => navigation.navigate('Afterglow', { memoryId: MEMORY.id })}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 24 },
  kicker: { fontFamily: fonts.semi, color: colors.pink, letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', marginTop: 8 },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.text, letterSpacing: -1.6, marginTop: 4 },
  sub: { fontFamily: fonts.body, color: colors.muted, marginBottom: 18, marginTop: 4 },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyTitle: { fontFamily: fonts.displayBold, color: colors.text, fontSize: 20, letterSpacing: -0.5 },
  emptyBody: { fontFamily: fonts.body, color: colors.muted, marginTop: 8, lineHeight: 20 },
  tonight: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.lime + '55',
    marginBottom: 12,
  },
  live: { fontFamily: fonts.semi, color: colors.lime, letterSpacing: 1.2, fontSize: 11, textTransform: 'uppercase' },
  eventTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.text, letterSpacing: -0.8, marginTop: 6 },
  when: { fontFamily: fonts.body, color: colors.muted, marginTop: 4, marginBottom: 12 },
  pin: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 12, marginBottom: 16 },
  pinKicker: { fontFamily: fonts.semi, color: colors.cyan, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  pinTxt: { fontFamily: fonts.semi, color: colors.text, fontSize: 16, marginTop: 4 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  memberName: { flex: 1, fontFamily: fonts.semi, color: colors.text },
  here: { fontFamily: fonts.medium, color: colors.faint, fontSize: 12 },
  later: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  laterTitle: { fontFamily: fonts.semi, color: colors.text, fontSize: 15 },
  laterMeta: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, marginTop: 2 },
  link: { fontFamily: fonts.semi, color: colors.lime },
  memory: {
    backgroundColor: colors.cardSoft,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  memWhen: { fontFamily: fonts.semi, color: colors.violet, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  memTitle: { fontFamily: fonts.displayBold, color: colors.text, fontSize: 20, marginTop: 6 },
  memBody: { fontFamily: fonts.body, color: colors.muted, marginTop: 6 },
});
