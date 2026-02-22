import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { OrbVisualizer } from '../src/components/visual/OrbVisualizer';
import { VolumeSlider } from '../src/components/ui/VolumeSlider';
import { GlassPanel } from '../src/components/ui/GlassPanel';
import { colors, fontFamilies, fontSizes, spacing } from '../src/design/tokens';

function MetricSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={sl.wrap}>
      <VolumeSlider
        value={value}
        onValueChange={onChange}
        testID={`orblab-${label.toLowerCase()}`}
      />
      <Text style={sl.overrideLabel}>{label}</Text>
    </View>
  );
}

const sl = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  overrideLabel: { color: colors.text.tertiary, fontSize: fontSizes.micro, fontFamily: fontFamilies.mono, marginTop: -8, marginBottom: 4 },
});

export default function OrbLab() {
  const router = useRouter();
  const [energy, setEnergy] = useState(0.5);
  const [bass, setBass] = useState(0.4);
  const [presence, setPresence] = useState(0.35);
  const [volume, setVolume] = useState(0.6);
  const [isActive, setIsActive] = useState(true);

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity testID="orblab-back" onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Orb Lab</Text>
          <TouchableOpacity testID="orblab-toggle" onPress={() => setIsActive(!isActive)}>
            <Text style={[styles.toggle, isActive && styles.toggleActive]}>
              {isActive ? 'Live' : 'Paused'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Live orb preview */}
          <View style={styles.orbStage}>
            <OrbVisualizer
              energy={energy}
              bass={bass}
              presence={presence}
              volume={volume}
              size={260}
              isActive={isActive}
            />
          </View>

          {/* Metric readout */}
          <GlassPanel style={styles.metricsCard} padding={16}>
            <View style={styles.metricRow}>
              {[
                { l: 'E', v: energy, c: '#FF5F05' },
                { l: 'B', v: bass, c: '#4466FF' },
                { l: 'P', v: presence, c: '#44CCFF' },
                { l: 'V', v: volume, c: '#AADDFF' },
              ].map(({ l, v, c }) => (
                <View key={l} style={styles.metric}>
                  <Text style={[styles.metricVal, { color: c }]}>{(v * 100).toFixed(0)}</Text>
                  <Text style={styles.metricLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>

          {/* Controls */}
          <GlassPanel padding={20} style={styles.controlsCard}>
            <MetricSlider label="Energy" value={energy} onChange={setEnergy} />
            <MetricSlider label="Bass" value={bass} onChange={setBass} />
            <MetricSlider label="Presence" value={presence} onChange={setPresence} />
            <MetricSlider label="Volume" value={volume} onChange={setVolume} />
          </GlassPanel>

          {/* Presets */}
          <GlassPanel padding={16} style={styles.presetsCard}>
            <Text style={styles.presetsLabel}>Presets</Text>
            <View style={styles.presetsRow}>
              {[
                { name: 'Idle', e: 0.1, b: 0.05, p: 0.05, v: 0.3 },
                { name: 'Bass', e: 0.8, b: 0.95, p: 0.2, v: 0.7 },
                { name: 'Peak', e: 1, b: 0.9, p: 0.9, v: 1 },
                { name: 'Soft', e: 0.3, b: 0.1, p: 0.4, v: 0.4 },
              ].map((p) => (
                <TouchableOpacity
                  testID={`orblab-preset-${p.name.toLowerCase()}`}
                  key={p.name}
                  onPress={() => { setEnergy(p.e); setBass(p.b); setPresence(p.p); setVolume(p.v); }}
                  style={styles.presetBtn}
                >
                  <Text style={styles.presetText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  toggle: { color: colors.text.tertiary, fontSize: fontSizes.caption, fontFamily: fontFamilies.bodyMed, borderWidth: 1, borderColor: colors.glass.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  toggleActive: { color: colors.status.casting, borderColor: colors.status.casting },
  content: { paddingHorizontal: spacing.screenPadding, paddingBottom: 60 },
  orbStage: { alignItems: 'center', paddingVertical: 20 },
  metricsCard: { marginBottom: spacing.md },
  metricRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center' },
  metricVal: { fontSize: fontSizes.h3, fontFamily: fontFamilies.mono },
  metricLabel: { color: colors.text.tertiary, fontSize: fontSizes.micro, fontFamily: fontFamilies.mono, marginTop: 2 },
  controlsCard: { marginBottom: spacing.md },
  presetsCard: { marginBottom: spacing.md },
  presetsLabel: { color: colors.text.tertiary, fontSize: fontSizes.small, fontFamily: fontFamilies.bodyMed, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  presetsRow: { flexDirection: 'row', gap: 8 },
  presetBtn: { flex: 1, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: colors.glass.border, alignItems: 'center' },
  presetText: { color: colors.text.secondary, fontSize: fontSizes.caption, fontFamily: fontFamilies.bodyMed },
});
