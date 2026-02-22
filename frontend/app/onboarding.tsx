import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrbVisualizer } from '../src/components/visual/OrbVisualizer';
import { PrimaryButton } from '../src/components/ui/PrimaryButton';
import { colors, fontFamilies, fontSizes, spacing } from '../src/design/tokens';
import { ONBOARDING_KEY } from './index';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    id: 0,
    title: 'Your music,\nanywhere.',
    subtitle: 'Stream whatever you\'re playing on your phone to any Sonos speaker on your network.',
    cta: 'Next',
  },
  {
    id: 1,
    title: 'Simple by\ndesign.',
    subtitle: 'We\'ll ask for local network access to find your speakers. That\'s all we need.',
    cta: 'Find Speakers',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];

  const handleCTA = async () => {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/discovery');
    }
  };

  return (
    <LinearGradient colors={['#00001A', '#000033', '#13294B']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Logo */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.logoRow}>
            <Text style={styles.logo}>ORBCAST</Text>
          </Animated.View>

          {/* Orb */}
          <Animated.View entering={FadeIn.delay(200).duration(800)} style={styles.orbContainer}>
            <OrbVisualizer energy={0.4} bass={0.3} presence={0.3} volume={0.5} size={W * 0.6} isActive />
          </Animated.View>

          {/* Slide content */}
          <Animated.View key={slide} entering={FadeInDown.duration(400)} style={styles.content}>
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>
          </Animated.View>

          {/* Pagination dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
            ))}
          </View>

          {/* CTA */}
          <View style={styles.ctaContainer}>
            <PrimaryButton
              testID={`onboarding-cta-${slide}`}
              title={current.cta}
              onPress={handleCTA}
              style={styles.ctaButton}
            />
            {slide > 0 && (
              <TouchableOpacity
                testID="onboarding-skip"
                onPress={() => router.replace('/casting')}
                style={styles.skipBtn}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.screenPadding },
  logoRow: { paddingTop: 20, marginBottom: 8 },
  logo: {
    color: colors.brand.primary,
    fontSize: fontSizes.small,
    fontFamily: fontFamilies.heading,
    letterSpacing: 6,
  },
  orbContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', maxHeight: 260 },
  content: { marginBottom: spacing.xl, alignItems: 'center', paddingHorizontal: 8 },
  title: {
    color: colors.text.primary,
    fontSize: fontSizes.h1,
    fontFamily: fontFamilies.headingXB,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSizes.body,
    fontFamily: fontFamilies.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: spacing.xl },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.tertiary,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.brand.primary,
  },
  ctaContainer: { width: '100%', paddingBottom: spacing.xxxl },
  ctaButton: { width: '100%' },
  skipBtn: { marginTop: 16, alignItems: 'center' },
  skipText: {
    color: colors.text.tertiary,
    fontSize: fontSizes.caption,
    fontFamily: fontFamilies.body,
  },
});
