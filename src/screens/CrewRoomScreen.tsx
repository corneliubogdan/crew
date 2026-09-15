import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, BackHeader, PrimaryButton, SectionLabel } from '../components/ui';
import { personById } from '../data/seed';
import { formatWhen } from '../lib/dates';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';
import type { TicketStatus } from '../types';

const TICKETS: { id: TicketStatus; label: string }[] = [
  { id: 'got-it', label: 'got it' },
  { id: 'need-one', label: 'need one' },
  { id: 'waitlist', label: 'waitlist' },
  { id: 'idk', label: 'idk' },
];

export function CrewRoomScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CrewRoom'>>();
  const allCrews = useAppStore((s) => s.crews);
  const crew = allCrews.find((c) => c.id === route.params.crewId);
  const events = useAppStore((s) => s.events);
  const event = events.find((e) => e.id === crew?.eventId);
  const allMessages = useAppStore((s) => s.messages);
  const messages = useMemo(
    () => allMessages.filter((m) => m.crewId === route.params.crewId),
    [allMessages, route.params.crewId],
  );
  const me = useAppStore((s) => s.me);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const setTicketStatus = useAppStore((s) => s.setTicketStatus);
  const setMeetupSpot = useAppStore((s) => s.setMeetupSpot);
  const leaveCrew = useAppStore((s) => s.leaveCrew);
  const joinCrew = useAppStore((s) => s.joinCrew);
  const openPaywall = useAppStore((s) => s.openPaywall);
  const isMember = Boolean(crew?.members.some((m) => m.personId === me.id));
  const [joinHint, setJoinHint] = useState('');
  const [draft, setDraft] = useState('');
  const [spot, setSpot] = useState(crew?.meetupSpot ?? '');

  const mine = useMemo(() => crew?.members.find((m) => m.personId === me.id), [crew, me.id]);
  const isHost = Boolean(mine?.isHost);

  if (!crew || !event) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <BackHeader title="crew" onBack={() => navigation.goBack()} />
        <Text style={styles.missing}>this crew dissolved.</Text>
      </View>
    );
  }

  const onSend = () => {
    sendMessage(crew.id, draft);
    setDraft('');
  };

  const onJoin = () => {
    const result = joinCrew(crew.id);
    if (result.ok) {
      setJoinHint('');
      return;
    }
    if (result.needPaywall) openPaywall(result.reason);
    else setJoinHint(result.reason);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader
        title={crew.name}
        subtitle={`${event.title} · ${crew.members.length}/${crew.capacity}`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.pin}>
          <Text style={styles.pinKicker}>meetup pin</Text>
          {isHost ? (
            <TextInput
              value={spot}
              onChangeText={setSpot}
              onEndEditing={() => setMeetupSpot(crew.id, spot)}
              style={styles.pinInput}
            />
          ) : (
            <Text style={styles.pinTxt}>{crew.meetupSpot}</Text>
          )}
          <Text style={styles.pinWhen}>{formatWhen(event.startsAt).label}</Text>
        </View>

        <SectionLabel>roster</SectionLabel>
        {crew.members.map((m) => {
          const p = personById(m.personId);
          return (
            <View key={m.personId} style={styles.member}>
              <Avatar name={p.name} ring={m.isHost} />
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>
                  {p.name} {m.isHost ? '· host' : ''} {m.personId === me.id ? '· you' : ''}
                </Text>
                <Text style={styles.memberHandle}>@{p.handle}</Text>
              </View>
              <View style={styles.tix}>
                <Text style={styles.tixTxt}>{TICKETS.find((t) => t.id === m.ticketStatus)?.label}</Text>
              </View>
            </View>
          );
        })}

        {isMember ? (
          <>
            <SectionLabel style={{ marginTop: 16 }}>your ticket (self-reported)</SectionLabel>
            <View style={styles.ticketRow}>
              {TICKETS.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setTicketStatus(crew.id, t.id)}
                  style={[styles.tixChip, mine?.ticketStatus === t.id && styles.tixOn]}
                >
                  <Text style={[styles.tixChipTxt, mine?.ticketStatus === t.id && { color: colors.limeInk }]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <PrimaryButton label="join this crew" onPress={onJoin} style={{ marginTop: 12 }} />
            {joinHint ? <Text style={styles.empty}>{joinHint}</Text> : null}
          </>
        )}

        <SectionLabel style={{ marginTop: 22 }}>chat</SectionLabel>
        <View style={styles.chat}>
          {messages.map((msg) => {
            const p = personById(msg.personId);
            const mineMsg = msg.personId === me.id;
            return (
              <View key={msg.id} style={[styles.bubble, mineMsg && styles.bubbleMine]}>
                <Text style={styles.bubbleWho}>
                  {p.name} · {formatWhen(msg.at).time}
                </Text>
                <Text style={styles.bubbleTxt}>{msg.text}</Text>
              </View>
            );
          })}
          {messages.length === 0 ? <Text style={styles.empty}>dead silent. say hi.</Text> : null}
        </View>

        {isMember ? (
          <Pressable
            onPress={() => {
              leaveCrew(crew.id);
              navigation.goBack();
            }}
            style={styles.leave}
          >
            <Text style={styles.leaveTxt}>leave crew</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {isMember ? (
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="say something true"
            placeholderTextColor={colors.faint}
            style={styles.input}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <Pressable onPress={onSend} style={styles.send}>
            <Text style={styles.sendTxt}>send</Text>
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 24 },
  missing: { color: colors.muted, fontFamily: fonts.body, padding: 18 },
  pin: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lime + '44',
    marginBottom: 18,
  },
  pinKicker: { fontFamily: fonts.semi, color: colors.lime, letterSpacing: 1.4, fontSize: 11, textTransform: 'uppercase' },
  pinTxt: { fontFamily: fonts.displayBold, color: colors.text, fontSize: 20, marginTop: 6, letterSpacing: -0.4 },
  pinInput: {
    fontFamily: fonts.displayBold,
    color: colors.text,
    fontSize: 20,
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 4,
  },
  pinWhen: { fontFamily: fonts.body, color: colors.muted, marginTop: 6 },
  member: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  memberName: { fontFamily: fonts.semi, color: colors.text, fontSize: 15 },
  memberHandle: { fontFamily: fonts.body, color: colors.faint, fontSize: 12 },
  tix: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tixTxt: { fontFamily: fonts.medium, color: colors.muted, fontSize: 11 },
  ticketRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tixChip: {
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tixOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  tixChipTxt: { fontFamily: fonts.semi, color: colors.text, fontSize: 12 },
  chat: { gap: 8 },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: 'flex-start',
    maxWidth: '92%',
  },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#1A2410', borderColor: colors.lime + '33' },
  bubbleWho: { fontFamily: fonts.medium, color: colors.faint, fontSize: 11, marginBottom: 4 },
  bubbleTxt: { fontFamily: fonts.body, color: colors.text, fontSize: 15, lineHeight: 20 },
  empty: { fontFamily: fonts.body, color: colors.muted },
  leave: { alignItems: 'center', paddingVertical: 20 },
  leaveTxt: { fontFamily: fonts.semi, color: colors.danger },
  composer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgElevated,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    fontFamily: fonts.body,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  send: {
    backgroundColor: colors.lime,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sendTxt: { fontFamily: fonts.bold, color: colors.limeInk },
});
