/**
 * MaquisPro+ - Composant StatCard
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Colors, FontSizes, FontWeights, Spacing } from '../utils/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = Colors.primary,
  subtitle,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    margin: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: FontSizes.xl,
    marginRight: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    fontWeight: FontWeights.medium,
  },
  value: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
});

export default StatCard;
