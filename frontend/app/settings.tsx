import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassPanel } from '../src/components/ui/GlassPanel';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { useSettingsStore, useSonosStore, useCastingStore } from '../src/store';
import { supabase } from '../src/lib/supabase';
import { handshakeTest } from '../src/sonos/sonosController';
import { colors, fontFamilies, fontSizes, spacing } from '../src/design/tokens';
import type { AudioQuality } from '../src/types';

export default function Settings() {
  const router = useRouter();
  const { audioQuality, reduceMotion, setAudioQuality, setReduceMotion, loadFromSupabase } = useSettingsStore();
  const { devices, selectedDevices } = useSonosStore();
  const { isCasting, streamUrl, connectedClients, captureMode } = useCastingStore();

  const [user, setUser] = useState<any>(null);
  const [handshakeResult, setHandshakeResult] = useState<string | null>(null);
  const [handshakePending, setHandshakePending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadFromSupabase();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    Alert.alert('Signed out');
  };

  const handleHandshake = async () => {
    const device = devices.find((d) => selectedDevices.includes(d.id));
    if (!device) { setHandshakeResult('No speaker selected'); return; }
    setHandshakePending(true);
    const result = await handshakeTest(device);
    setHandshakeResult(result);
    setHandshakePending(false);
  };

  const QUALITY_OPTIONS: AudioQuality[] = ['low', 'medium', 'high'];

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity testID="settings-back" onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Account */}
          <Text style={styles.sectionLabel}>Account</Text>
          <GlassPanel padding={16} style={styles.card}>
            {user ? (
              <View>
                <Text style={styles.settingTitle}>{user.email}</Text>
                <Text style={styles.settingSubtitle}>Signed in</Text>
                <TouchableOpacity testID="settings-signout" onPress={handleSignOut} style={styles.linkBtn}>
                  <Text style={styles.linkBtnText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.settingSubtitle}>Not signed in</Text>
                <TouchableOpacity testID="settings-signin" onPress={() => router.push('/auth')} style={styles.linkBtn}>
                  <Text style={styles.linkBtnText}>Sign In / Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassPanel>

          {/* Audio */}
          <Text style={styles.sectionLabel}>Audio</Text>
          <GlassPanel padding={16} style={styles.card}>
            <Text style={styles.settingTitle}>Stream Quality</Text>
            <View style={styles.qualityRow}>
              {QUALITY_OPTIONS.map((q) => (
                <TouchableOpacity
                  testID={`settings-quality-${q}`}
                  key={q}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAudioQuality(q); }}
                  style={[styles.qualityBtn, audioQuality === q && styles.qualityBtnActive]}
                >
                  <Text style={[styles.qualityBtnText, audioQuality === q && styles.qualityBtnTextActive]}>
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassPanel>

          {/* Accessibility */}
          <Text style={styles.sectionLabel}>Accessibility</Text>
          <GlassPanel padding={16} style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Reduce Motion</Text>
                <Text style={styles.settingSubtitle}>Simplify animations</Text>
              </View>
              <Switch
                testID="settings-reduce-motion"
                value={reduceMotion}
                onValueChange={(val) => { setReduceMotion(val); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.brand.primary }}
                thumbColor="#fff"
              />
            </View>
          </GlassPanel>

          {/* Dev Tools */}
          <Text style={styles.sectionLabel}>Developer</Text>
          <GlassPanel padding={16} style={styles.card}>
            <TouchableOpacity testID="settings-orblab" onPress={() => router.push('/orb-lab')} style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Orb Lab</Text>
                <Text style={styles.settingSubtitle}>Visualizer simulator</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </GlassPanel>

          {/* Diagnostics */}
          <Text style={styles.sectionLabel}>Diagnostics</Text>
          <GlassPanel padding={16} style={styles.card}>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Discovered devices</Text>
              <Text style={styles.diagValue}>{devices.length}</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Selected device IP</Text>
              <Text style={styles.diagValue}>
                {devices.find((d) => selectedDevices.includes(d.id))?.ip ?? '—'}
              </Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Stream status</Text>
              <Text style={[styles.diagValue, { color: isCasting ? colors.status.casting : colors.status.offline }]}>
                {isCasting ? 'STREAMING' : 'IDLE'}
              </Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Stream URL</Text>
              <Text style={styles.diagValue} numberOfLines={1}>{streamUrl ?? '—'}</Text>
            </View>
            <View style={styles.diagRow}>
              <Text style={styles.diagLabel}>Connected clients</Text>
              <Text style={styles.diagValue}>{connectedClients}</Text>
            </View>

            {handshakeResult && (
              <View style={styles.handshakeResult}>
                <Text style={styles.diagValue}>{handshakeResult}</Text>
              </View>
            )}

            <PrimaryButton
              testID="settings-handshake"
              title="Sonos Handshake Test"
              onPress={handleHandshake}
              loading={handshakePending}
              variant="outline"
              style={styles.diagBtn}
            />
          </GlassPanel>
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
  content: { paddingHorizontal: spacing.screenPadding, paddingBottom: 60 },
  sectionLabel: { color: colors.text.tertiary, fontSize: fontSizes.small, fontFamily: fontFamilies.bodyMed, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  card: { marginBottom: 4 },
  settingTitle: { color: colors.text.primary, fontSize: fontSizes.body, fontFamily: fontFamilies.bodySemiBold, marginBottom: 2 },
  settingSubtitle: { color: colors.text.tertiary, fontSize: fontSizes.small, fontFamily: fontFamilies.body },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qualityRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  qualityBtn: { flex: 1, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: colors.glass.border, alignItems: 'center' },
  qualityBtnActive: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
  qualityBtnText: { color: colors.text.secondary, fontSize: fontSizes.caption, fontFamily: fontFamilies.bodyMed },
  qualityBtnTextActive: { color: '#fff' },
  linkBtn: { marginTop: 12 },
  linkBtnText: { color: colors.brand.primary, fontSize: fontSizes.body, fontFamily: fontFamilies.bodySemiBold },
  diagRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.glass.border },
  diagLabel: { color: colors.text.secondary, fontSize: fontSizes.small, fontFamily: fontFamilies.body },
  diagValue: { color: colors.text.primary, fontSize: fontSizes.small, fontFamily: fontFamilies.mono, maxWidth: 160 },
  handshakeResult: { paddingVertical: 8 },
  diagBtn: { marginTop: 16 },
  chevron: { color: colors.text.tertiary, fontSize: 18 },
});
