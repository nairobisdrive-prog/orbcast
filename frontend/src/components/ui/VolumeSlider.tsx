import React, { useCallback, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, fontFamilies, fontSizes, radii, shadows } from '../../design/tokens';

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 6;
const TICK_POINTS = [0, 0.25, 0.5, 0.75, 1];

interface VolumeSliderProps {
  value: number; // 0..1
  onValueChange: (value: number) => void;
  testID?: string;
}

export function VolumeSlider({ value, onValueChange, testID }: VolumeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fill = useSharedValue(value);
  const lastTick = useRef(-1);

  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  const updateValue = useCallback(
    (locationX: number) => {
      if (trackWidth <= 0) return;
      const newVal = clamp(locationX / trackWidth);
      fill.value = newVal;
      onValueChange(newVal);

      // Haptic ticks at 0 / 25 / 50 / 75 / 100
      const tick = Math.round(newVal * 4);
      if (tick !== lastTick.current) {
        lastTick.current = tick;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [trackWidth, onValueChange, fill]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        updateValue(e.nativeEvent.locationX);
      },
      onPanResponderMove: (e) => {
        updateValue(e.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
    })
  ).current;

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%` as any,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: fill.value * trackWidth - THUMB_SIZE / 2,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
    fill.value = withSpring(value, { damping: 15, stiffness: 120 });
  };

  const pct = Math.round(value * 100);

  return (
    <View testID={testID} style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Volume</Text>
        <Text style={styles.valueLabel}>{pct}%</Text>
      </View>
      <View
        style={styles.hitArea}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Track */}
        <View style={styles.track}>
          {/* Fill */}
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>

        {/* Tick marks */}
        {TICK_POINTS.map((tp) => (
          <View
            key={tp}
            style={[
              styles.tick,
              {
                left: tp * trackWidth - 1,
                opacity: value >= tp - 0.01 ? 0.8 : 0.25,
              },
            ]}
          />
        ))}

        {/* Thumb */}
        {trackWidth > 0 && (
          <Animated.View style={[styles.thumb, thumbStyle]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: colors.text.secondary,
    fontSize: fontSizes.caption,
    fontFamily: fontFamilies.bodyMed,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  valueLabel: {
    color: colors.brand.primary,
    fontSize: fontSizes.caption,
    fontFamily: fontFamilies.mono,
  },
  hitArea: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: TRACK_HEIGHT / 2,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  tick: {
    position: 'absolute',
    top: THUMB_SIZE / 2 - 4,
    width: 2,
    height: 8,
    backgroundColor: colors.brand.primary,
    borderRadius: 1,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.brand.primary,
    top: 4 - THUMB_SIZE / 2 + TRACK_HEIGHT / 2,
    ...shadows.glow,
  },
});
