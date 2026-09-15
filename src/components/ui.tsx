import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, colorForName, fonts, initials, radius } from '../theme';
import { vibeColor, vibeLabel } from '../data/vibes';
import type { VibeId } from '../types';

export function Avatar({
  name,
  size = 36,
  ring,
}: {
  name: string;
  size?: number;
  ring?: boolean;
}) {
  const bg = colorForName(name);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: ring ? 2 : 0,
          borderColor: colors.lime,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
    </View>
  );
}

export function AvatarStack({ names, size = 26 }: { names: string[]; size?: number }) {
  return (
    <View style={styles.stack}>
      {names.slice(0, 4).map((n, i) => (
        <View key={n + i} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}>
          <Avatar name={n} size={size} />
        </View>
      ))}
    </View>
  );
}

export function VibeChip({
  id,
  selected,
  onPress,
  compact,
}: {
  id: VibeId;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
}) {
  const color = vibeColor(id);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        compact && styles.chipCompact,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: 'transparent', borderColor: colors.lineStrong },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          compact && { fontSize: 11 },
          { color: selected ? colors.limeInk : colors.text },
        ]}
      >
        {vibeLabel(id)}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  tone = 'lime',
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  tone?: 'lime' | 'pink' | 'ghost' | 'dark';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    tone === 'lime' ? colors.lime : tone === 'pink' ? colors.pink : tone === 'dark' ? colors.cardSoft : 'transparent';
  const fg = tone === 'lime' ? colors.limeInk : tone === 'ghost' ? colors.text : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: tone === 'ghost' ? colors.lineStrong : bg, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionLabel({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.section, style]}>{children}</Text>;
}

export function BackHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <Text style={styles.backTxt}>←</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Hairline() {
  return <View style={styles.hair} />;
}

export function PressableCard(props: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const { style, children, ...rest } = props;
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.limeInk,
    fontFamily: fonts.bold,
  },
  stack: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    marginRight: 8,
    marginBottom: 8,
  },
  chipCompact: { paddingHorizontal: 9, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  chipText: { fontFamily: fonts.semi, fontSize: 13, letterSpacing: -0.2 },
  btn: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  btnText: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: -0.3 },
  section: {
    fontFamily: fonts.semi,
    fontSize: 11,
    color: colors.faint,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  backTxt: { color: colors.text, fontSize: 18 },
  headerTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.text, letterSpacing: -0.4 },
  headerSub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 1 },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
});
