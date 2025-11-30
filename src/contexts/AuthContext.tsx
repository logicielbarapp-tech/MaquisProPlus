/**
 * MaquisPro+ - Contexte d'Authentification
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Profile, UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de connexion');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName?: string
  ) => {
    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role,
        });

      if (profileError) throw profileError;

      await loadUserProfile(authData.user.id);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  };

  const signUpWithInvitation = async (
    email: string,
    password: string,
    invitationCode: string,
    fullName?: string
  ) => {
    try {
      // Vérifier le code d'invitation
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('id, owner_id')
        .eq('invitation_code', invitationCode.toUpperCase())
        .single();

      if (barError || !barData) {
        throw new Error('Code d\'invitation invalide');
      }

      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // Créer le profil avec rôle par défaut 'waiter'
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          role: 'waiter',
        });

      if (profileError) throw profileError;

      // Ajouter l'utilisateur au bar
      const { error: memberError } = await supabase
        .from('bar_members')
        .insert({
          bar_id: barData.id,
          user_id: authData.user.id,
          role: 'waiter',
        });

      if (memberError) throw memberError;

      await loadUserProfile(authData.user.id);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de l\'inscription avec invitation');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la déconnexion');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signUpWithInvitation,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
