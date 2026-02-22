import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SpeakerCard } from '../src/components/feature/SpeakerCard';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { useSonosStore } from '../src/store';
import { discoverDevices } from '../src/sonos/discovery';
import { colors, fontFamilies, fontSizes, spacing } from '../src/design/tokens';
import type { SonosDevice } from '../src/types';

export default function Discovery() {
  const router = useRouter();
  const { devices, selectedDevices, isScanning, setDevices, setIsScanning, toggleDeviceSelection } = useSonosStore();
  const [progressDevices, setProgressDevices] = useState<SonosDevice[]>([]);

  const startScan = async () => {
    setProgressDevices([]);
    setIsScanning(true);
    setDevices([]);

    const found = await discoverDevices((device) => {
      setProgressDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    setDevices(found);
    setIsScanning(false);
  };

  useEffect(() => {
    if (devices.length === 0) startScan();
  }, []);

  const displayDevices = isScanning ? progressDevices : devices;

  const handleContinue = () => {
    if (selectedDevices.length > 0) {
      router.replace('/casting');
    }
  };

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity testID="discovery-back" onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Find Speakers</Text>
          <TouchableOpacity testID="discovery-rescan" onPress={startScan} disabled={isScanning}>
            <Text style={[styles.rescan, isScanning && styles.rescanDisabled]}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Status bar */}
        <View style={styles.statusRow}>
          {isScanning ? (
            <View style={styles.scanningRow}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <Text style={styles.scanningText}>Scanning local network…</Text>
            </View>
          ) : (
            <Text style={styles.foundText}>
              {devices.length > 0
                ? `${devices.length} speaker${devices.length !== 1 ? 's' : ''} found`
                : 'No speakers found'}
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {displayDevices.map((device, i) => (
            <Animated.View key={device.id} entering={FadeInDown.delay(i * 80).duration(350)}>
              <SpeakerCard
                device={device}
                isSelected={selectedDevices.includes(device.id)}
                onPress={toggleDeviceSelection}
              />
            </Animated.View>
          ))}

          {!isScanning && devices.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No speakers found</Text>
              <Text style={styles.emptySubtitle}>
                Make sure your Sonos speakers are on the same Wi-Fi network.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <Text style={styles.selectedCount}>
            {selectedDevices.length > 0
              ? `${selectedDevices.length} selected`
              : 'Select speakers to cast to'}
          </Text>
          <PrimaryButton
            testID="discovery-continue"
            title="Start Casting"
            onPress={handleContinue}
            disabled={selectedDevices.length === 0}
            style={styles.ctaBtn}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  backText: { color: colors.text.secondary, fontSize: 22 },
  title: { color: colors.text.primary, fontSize: fontSizes.h4, fontFamily: fontFamilies.heading },
  rescan: { color: colors.brand.primary, fontSize: fontSizes.caption, fontFamily: fontFamilies.bodySemiBold },
  rescanDisabled: { opacity: 0.4 },
  statusRow: { paddingHorizontal: spacing.screenPadding, paddingBottom: 12 },
  scanningRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanningText: { color: colors.text.secondary, fontSize: fontSizes.caption, fontFamily: fontFamilies.body },
  foundText: { color: colors.text.secondary, fontSize: fontSizes.caption, fontFamily: fontFamilies.body },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screenPadding, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: colors.text.primary, fontSize: fontSizes.h4, fontFamily: fontFamilies.heading, marginBottom: 8 },
  emptySubtitle: { color: colors.text.secondary, fontSize: fontSizes.body, fontFamily: fontFamilies.body, textAlign: 'center', lineHeight: 22 },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxxl,
    paddingTop: 12,
    gap: 12,
  },
  selectedCount: { color: colors.text.tertiary, fontSize: fontSizes.small, fontFamily: fontFamilies.body, textAlign: 'center' },
  ctaBtn: { width: '100%' },
});
