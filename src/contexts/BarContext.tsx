/**
 * MaquisPro+ - Contexte de Gestion des Bars
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Bar, BarContextType } from '../types';
import { useAuth } from './AuthContext';

const BarContext = createContext<BarContextType | undefined>(undefined);

const CURRENT_BAR_KEY = '@maquispro_current_bar';

export const BarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentBar, setCurrentBar] = useState<Bar | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBars();
    } else {
      setBars([]);
      setCurrentBar(null);
      setLoading(false);
    }
  }, [user]);

  const loadBars = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les bars dont l'utilisateur est propriétaire
      const { data: ownedBars, error: ownedError } = await supabase
        .from('bars')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;

      // Charger les bars dont l'utilisateur est membre
      const { data: memberBars, error: memberError } = await supabase
        .from('bar_members')
        .select('bars(*)')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (memberError) throw memberError;

      // Combiner les résultats
      const allBars = [
        ...(ownedBars || []),
        ...(memberBars?.map((m: any) => m.bars).filter(Boolean) || []),
      ];

      // Supprimer les doublons
      const uniqueBars = Array.from(
        new Map(allBars.map((bar) => [bar.id, bar])).values()
      );

      setBars(uniqueBars);

      // Restaurer le bar sélectionné ou sélectionner le premier
      const savedBarId = await AsyncStorage.getItem(CURRENT_BAR_KEY);
      if (savedBarId && uniqueBars.find((b) => b.id === savedBarId)) {
        const savedBar = uniqueBars.find((b) => b.id === savedBarId);
        setCurrentBar(savedBar || null);
      } else if (uniqueBars.length > 0) {
        setCurrentBar(uniqueBars[0]);
        await AsyncStorage.setItem(CURRENT_BAR_KEY, uniqueBars[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bars:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectBar = async (barId: string) => {
    const bar = bars.find((b) => b.id === barId);
    if (bar) {
      setCurrentBar(bar);
      await AsyncStorage.setItem(CURRENT_BAR_KEY, barId);
    }
  };

  const createBar = async (barData: Partial<Bar>): Promise<Bar> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      // Générer un code d'invitation unique
      const invitationCode = await generateInvitationCode();

      const { data, error } = await supabase
        .from('bars')
        .insert({
          owner_id: user.id,
          invitation_code: invitationCode,
          ...barData,
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter le propriétaire comme membre
      await supabase.from('bar_members').insert({
        bar_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

      await loadBars();
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la création du bar');
    }
  };

  const updateBar = async (barId: string, updates: Partial<Bar>) => {
    try {
      const { error } = await supabase
        .from('bars')
        .update(updates)
        .eq('id', barId);

      if (error) throw error;

      await loadBars();
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour du bar');
    }
  };

  const refreshBars = async () => {
    await loadBars();
  };

  const generateInvitationCode = async (): Promise<string> => {
    // Générer un code de 8 caractères
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Vérifier si le code existe déjà
    const { data } = await supabase
      .from('bars')
      .select('id')
      .eq('invitation_code', code)
      .single();

    // Si le code existe, générer un nouveau
    if (data) {
      return generateInvitationCode();
    }

    return code;
  };

  const value: BarContextType = {
    currentBar,
    bars,
    loading,
    selectBar,
    createBar,
    updateBar,
    refreshBars,
  };

  return <BarContext.Provider value={value}>{children}</BarContext.Provider>;
};

export const useBar = () => {
  const context = useContext(BarContext);
  if (context === undefined) {
    throw new Error('useBar doit être utilisé dans un BarProvider');
  }
  return context;
};
