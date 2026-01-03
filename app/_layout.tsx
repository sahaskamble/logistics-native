import '@/global.css';
import { getCurrentUser } from '@/lib/actions/users';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Uniwind, useUniwind } from 'uniwind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const SCREENOPTIONS = {
  headerShown: false,
}

export default function RootLayout() {
  const { theme } = useUniwind();
  const { isValid } = getCurrentUser();

  useEffect(() => {
    Uniwind.setTheme('light');
  }, [])

  return (
    <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={SCREENOPTIONS}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!isValid}>
          <Stack.Screen name='(auth)' />
        </Stack.Protected>
        <Stack.Protected guard={isValid}>
          <Stack.Screen name='(protected)' />
        </Stack.Protected>
        <Stack.Screen name='+not-found' />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
}

// <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
