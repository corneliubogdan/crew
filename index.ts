import 'react-native-gesture-handler';
import '@expo/metro-runtime';
import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';

import App from './App';

// native-stack + screens on web can paint a blank light frame over EventDetail.
if (Platform.OS === 'web') {
  enableScreens(false);
}

registerRootComponent(App);
