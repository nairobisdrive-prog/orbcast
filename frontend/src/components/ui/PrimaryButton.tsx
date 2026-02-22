import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fontFamilies, fontSizes, radii, shadows } from '../../design/tokens';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  testID,
}: PrimaryButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        testID={testID}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.container, disabled && styles.disabled, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#FF5F05', '#DD3403']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.text, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        testID={testID}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.outlineContainer, disabled && styles.disabled, style]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.brand.primary} size="small" />
        ) : (
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[styles.ghost, disabled && styles.disabled, style]}
      activeOpacity={0.7}
    >
      <Text style={[styles.ghostText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    ...shadows.glow,
  },
  gradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: fontSizes.body,
    fontFamily: fontFamilies.bodySemiBold,
    letterSpacing: 0.5,
  },
  outlineContainer: {
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: colors.brand.primary,
    fontSize: fontSizes.body,
    fontFamily: fontFamilies.bodySemiBold,
    letterSpacing: 0.5,
  },
  ghost: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.text.secondary,
    fontSize: fontSizes.caption,
    fontFamily: fontFamilies.body,
  },
  disabled: {
    opacity: 0.4,
  },
});
