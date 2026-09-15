import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Syne_700Bold, Syne_800ExtraBold, useFonts } from '@expo-google-fonts/syne';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import { colors } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const hydrated = useAppStore((s) => s.hydrated);
  const setHydrated = useAppStore((s) => s.setHydrated);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated());
    const t = setTimeout(() => setHydrated(), 800);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [setHydrated]);

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.lime} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
