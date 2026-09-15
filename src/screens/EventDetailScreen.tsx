import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CrewCard } from '../components/CrewCard';
import { BackHeader, PrimaryButton, SectionLabel, VibeChip } from '../components/ui';
import { formatRange } from '../lib/dates';
import { eventShareCaption } from '../lib/shareCaption';
import { crewCountForEvent } from '../lib/ranking';
import type { RootStackParamList } from '../navigation/types';
import { MAX_CREW, MIN_CREW, useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';

export function EventDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const event = useAppStore((s) => s.events.find((e) => e.id === route.params.eventId));
  const crews = useAppStore((s) => s.crews.filter((c) => c.eventId === route.params.eventId));
  const me = useAppStore((s) => s.me);
  const createCrew = useAppStore((s) => s.createCrew);
  const openPaywall = useAppStore((s) => s.openPaywall);
  const isMember = useAppStore((s) => s.isMember);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState(`${me.name.toLowerCase()}'s crew`);
  const [prompt, setPrompt] = useState('small group, no mixer energy');
  const [spot, setSpot] = useState('lobby, 15 min early');
  const [capacity, setCapacity] = useState(5);

  const forming = useMemo(() => (event ? crewCountForEvent(event.id, crews) : 0), [event, crews]);

  if (!event) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <BackHeader title="gone" onBack={() => navigation.goBack()} />
        <Text style={styles.missing}>this event dropped out of the feed.</Text>
      </View>
    );
  }

  const handleOpen = (crewId: string) => {
    navigation.navigate('CrewRoom', { crewId });
  };

  const handleCreate = () => {
    const result = createCrew({ eventId: event.id, name, prompt, meetupSpot: spot, capacity });
    setCreateOpen(false);
    if (result.ok) navigation.navigate('CrewRoom', { crewId: result.crewId });
    else if (result.needPaywall) openPaywall(result.reason);
  };

  const shareDraft = async () => {
    const caption = eventShareCaption(event);
    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(caption);
        Alert.alert('copied', 'share draft is on your clipboard. no instagram bot — caption only.');
        return;
      }
      await Share.share({ message: caption });
    } catch {
      await Clipboard.setStringAsync(caption);
    }
  };

  const myCrew = crews.find((c) => c.members.some((m) => m.personId === me.id));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <BackHeader
        title="event"
        subtitle={event.source}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={shareDraft} style={styles.shareBtn}>
            <Text style={styles.shareTxt}>share draft</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <LinearGradient colors={[event.accent + '66', colors.card]} style={StyleSheet.absoluteFill} />
          <Text style={styles.when}>{formatRange(event.startsAt, event.endsAt)}</Text>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.venue}>
            {event.venue} · {event.neighborhood}
          </Text>
        </View>

        <View style={styles.tags}>
          {event.vibeTags.map((id) => (
            <VibeChip key={id} id={id} compact />
          ))}
        </View>

        <Text style={styles.body}>{event.description}</Text>
        <Text style={styles.note}>
          we don&apos;t sell tickets. the button dumps you on the host page.
        </Text>

        <PrimaryButton
          label="tickets / rsvp ↗"
          onPress={() => WebBrowser.openBrowserAsync(event.ticketUrl)}
        />
        <View style={{ height: 10 }} />
        <PrimaryButton label="share draft (caption only)" tone="ghost" onPress={shareDraft} />

        <View style={styles.block}>
          <SectionLabel>{`${forming} crews forming · 3–8 people`}</SectionLabel>
          {myCrew ? (
            <Pressable onPress={() => navigation.navigate('CrewRoom', { crewId: myCrew.id })} style={styles.mine}>
              <Text style={styles.mineTxt}>you&apos;re in {myCrew.name} →</Text>
            </Pressable>
          ) : null}
          {crews.map((crew) => (
            <CrewCard
              key={crew.id}
              crew={crew}
              cta={isMember(crew.id) ? 'room' : 'open'}
              onPress={() => handleOpen(crew.id)}
            />
          ))}
          {crews.length === 0 ? <Text style={styles.empty}>nobody opened a crew yet. be the annoying one.</Text> : null}
          <PrimaryButton label="open a crew" tone="pink" onPress={() => setCreateOpen(true)} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCreateOpen(false)} />
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>open a crew</Text>
            <Text style={styles.createHint}>3–8 people. opening one counts as your monthly join.</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor={colors.faint} />
            <TextInput value={prompt} onChangeText={setPrompt} style={styles.input} placeholderTextColor={colors.faint} />
            <TextInput value={spot} onChangeText={setSpot} style={styles.input} placeholderTextColor={colors.faint} />
            <View style={styles.stepper}>
              <Pressable onPress={() => setCapacity((c) => Math.max(MIN_CREW, c - 1))} style={styles.stepBtn}>
                <Text style={styles.stepTxt}>−</Text>
              </Pressable>
              <Text style={styles.cap}>{capacity} seats</Text>
              <Pressable onPress={() => setCapacity((c) => Math.min(MAX_CREW, c + 1))} style={styles.stepBtn}>
                <Text style={styles.stepTxt}>+</Text>
              </Pressable>
            </View>
            <PrimaryButton label="start the crew" onPress={handleCreate} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 24 },
  missing: { color: colors.muted, fontFamily: fonts.body, padding: 18 },
  shareBtn: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  shareTxt: { color: colors.cyan, fontFamily: fonts.semi, fontSize: 12 },
  hero: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: 18,
    minHeight: 160,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  when: { fontFamily: fonts.semi, color: colors.text, letterSpacing: 1, fontSize: 11 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text, letterSpacing: -1, marginTop: 8, lineHeight: 32 },
  venue: { fontFamily: fonts.body, color: colors.text, marginTop: 8, opacity: 0.9 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  body: { fontFamily: fonts.body, color: colors.muted, fontSize: 15, lineHeight: 22, marginVertical: 12 },
  note: { fontFamily: fonts.medium, color: colors.faint, fontSize: 12, marginBottom: 14 },
  block: { marginTop: 22 },
  mine: {
    backgroundColor: colors.lime + '22',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.lime + '55',
  },
  mineTxt: { fontFamily: fonts.semi, color: colors.lime },
  empty: { fontFamily: fonts.body, color: colors.muted, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 22 },
  createCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
  },
  createTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.text, letterSpacing: -0.7 },
  createHint: { fontFamily: fonts.body, color: colors.muted, marginTop: 6, marginBottom: 12 },
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
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  stepTxt: { color: colors.text, fontSize: 20 },
  cap: { fontFamily: fonts.bold, color: colors.text, fontSize: 16 },
});
