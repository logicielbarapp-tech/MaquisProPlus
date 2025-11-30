/**
 * MaquisPro+ - Composant Button
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Layout, Shadows } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...Shadows.small,
    };

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = Colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = Colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = Colors.primary;
        break;
      case 'danger':
        baseStyle.backgroundColor = Colors.error;
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.height = 36;
        baseStyle.paddingHorizontal = 12;
        break;
      case 'medium':
        baseStyle.height = Layout.buttonHeight;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.height = 56;
        baseStyle.paddingHorizontal = 24;
        break;
    }

    // Disabled style
    if (disabled || loading) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
    };

    // Variant text color
    switch (variant) {
      case 'outline':
        baseStyle.color = Colors.primary;
        break;
      default:
        baseStyle.color = Colors.white;
    }

    // Size text
    switch (size) {
      case 'small':
        baseStyle.fontSize = FontSizes.sm;
        break;
      case 'medium':
        baseStyle.fontSize = FontSizes.md;
        break;
      case 'large':
        baseStyle.fontSize = FontSizes.lg;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
  },
});

export default Button;
