/**
 * MaquisPro+ - Écran d'Inscription
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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Header } from '../components';
import { Colors, Spacing, Layout } from '../utils/theme';

interface RegisterScreenProps {
  navigation: any;
  route: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, route }) => {
  const { signUp, signUpWithInvitation } = useAuth();
  const isOwner = route.params?.type === 'owner';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!isOwner && !invitationCode) {
      Alert.alert('Erreur', 'Veuillez entrer le code d\'invitation');
      return;
    }

    try {
      setLoading(true);

      if (isOwner) {
        await signUp(email.trim(), password, 'owner', fullName.trim() || undefined);
        Alert.alert(
          'Compte créé',
          'Votre compte propriétaire a été créé avec succès. Vous pouvez maintenant créer votre bar.',
          [{ text: 'OK' }]
        );
      } else {
        await signUpWithInvitation(
          email.trim(),
          password,
          invitationCode.trim(),
          fullName.trim() || undefined
        );
        Alert.alert(
          'Compte créé',
          'Votre compte a été créé et vous avez rejoint l\'établissement avec succès.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur d\'inscription', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isOwner ? 'Créer un compte Propriétaire' : 'Rejoindre un établissement'}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Input
              label="Nom complet (optionnel)"
              placeholder="Jean Dupont"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Input
              label="Email *"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Mot de passe *"
              placeholder="Minimum 6 caractères"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="Confirmer le mot de passe *"
              placeholder="Retapez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {!isOwner && (
              <Input
                label="Code d'invitation *"
                placeholder="XXXXXXXX"
                value={invitationCode}
                onChangeText={setInvitationCode}
                autoCapitalize="characters"
                maxLength={8}
              />
            )}

            <Button
              title={isOwner ? 'Créer mon compte' : 'Rejoindre l\'établissement'}
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            {isOwner && (
              <Text style={styles.infoText}>
                En tant que propriétaire, vous pourrez créer et gérer vos établissements,
                inviter des employés et accéder à tous les rapports.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.screenPadding,
  },
  form: {
    marginTop: Spacing.md,
  },
  registerButton: {
    marginTop: Spacing.lg,
  },
  infoText: {
    marginTop: Spacing.md,
    color: Colors.textLight,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default RegisterScreen;
