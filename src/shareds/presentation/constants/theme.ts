export const colors = {
  // Backgrounds
  background: '#0B1221', // Dark Navy background (like the screenshot)
  card: '#161F33', // Slightly lighter for cards
  cardHover: '#1F2A44',
  
  // Accents
  primary: '#00B873', // Green for active tabs, favorite chips
  primaryDark: '#008C56',
  accent: '#FFD700', // Gold/Yellow for points
  
  // Typography
  text: '#FFFFFF', // Pure white for primary text
  textMuted: '#A0AEC0', // Light grey for secondary text (subtitles, unselected tabs)
  
  // Borders
  border: '#2D3748',
  
  // States
  success: '#10B981',
  error: '#EF4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, color: colors.text },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textMuted },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
};
