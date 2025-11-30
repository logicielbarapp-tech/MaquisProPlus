/**
 * MaquisPro+ - Composant Header
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Layout } from '../utils/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightComponent,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent && <View style={styles.rightSection}>{rightComponent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Layout.headerHeight,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: FontSizes.xxl,
    color: Colors.white,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 2,
  },
  rightSection: {
    marginLeft: Spacing.sm,
  },
});

export default Header;
