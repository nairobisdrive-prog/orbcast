import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii } from '../../design/tokens';

interface GlassPanelProps {
  children?: React.ReactNode;
  style?: any;
  intensity?: number;
  radius?: number;
  padding?: number;
  testID?: string;
}

export function GlassPanel({
  children,
  style,
  intensity = 20,
  radius = radii.lg,
  padding = 20,
}: GlassPanelProps) {
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.blur, { borderRadius: radius }, style]}>
      <View style={[styles.overlay, { borderRadius: radius, padding }]}>
        {children}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: colors.glass.panel,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});
