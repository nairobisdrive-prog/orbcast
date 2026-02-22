// OrbCast Design Tokens — Luxury / Futuristic Audio Device

export const colors = {
  bg: {
    primary: '#000033',
    secondary: '#13294B',
    card: 'rgba(19, 41, 75, 0.65)',
    deep: '#00001A',
  },
  brand: {
    primary: '#FF5F05',
    secondary: '#DD3403',
    highlight: '#FF8C42',
    glow: 'rgba(255, 95, 5, 0.35)',
  },
  text: {
    primary: '#E0E8FF',   // Off-white with blue tint
    secondary: '#8090B8',
    tertiary: '#4060A0',
    inverse: '#000033',
  },
  glass: {
    panel: 'rgba(19, 41, 75, 0.65)',
    panelLight: 'rgba(19, 41, 75, 0.45)',
    border: 'rgba(255, 255, 255, 0.12)',
    highlight: 'rgba(255, 255, 255, 0.06)',
    innerShadow: 'rgba(0, 0, 51, 0.4)',
  },
  status: {
    online: '#4ADE80',
    offline: '#4060A0',
    warning: '#FFC107',
    error: '#F44336',
    casting: '#FF5F05',
  },
  orb: {
    coreHot: '#FF8040',
    coreMid: '#FF5F05',
    shellLight: '#4466FF',
    shellDeep: '#0022AA',
    shellBase: '#000022',
    halo: 'rgba(255, 95, 5, 0.25)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  screenPadding: 20,
  cardPadding: 20,
  thumbZoneBottom: 100,
};

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  pill: 100,
};

export const fontFamilies = {
  heading: 'Syne_700Bold',
  headingXB: 'Syne_800ExtraBold',
  body: 'Manrope_400Regular',
  bodyMed: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  mono: 'SpaceMono_400Regular',
};

export const fontSizes = {
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body: 16,
  caption: 14,
  small: 12,
  micro: 10,
};

export const glass = {
  panel: {
    backgroundColor: 'rgba(19, 41, 75, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  blurIntensity: 20,
};

export const motion = {
  fast: 200,
  normal: 350,
  slow: 600,
  xSlow: 1200,
  spring: { damping: 15, stiffness: 120 },
  springBouncy: { damping: 10, stiffness: 100 },
};

export const shadows = {
  glow: {
    shadowColor: '#FF5F05',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  glowStrong: {
    shadowColor: '#FF5F05',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: '#000033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const gradients = {
  background: ['#000033', '#13294B'] as const,
  backgroundDeep: ['#00001A', '#000033', '#13294B'] as const,
  brand: ['#FF5F05', '#DD3403'] as const,
  brandReverse: ['#DD3403', '#FF5F05'] as const,
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] as const,
};
