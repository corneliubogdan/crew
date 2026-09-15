import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../components/EventCard';
import { PrimaryButton, SectionLabel, VibeChip } from '../components/ui';
import { VIBES } from '../data/vibes';
import { personById } from '../data/seed';
import { rankEvents } from '../lib/ranking';
import type { RootStackParamList, RootTabParamList } from '../navigation/types';
import { labelJoins, useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';
import type { VibeId } from '../types';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<
    CompositeNavigationProp<
      BottomTabNavigationProp<RootTabParamList, 'Discover'>,
      StackNavigationProp<RootStackParamList>
    >
  >();
  const events = useAppStore((s) => s.events);
  const crews = useAppStore((s) => s.crews);
  const userVibes = useAppStore((s) => s.userVibes);
  const vibeFilter = useAppStore((s) => s.vibeFilter);
  const setVibeFilter = useAppStore((s) => s.setVibeFilter);
  const joinsLabel = useAppStore((s) =>
    labelJoins({
      crewPass: s.crewPass,
      extraJoinCredits: s.extraJoinCredits,
      joinsThisMonth: s.joinsThisMonth,
      joinMonthKey: s.joinMonthKey,
    }),
  );
  const refresh = useAppStore((s) => s.refreshCatalog);
  const addEventFromUrl = useAppStore((s) => s.addEventFromUrl);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [pasteError, setPasteError] = useState('');

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const ranked = useMemo(
    () => rankEvents(events, crews, userVibes, vibeFilter),
    [events, crews, userVibes, vibeFilter],
  );

  const facesFor = (eventId: string) => {
    const names = crews
      .filter((c) => c.eventId === eventId)
      .flatMap((c) => c.members.map((m) => personById(m.personId).name));
    return [...new Set(names)].slice(0, 4);
  };

  const onPaste = () => {
    const id = addEventFromUrl(url, title);
    if (!id) {
      setPasteError('need a real url (https://...)');
      return;
    }
    setPasteOpen(false);
    setUrl('');
    setTitle('');
    setPasteError('');
    navigation.navigate('EventDetail', { eventId: id });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.wordmark}>crew</Text>
          <View style={styles.city}>
            <View style={styles.dot} />
            <Text style={styles.cityTxt}>Bucharest · EU</Text>
          </View>
        </View>
        <Text style={styles.tagline}>don&apos;t go alone.</Text>
        <Text style={styles.sub}>
          tech nights ranked by your vibes + crews forming. tickets live on luma / meetup — we just do the people part.
        </Text>

        <View style={styles.limitRow}>
          <Text style={styles.limit}>{joinsLabel}</Text>
          <Pressable onPress={() => setPasteOpen(true)}>
            <Text style={styles.pasteLink}>paste a url</Text>
          </Pressable>
        </View>

        <SectionLabel>vibes</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {VIBES.map((v) => (
            <VibeChip
              key={v.id}
              id={v.id as VibeId}
              selected={vibeFilter === v.id}
              onPress={() => setVibeFilter(v.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.feedHead}>
          <SectionLabel style={{ marginBottom: 0 }}>upcoming</SectionLabel>
          <Text style={styles.count}>{ranked.length}</Text>
        </View>

        {ranked.map(({ event, forming }) => (
          <EventCard
            key={event.id}
            event={event}
            forming={forming}
            faces={facesFor(event.id)}
            onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
          />
        ))}
        {ranked.length === 0 ? (
          <Text style={styles.empty}>nothing with that vibe yet. clear the chip.</Text>
        ) : null}
        <View style={{ height: 28 }} />
      </ScrollView>

      <Modal visible={pasteOpen} transparent animationType="fade" onRequestClose={() => setPasteOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPasteOpen(false)} />
          <View style={styles.pasteCard}>
            <Text style={styles.pasteTitle}>drop a luma / meetup link</Text>
            <Text style={styles.pasteHint}>v1 just saves the url. real adapters are stubbed.</Text>
            <TextInput
              placeholder="https://luma.com/..."
              placeholderTextColor={colors.faint}
              autoCapitalize="none"
              autoCorrect={false}
              value={url}
              onChangeText={setUrl}
              style={styles.input}
            />
            <TextInput
              placeholder="optional title"
              placeholderTextColor={colors.faint}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            {pasteError ? <Text style={styles.err}>{pasteError}</Text> : null}
            <PrimaryButton label="add to feed" onPress={onPaste} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  wordmark: { fontFamily: fonts.display, fontSize: 42, color: colors.lime, letterSpacing: -1.8 },
  city: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.lime },
  cityTxt: { fontFamily: fonts.semi, fontSize: 12, color: colors.text },
  tagline: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.6,
    marginTop: -4,
  },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginTop: 8, lineHeight: 20, marginBottom: 16 },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  limit: { fontFamily: fonts.medium, color: colors.cyan, fontSize: 13 },
  pasteLink: { fontFamily: fonts.semi, color: colors.pink, fontSize: 13 },
  chips: { paddingRight: 12, marginBottom: 8 },
  feedHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  count: { fontFamily: fonts.bold, color: colors.faint, fontSize: 13 },
  empty: { fontFamily: fonts.body, color: colors.muted, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 22 },
  pasteCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  pasteTitle: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text, letterSpacing: -0.6 },
  pasteHint: { fontFamily: fonts.body, color: colors.muted, marginTop: 6, marginBottom: 14 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    fontFamily: fonts.body,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  err: { color: colors.danger, fontFamily: fonts.medium, marginBottom: 8 },
});
