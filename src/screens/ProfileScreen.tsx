import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, PrimaryButton, SectionLabel, VibeChip } from '../components/ui';
import { VIBES } from '../data/vibes';
import { IAP_COPY } from '../api/iap';
import type { RootStackParamList } from '../navigation/types';
import { labelJoins, useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';
import type { VibeId } from '../types';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const me = useAppStore((s) => s.me);
  const userVibes = useAppStore((s) => s.userVibes);
  const toggleUserVibe = useAppStore((s) => s.toggleUserVibe);
  const crewPass = useAppStore((s) => s.crewPass);
  const joinsLabel = useAppStore((s) =>
    labelJoins({
      crewPass: s.crewPass,
      extraJoinCredits: s.extraJoinCredits,
      joinsThisMonth: s.joinsThisMonth,
      joinMonthKey: s.joinMonthKey,
    }),
  );
  const openPaywall = useAppStore((s) => s.openPaywall);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const allCrews = useAppStore((s) => s.crews);
  const myCrews = useMemo(
    () => allCrews.filter((c) => c.members.some((m) => m.personId === me.id)),
    [allCrews, me.id],
  );
  const events = useAppStore((s) => s.events);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>you</Text>
        <View style={styles.hero}>
          <Avatar name={me.name} size={72} ring />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{me.name.toLowerCase()}</Text>
            <Text style={styles.handle}>@{me.handle}</Text>
            <Text style={styles.bio}>{me.bio}</Text>
          </View>
        </View>
        <View style={styles.city}>
          <Text style={styles.cityTxt}>📍 {me.city} · one city v1</Text>
        </View>

        <View style={styles.pass}>
          <View style={{ flex: 1 }}>
            <Text style={styles.passKicker}>{crewPass ? 'crew pass on' : 'free lane'}</Text>
            <Text style={styles.passBody}>{joinsLabel}</Text>
            <Text style={styles.passFine}>
              {IAP_COPY.passPrice} or {IAP_COPY.joinPrice}. {IAP_COPY.honest}
            </Text>
          </View>
          {!crewPass ? (
            <Pressable onPress={() => openPaywall('unlimited crews, still no ticket markup')} style={styles.passBtn}>
              <Text style={styles.passBtnTxt}>pass</Text>
            </Pressable>
          ) : null}
        </View>

        <SectionLabel>your vibes (feed ranking)</SectionLabel>
        <View style={styles.wrap}>
          {VIBES.map((v) => (
            <VibeChip
              key={v.id}
              id={v.id as VibeId}
              selected={userVibes.includes(v.id)}
              onPress={() => toggleUserVibe(v.id)}
            />
          ))}
        </View>

        <SectionLabel style={{ marginTop: 8 }}>your crews</SectionLabel>
        {myCrews.length === 0 ? (
          <Text style={styles.empty}>join one from Discover. free tier = 1 / month.</Text>
        ) : (
          myCrews.map((c) => {
            const ev = events.find((e) => e.id === c.eventId);
            return (
              <Pressable
                key={c.id}
                onPress={() => navigation.navigate('CrewRoom', { crewId: c.id })}
                style={styles.crewRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.crewName}>{c.name}</Text>
                  <Text style={styles.crewMeta}>{ev?.title}</Text>
                </View>
                <Text style={styles.link}>room</Text>
              </Pressable>
            );
          })
        )}

        <View style={{ height: 20 }} />
        <PrimaryButton label="reset demo data" tone="ghost" onPress={resetDemo} />
        <Text style={styles.fineprint}>
          no oauth, no real payments, no push at scale. mock catalog from luma + meetup stubs.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 40 },
  kicker: { fontFamily: fonts.semi, color: colors.cyan, letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', marginTop: 8 },
  hero: { flexDirection: 'row', gap: 16, alignItems: 'center', marginTop: 12, marginBottom: 14 },
  name: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -1.2 },
  handle: { fontFamily: fonts.medium, color: colors.muted, marginTop: 2 },
  bio: { fontFamily: fonts.body, color: colors.faint, marginTop: 6, fontSize: 13 },
  city: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  cityTxt: { fontFamily: fonts.semi, color: colors.text, fontSize: 13 },
  pass: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 22,
    alignItems: 'center',
  },
  passKicker: { fontFamily: fonts.semi, color: colors.lime, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase' },
  passBody: { fontFamily: fonts.displayBold, color: colors.text, fontSize: 18, marginTop: 4 },
  passFine: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, marginTop: 6 },
  passBtn: { backgroundColor: colors.lime, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill },
  passBtnTxt: { fontFamily: fonts.bold, color: colors.limeInk },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  empty: { fontFamily: fonts.body, color: colors.muted, marginBottom: 8 },
  crewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  crewName: { fontFamily: fonts.semi, color: colors.text, fontSize: 15 },
  crewMeta: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, marginTop: 2 },
  link: { fontFamily: fonts.semi, color: colors.lime },
  fineprint: { fontFamily: fonts.body, color: colors.faint, fontSize: 12, marginTop: 14, lineHeight: 18, textAlign: 'center' },
});
