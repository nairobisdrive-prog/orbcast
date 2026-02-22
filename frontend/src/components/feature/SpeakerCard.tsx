import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassPanel } from '../ui/GlassPanel';
import { colors, fontFamilies, fontSizes, radii, spacing } from '../../design/tokens';
import type { SonosDevice } from '../../types';

interface SpeakerCardProps {
  device: SonosDevice;
  isSelected: boolean;
  onPress: (id: string) => void;
  testID?: string;
}

const STATUS_COLORS: Record<SonosDevice['status'], string> = {
  online: colors.status.online,
  offline: colors.status.offline,
  unknown: colors.text.tertiary,
};

export function SpeakerCard({ device, isSelected, onPress, testID }: SpeakerCardProps) {
  const displayName = device.nickname || device.name;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(device.id);
  };

  return (
    <TouchableOpacity
      testID={testID ?? `speaker-card-${device.id}`}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <GlassPanel
        padding={16}
        style={[
          styles.card,
          isSelected ? styles.selectedCard : undefined,
        ] as any}
      >
        <View style={styles.row}>
          {/* Status dot */}
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[device.status] }]} />

          <View style={styles.info}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.room}>{device.room}</Text>
          </View>

          <View style={styles.right}>
            {device.status === 'online' && (
              <Text style={styles.volume}>{device.volume}%</Text>
            )}
            {isSelected && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {device.modelName ? (
          <Text style={styles.model}>{device.modelName}</Text>
        ) : null}

        {isSelected && <View style={styles.glowLine} />}
      </GlassPanel>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: colors.brand.primary,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontSize: fontSizes.body,
    fontFamily: fontFamilies.bodySemiBold,
  },
  room: {
    color: colors.text.secondary,
    fontSize: fontSizes.small,
    fontFamily: fontFamilies.body,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  volume: {
    color: colors.text.tertiary,
    fontSize: fontSizes.small,
    fontFamily: fontFamilies.mono,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fontFamilies.bodySemiBold,
  },
  model: {
    color: colors.text.tertiary,
    fontSize: fontSizes.micro,
    fontFamily: fontFamilies.body,
    marginTop: 8,
    marginLeft: 20,
    letterSpacing: 0.3,
  },
  glowLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brand.primary,
    opacity: 0.6,
  },
});
