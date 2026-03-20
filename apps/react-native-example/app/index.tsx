import type { AdheseSlot as Slot } from '@adhese/sdk-react-native';
import { AdheseSlot, useAdhese } from '@adhese/sdk-react-native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Setup callback factory that logs tracking events to the console.
 * Demonstrates how to use the `setup` prop to listen for impression
 * and viewability tracking hooks.
 */
function useTrackingSetup(label: string) {
  return useCallback(
    (_context: { value: Slot | null }, hooks: Record<string, (cb: (...args: unknown[]) => void) => void>) => {
      hooks.onImpressionTracked?.((ad: unknown) => {
        const adData = ad as { impressionCounter?: string } | undefined;
        console.log(`[Adhese] Impression tracked for "${label}"`, adData?.impressionCounter);
      });

      hooks.onViewableTracked?.((ad: unknown) => {
        const adData = ad as { viewableImpressionCounter?: string } | undefined;
        console.log(`[Adhese] Viewable impression tracked for "${label}"`, adData?.viewableImpressionCounter);
      });
    },
    [label],
  );
}

export default function HomeScreen() {
  const adhese = useAdhese();

  const billboardSetup = useTrackingSetup('billboard');
  const skyscraperSetup = useTrackingSetup('skyscraper');
  const rectangleSetup = useTrackingSetup('rectangle');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Adhese React Native SDK</Text>
      <Text style={styles.subtitle}>
        Account: {adhese ? 'Connected' : 'Loading...'}
      </Text>

      {/* WebView ad slot (default display mode) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billboard (WebView)</Text>
        <AdheseSlot
          format="billboard"
          width={970}
          height={250}
          setup={billboardSetup}
          placeholder={<Text style={styles.placeholder}>Loading ad...</Text>}
        />
      </View>

      {/* Another WebView ad slot with different dimensions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skyscraper (WebView)</Text>
        <AdheseSlot
          format="skyscraper"
          width={300}
          height={250}
          setup={skyscraperSetup}
          placeholder={<Text style={styles.placeholder}>Loading ad...</Text>}
        />
      </View>

      {/* Custom render function — full control over ad display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Render</Text>
        <AdheseSlot
          format="rectangle"
          width={300}
          height={250}
          setup={rectangleSetup}
          render={(slot) => (
            <View style={styles.customAd}>
              <Text style={styles.customAdText}>
                Custom rendered ad: {slot.name}
              </Text>
              <Text style={styles.customAdText}>
                Status: {slot.status}
              </Text>
            </View>
          )}
          placeholder={<Text style={styles.placeholder}>Loading custom ad...</Text>}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholder: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
    backgroundColor: '#f0f0f0',
  },
  customAd: {
    padding: 20,
    backgroundColor: '#e8f4ff',
    borderRadius: 8,
  },
  customAdText: {
    fontSize: 14,
    color: '#333',
  },
});
