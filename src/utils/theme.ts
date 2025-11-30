/**
 * MaquisPro+ - Thème et Constantes de Style
 * Version 1.0.1
 */

export const Colors = {
  // Palette principale
  primary: '#19386A',      // Bleu Profond
  secondary: '#5CB85C',    // Vert Vif
  white: '#FFFFFF',        // Blanc Pur
  
  // Couleurs complémentaires
  background: '#F5F5F5',   // Gris très clair pour les fonds
  text: '#333333',         // Texte principal
  textLight: '#666666',    // Texte secondaire
  border: '#E0E0E0',       // Bordures
  error: '#D9534F',        // Erreur
  warning: '#F0AD4E',      // Avertissement
  info: '#5BC0DE',         // Information
  success: '#5CB85C',      // Succès (même que secondary)
  
  // États
  disabled: '#CCCCCC',
  placeholder: '#999999',
  
  // Transparences
  overlay: 'rgba(0, 0, 0, 0.5)',
  primaryLight: 'rgba(25, 56, 106, 0.1)',
  secondaryLight: 'rgba(92, 184, 92, 0.1)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const Layout = {
  screenPadding: Spacing.md,
  cardPadding: Spacing.md,
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 60,
  tabBarHeight: 60,
};

export default {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Shadows,
  Layout,
};
