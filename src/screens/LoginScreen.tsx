/**
 * MaquisPro+ - Écran de Connexion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components';
import { Colors, FontSizes, FontWeights, Spacing, Layout } from '../utils/theme';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MaquisPro+</Text>
          </View>
          <Text style={styles.subtitle}>Gestion professionnelle de bar</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Créer un compte Propriétaire"
            onPress={() => navigation.navigate('Register', { type: 'owner' })}
            variant="outline"
            style={styles.registerButton}
          />

          <Button
            title="Rejoindre avec un code"
            onPress={() => navigation.navigate('Register', { type: 'employee' })}
            variant="secondary"
            style={styles.registerButton}
          />
        </View>

        <Text style={styles.version}>Version 1.0.1</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textLight,
    fontSize: FontSizes.sm,
  },
  registerButton: {
    marginTop: Spacing.sm,
  },
  version: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSizes.xs,
  },
});

export default LoginScreen;
