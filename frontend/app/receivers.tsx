import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassPanel } from '../src/components/ui/GlassPanel';
import { useSonosStore, useCastingStore } from '../src/store';
import { colors, fontFamilies, fontSizes, spacing } from '../src/design/tokens';

type Tab = 'sonos' | 'other';

const OTHER_RECEIVERS = [
  {
    id: 'mock-1',
    name: 'Demo Receiver',
    description: 'A simulated receiver to test the adapter interface.',
    icon: '📺',
    status: 'available',
  },
  {
    id: 'chromecast-placeholder',
    name: 'Chromecast',
    description: 'Google Cast support — coming soon.',
    icon: '📡',
    status: 'coming-soon',
  },
  {
    id: 'dlna-placeholder',
    name: 'DLNA / UPnP',
    description: 'Stream to any DLNA-compatible device.',
    icon: '🔊',
    status: 'coming-soon',
  },
];

export default function Receivers() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('sonos');
  const { devices, selectedDevices, toggleDeviceSelection } = useSonosStore();
  const { isCasting } = useCastingStore();

  const switchTab = (t: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTab(t);
  };

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity testID="receivers-back" onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Output Devices</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Segment control */}
        <View style={styles.tabs}>
          {(['sonos', 'other'] as Tab[]).map((t) => (
            <TouchableOpacity
              testID={`receivers-tab-${t}`}
              key={t}
              onPress={() => switchTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'sonos' ? 'Sonos' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tab === 'sonos' && (
            <View>
              <Text style={styles.sectionLabel}>Discovered on this network</Text>
              {devices.length === 0 ? (
                <GlassPanel style={styles.emptyCard} padding={20}>
                  <Text style={styles.emptyText}>No Sonos speakers found yet.</Text>
                  <TouchableOpacity testID="receivers-scan" onPress={() => router.push('/discovery')}>
                    <Text style={styles.scanLink}>Scan for speakers →</Text>
                  </TouchableOpacity>
                </GlassPanel>
              ) : (
                devices.map((device) => (
                  <TouchableOpacity
                    testID={`receivers-sonos-${device.id}`}
                    key={device.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleDeviceSelection(device.id);
                    }}
                  >
                    <GlassPanel
                      style={[styles.deviceCard, selectedDevices.includes(device.id) && styles.selectedCard]}
                      padding={16}
                    >
                      <View style={styles.deviceRow}>
                        <View style={[styles.dot, { backgroundColor: device.status === 'online' ? colors.status.online : colors.status.offline }]} />
                        <View style={styles.deviceInfo}>
                          <Text style={styles.deviceName}>{device.nickname || device.name}</Text>
                          <Text style={styles.deviceRoom}>{device.room}</Text>
                        </View>
                        {selectedDevices.includes(device.id) && (
                          <View style={styles.check}><Text style={styles.checkTxt}>✓</Text></View>
                        )}
                      </View>
                    </GlassPanel>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {tab === 'other' && (
            <View>
              <Text style={styles.sectionLabel}>Additional outputs</Text>
              {OTHER_RECEIVERS.map((r) => (
                  <GlassPanel
                      key={r.id}
                      style={styles.deviceCard}
                      padding={16}
                    >
                  <View style={styles.deviceRow}>
                    <Text style={styles.receiverIcon}>{r.icon}</Text>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{r.name}</Text>
                      <Text style={styles.deviceRoom}>{r.description}</Text>
                    </View>
                    {r.status === 'coming-soon' && (
                      <View style={styles.badge}><Text style={styles.badgeText}>Soon</Text></View>
                    )}
                  </View>
                </GlassPanel>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screenPadding, paddingTop: 16, paddingBottom: 12 },
  back: { color: colors.text.secondary, fontSize: 22 },
  title: { color: colors.text.primary, fontSize: fontSizes.h4, fontFamily: fontFamilies.heading },
  tabs: { flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginBottom: spacing.md, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100 },
  tabActive: { backgroundColor: colors.brand.primary },
  tabText: { color: colors.text.tertiary, fontSize: fontSizes.caption, fontFamily: fontFamilies.bodyMed },
  tabTextActive: { color: '#fff' },
  content: { paddingHorizontal: spacing.screenPadding, paddingBottom: 40 },
  sectionLabel: { color: colors.text.tertiary, fontSize: fontSizes.small, fontFamily: fontFamilies.bodyMed, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  deviceCard: { marginBottom: 8 },
  selectedCard: { borderColor: colors.brand.primary, borderWidth: 1 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  deviceInfo: { flex: 1 },
  deviceName: { color: colors.text.primary, fontSize: fontSizes.body, fontFamily: fontFamilies.bodySemiBold },
  deviceRoom: { color: colors.text.secondary, fontSize: fontSizes.small, fontFamily: fontFamilies.body, marginTop: 2 },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brand.primary, alignItems: 'center', justifyContent: 'center' },
  checkTxt: { color: '#fff', fontSize: 10 },
  emptyCard: { marginBottom: 8 },
  emptyText: { color: colors.text.secondary, fontSize: fontSizes.body, fontFamily: fontFamilies.body, marginBottom: 12 },
  scanLink: { color: colors.brand.primary, fontSize: fontSizes.body, fontFamily: fontFamilies.bodySemiBold },
  receiverIcon: { fontSize: 24 },
  badge: { backgroundColor: 'rgba(255,95,5,0.2)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: colors.brand.primary, fontSize: fontSizes.micro, fontFamily: fontFamilies.bodySemiBold },
});
