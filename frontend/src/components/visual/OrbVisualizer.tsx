import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  RadialGradient,
  Stop,
  Defs,
  Ellipse,
  G,
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface OrbVisualizerProps {
  energy?: number;    // 0..1
  bass?: number;      // 0..1
  presence?: number;  // 0..1
  volume?: number;    // 0..1
  size?: number;
  isActive?: boolean;
}

// Particle positions
const PARTICLES = [
  { angle: 0,   dist: 1.5, size: 3 },
  { angle: 45,  dist: 1.6, size: 2 },
  { angle: 90,  dist: 1.55, size: 3.5 },
  { angle: 135, dist: 1.7, size: 2 },
  { angle: 180, dist: 1.5, size: 3 },
  { angle: 225, dist: 1.65, size: 2.5 },
  { angle: 270, dist: 1.6, size: 3 },
  { angle: 315, dist: 1.55, size: 2 },
];

export function OrbVisualizer({
  energy = 0.5,
  bass = 0.3,
  presence = 0.3,
  volume = 0.5,
  size = 280,
  isActive = true,
}: OrbVisualizerProps) {
  const pulseScale = useSharedValue(1);
  const energyVal = useSharedValue(energy);
  const bassVal = useSharedValue(bass);
  const particleOpacity = useSharedValue(0.3);

  const center = size / 2;
  const baseRadius = size * 0.28;

  useEffect(() => {
    if (!isActive) return;
    pulseScale.value = withRepeat(
      withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    particleOpacity.value = withRepeat(
      withTiming(0.7, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [isActive]);

  useEffect(() => {
    energyVal.value = withSpring(energy, { damping: 8, stiffness: 60 });
    bassVal.value = withSpring(bass, { damping: 6, stiffness: 80 });
  }, [energy, bass]);

  const shellProps = useAnimatedProps(() => ({
    r: baseRadius * (pulseScale.value + energyVal.value * 0.22),
  }));

  const coreProps = useAnimatedProps(() => ({
    r: baseRadius * 0.42 * (1 + bassVal.value * 0.35) * pulseScale.value,
  }));

  const haloProps = useAnimatedProps(() => ({
    r: baseRadius * (1.45 + energyVal.value * 0.35) * pulseScale.value,
  }));

  const particleProps = useAnimatedProps(() => ({
    opacity: particleOpacity.value * (0.3 + energyVal.value * 0.7),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Outer halo */}
          <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
            <Stop offset="65%" stopColor="#FF5F05" stopOpacity="0" />
            <Stop offset="100%" stopColor="#FF5F05" stopOpacity="0.2" />
          </RadialGradient>

          {/* Orb body */}
          <RadialGradient id="orb" cx="38%" cy="32%" r="75%">
            <Stop offset="0%" stopColor="#5577FF" stopOpacity="0.95" />
            <Stop offset="45%" stopColor="#1133BB" stopOpacity="1" />
            <Stop offset="80%" stopColor="#001066" stopOpacity="1" />
            <Stop offset="100%" stopColor="#000022" stopOpacity="1" />
          </RadialGradient>

          {/* Core glow */}
          <RadialGradient id="core" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFB070" stopOpacity="1" />
            <Stop offset="40%" stopColor="#FF5F05" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FF5F05" stopOpacity="0" />
          </RadialGradient>

          {/* Specular highlight */}
          <RadialGradient id="spec" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Halo ring */}
        <AnimatedCircle cx={center} cy={center} fill="url(#halo)" animatedProps={haloProps} />

        {/* Orb shell */}
        <AnimatedCircle cx={center} cy={center} fill="url(#orb)" animatedProps={shellProps} />

        {/* Core glow */}
        <AnimatedCircle cx={center} cy={center} fill="url(#core)" animatedProps={coreProps} />

        {/* Specular highlight */}
        <Ellipse
          cx={center - baseRadius * 0.18}
          cy={center - baseRadius * 0.22}
          rx={baseRadius * 0.28}
          ry={baseRadius * 0.18}
          fill="url(#spec)"
        />

        {/* Particle halo */}
        <AnimatedG animatedProps={particleProps}>
          {PARTICLES.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const px = center + Math.cos(rad) * baseRadius * p.dist;
            const py = center + Math.sin(rad) * baseRadius * p.dist;
            return (
              <Circle
                key={i}
                cx={px}
                cy={py}
                r={p.size}
                fill="#FF5F05"
                opacity={0.6}
              />
            );
          })}
        </AnimatedG>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
