import { RootAuthProvider, useRootAuth } from '@/context/RootAuthCtx';
import '@/global.css';
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

  useEffect(() => {
    Uniwind.setTheme('light');
  }, [])

  return (
    <RootAuthProvider>
      <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
        <PortalHost />
      </ThemeProvider>
    </RootAuthProvider>
  );
}

function RootNavigator() {
  const { isValid: isAuthenticated } = useRootAuth();

  return (
    <Stack screenOptions={SCREENOPTIONS}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name='(auth)' />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name='(protected)' />
      </Stack.Protected>
      <Stack.Screen name='+not-found' />
    </Stack>
  )
}

