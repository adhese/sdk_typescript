import '../polyfills';
import { AdheseProvider } from '@adhese/sdk-react-native';
import { Stack } from 'expo-router';
import { useMemo } from 'react';

export default function RootLayout() {
  const options = useMemo(() => ({
    account: 'ali',
    debug: true,
    location: '_homepage_',
  }), []);

  return (
    <AdheseProvider options={options}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Adhese RN Example' }} />
      </Stack>
    </AdheseProvider>
  );
}
