/**
 * MaquisPro+ - Composant Input
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors, FontSizes, BorderRadius, Spacing, Layout } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
          ]}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Text style={styles.eyeText}>{isSecure ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: Layout.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: FontSizes.lg,
  },
});

export default Input;
