/**
 * MaquisPro+ - Composant Card
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, noPadding = false }) => {
  return (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;
