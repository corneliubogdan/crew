import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IAP_COPY } from '../api/iap';
import { useAppStore } from '../store/useAppStore';
import { colors, fonts, radius } from '../theme';
import { PrimaryButton } from './ui';

export function PaywallSheet() {
  const open = useAppStore((s) => s.paywallOpen);
  const reason = useAppStore((s) => s.paywallReason);
  const close = useAppStore((s) => s.closePaywall);
  const unlock = useAppStore((s) => s.unlockCrewPass);
  const buy = useAppStore((s) => s.buyExtraJoin);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.grab} />
          <Text style={styles.kicker}>soft paywall</Text>
          <Text style={styles.title}>one crew is free.{'\n'}the rest is pass.</Text>
          {reason ? <Text style={styles.reason}>{reason}</Text> : null}
          <Text style={styles.body}>
            browse everything. join or open 1 crew / month on us. after that it&apos;s {IAP_COPY.joinPrice} or{' '}
            {IAP_COPY.passPrice} unlimited.
          </Text>
          <Text style={styles.honest}>{IAP_COPY.honest} not a ticket tax. we don&apos;t sell tickets.</Text>
          <PrimaryButton label={`unlock crew pass · ${IAP_COPY.passPrice}`} onPress={unlock} />
          <View style={{ height: 10 }} />
          <PrimaryButton
            label={`one more join · ${IAP_COPY.joinPrice}`}
            tone="ghost"
            onPress={buy}
          />
          <Pressable onPress={close} style={styles.later}>
            <Text style={styles.laterTxt}>not now</Text>
          </Pressable>
          <Text style={styles.fine}>mock IAP — no charge, local flag only</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.line,
  },
  grab: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: 16,
  },
  kicker: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: colors.pink,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    letterSpacing: -1.2,
    marginTop: 8,
    lineHeight: 34,
  },
  reason: { fontFamily: fonts.medium, color: colors.lime, marginTop: 10, fontSize: 14 },
  body: { fontFamily: fonts.body, color: colors.muted, fontSize: 15, lineHeight: 22, marginVertical: 14 },
  honest: { fontFamily: fonts.medium, color: colors.faint, fontSize: 13, marginBottom: 18 },
  later: { alignItems: 'center', paddingVertical: 14 },
  laterTxt: { fontFamily: fonts.semi, color: colors.muted },
  fine: { textAlign: 'center', fontFamily: fonts.body, fontSize: 11, color: colors.faint },
});
