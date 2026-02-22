import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OrbVisualizer } from '../src/components/visual/OrbVisualizer';
import { VolumeSlider } from '../src/components/ui/VolumeSlider';
import { GlassPanel } from '../src/components/ui/GlassPanel';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { useSonosStore, useCastingStore } from '../src/store';
import { audioManager } from '../src/audio/audioManager';
import { startCasting, stop, setVolume as setSonosVolume } from '../src/sonos/sonosController';
import { colors, fontFamilies, fontSizes, spacing, radii } from '../src/design/tokens';
import type { AudioMetrics } from '../src/audio/audioManager';

const { width: W } = Dimensions.get('window');
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const STREAM_URL = `${BACKEND_URL}/api/stream`;

export default function Casting() {
  const router = useRouter();
  const { devices, selectedDevices } = useSonosStore();
  const { isCasting, sourceLabel, captureMode, audioMetrics, setIsCasting, setAudioMetrics, setStreamUrl } = useCastingStore();

  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const selectedDevice = devices.find((d) => selectedDevices[0] === d.id);

  // Subscribe to audio manager
  useEffect(() => {
    audioManager.setVolume(volume);
    const unsub = audioManager.subscribe((metrics: AudioMetrics) => {
      setAudioMetrics(metrics);
    });
    audioManager.start('demo');
    return () => {
      unsub();
      audioManager.stop();
    };
  }, []);

  useEffect(() => {
    audioManager.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const handleStartCasting = async () => {
    if (!selectedDevice) {
      router.push('/discovery');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStreamUrl(STREAM_URL);
    await startCasting(selectedDevice, STREAM_URL);
    setIsCasting(true);
  };

  const handleStopCasting = async () => {
    if (selectedDevice) await stop(selectedDevice);
    setIsCasting(false);
    setStreamUrl(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleVolumeChange = useCallback(async (val: number) => {
    setVolume(val);
    if (selectedDevice) await setSonosVolume(selectedDevice, val);
  }, [selectedDevice]);

  const handleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const metrics = audioMetrics;

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity testID="casting-speakers-btn" onPress={() => router.push('/discovery')} style={styles.speakerBtn}>
            <View style={[styles.speakerDot, { backgroundColor: isCasting ? colors.status.casting : colors.status.offline }]} />
            <Text style={styles.speakerName} numberOfLines={1}>
              {selectedDevice ? (selectedDevice.nickname || selectedDevice.name) : 'No speaker selected'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="casting-settings-btn" onPress={() => router.push('/settings')} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Orb stage */}
          <Animated.View entering={FadeIn.duration(800)} style={styles.orbStage}>
            <View style={styles.orbGlow} />
            <OrbVisualizer
              energy={isMuted ? 0 : metrics.energy}
              bass={isMuted ? 0 : metrics.bass}
              presence={metrics.presence}
              volume={isMuted ? 0 : volume}
              size={W * 0.65}
              isActive={isCasting}
            />
          </Animated.View>

          {/* Now playing */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <GlassPanel style={styles.nowPlaying} padding={16}>
              <View style={styles.nowPlayingRow}>
                <View style={[styles.sourceDot, { backgroundColor: isCasting ? colors.status.casting : colors.text.tertiary }]} />
                <View style={styles.nowPlayingText}>
                  <Text style={styles.nowPlayingTitle}>
                    {isCasting ? sourceLabel : 'Not Casting'}
                  </Text>
                  <Text style={styles.nowPlayingMode}>
                    {isCasting
                      ? `Demo mode • ${STREAM_URL.slice(0, 32)}…`
                      : 'Tap below to start'}
                  </Text>
                </View>
              </View>
            </GlassPanel>
          </Animated.View>

          {/* Volume */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.volumeSection}>
            <VolumeSlider
              testID="casting-volume-slider"
              value={isMuted ? 0 : volume}
              onValueChange={handleVolumeChange}
            />
          </Animated.View>

          {/* Controls */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.controls}>
            {/* Mute */}
            <TouchableOpacity
              testID="casting-mute-btn"
              onPress={handleMute}
              style={[styles.iconControl, isMuted && styles.iconControlActive]}
            >
              <Text style={styles.iconControlText}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>

            {/* Main cast / stop */}
            {isCasting ? (
              <PrimaryButton
                testID="casting-stop-btn"
                title="Stop Casting"
                onPress={handleStopCasting}
                variant="outline"
                style={styles.castBtn}
              />
            ) : (
              <PrimaryButton
                testID="casting-start-btn"
                title={selectedDevice ? 'Start Casting' : 'Select Speaker'}
                onPress={handleStartCasting}
                style={styles.castBtn}
              />
            )}

            {/* Receivers */}
            <TouchableOpacity
              testID="casting-receivers-btn"
              onPress={() => router.push('/receivers')}
              style={styles.iconControl}
            >
              <Text style={styles.iconControlText}>📡</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Capture notice */}
          {captureMode === 'blocked' && (
            <GlassPanel style={styles.captureNotice} padding={12}>
              <Text style={styles.captureTitle}>Audio capture restricted</Text>
              <Text style={styles.captureBody}>
                This app is running in demo mode. Android restricts capturing audio from other apps. See Settings → Diagnostics for options.
              </Text>
            </GlassPanel>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 8,
  },
  speakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  speakerDot: { width: 8, height: 8, borderRadius: 4 },
  speakerName: {
    color: colors.text.primary,
    fontSize: fontSizes.body,
    fontFamily: fontFamilies.bodySemiBold,
    flex: 1,
  },
  chevron: { color: colors.text.tertiary, fontSize: 18 },
  iconBtn: { padding: 4 },
  iconBtnText: { fontSize: 20 },
  scroll: { paddingHorizontal: spacing.screenPadding, paddingBottom: 40 },
  orbStage: { alignItems: 'center', justifyContent: 'center', marginVertical: 8, position: 'relative', maxHeight: 260, height: 260 },
  orbGlow: {
    position: 'absolute',
    width: W * 0.6,
    height: W * 0.6,
    borderRadius: W * 0.3,
    backgroundColor: 'rgba(255,95,5,0.08)',
  },
  nowPlaying: { marginBottom: spacing.lg },
  nowPlayingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sourceDot: { width: 10, height: 10, borderRadius: 5 },
  nowPlayingText: { flex: 1 },
  nowPlayingTitle: {
    color: colors.text.primary,
    fontSize: fontSizes.body,
    fontFamily: fontFamilies.bodySemiBold,
    marginBottom: 2,
  },
  nowPlayingMode: {
    color: colors.text.tertiary,
    fontSize: fontSizes.small,
    fontFamily: fontFamilies.mono,
  },
  volumeSection: { marginBottom: spacing.xl },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconControl: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconControlActive: { borderColor: colors.brand.primary, backgroundColor: 'rgba(255,95,5,0.15)' },
  iconControlText: { fontSize: 20 },
  castBtn: { flex: 1, maxWidth: 200 },
  captureNotice: { marginBottom: spacing.md },
  captureTitle: {
    color: colors.text.primary,
    fontSize: fontSizes.caption,
    fontFamily: fontFamilies.bodySemiBold,
    marginBottom: 4,
  },
  captureBody: {
    color: colors.text.secondary,
    fontSize: fontSizes.small,
    fontFamily: fontFamilies.body,
    lineHeight: 18,
  },
});
