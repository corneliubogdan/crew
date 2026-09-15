import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, StyleSheet, View } from 'react-native';
import { PaywallSheet } from '../components/PaywallSheet';
import { AfterglowScreen } from '../screens/AfterglowScreen';
import { CrewRoomScreen } from '../screens/CrewRoomScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { GoScreen } from '../screens/GoScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fonts } from '../theme';
import type { RootStackParamList, RootTabParamList } from './types';

// JS stack on every platform. native-stack on Expo web paints a blank light
// card for EventDetail (params arrive, screen never layouts).
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: { paddingTop: 6 },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Go"
        component={GoScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="navigate" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="You"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    border: colors.line,
    primary: colors.lime,
    text: colors.text,
  },
};

export function RootNavigator() {
  return (
    <View style={styles.shell}>
      <View style={styles.phone}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: colors.bg, flex: 1 },
              detachPreviousScreen: false,
            }}
          >
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="CrewRoom" component={CrewRoomScreen} />
            <Stack.Screen name="Afterglow" component={AfterglowScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <PaywallSheet />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    backgroundColor: colors.bg,
    position: 'relative',
  },
  tabBar: {
    backgroundColor: colors.bgElevated,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
  },
  tabLabel: { fontFamily: fonts.semi, fontSize: 11, letterSpacing: 0.4 },
});
