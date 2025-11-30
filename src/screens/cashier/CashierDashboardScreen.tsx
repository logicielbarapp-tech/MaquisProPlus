/**
 * MaquisPro+ - Tableau de Bord Caissier/Barman
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useBar } from '../../contexts/BarContext';
import { supabase } from '../../services/supabase';
import { Header, StatCard, Card, Button } from '../../components';
import { Colors, FontSizes, FontWeights, Spacing, Layout } from '../../utils/theme';
import { CashRegister, Order, BarMember } from '../../types';

export const CashierDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentBar } = useBar();
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [waiters, setWaiters] = useState<BarMember[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    if (currentBar && user) {
      loadCashierData();
    }
  }, [currentBar, user]);

  const loadCashierData = async () => {
    if (!currentBar || !user) return;

    try {
      // Charger la caisse ouverte
      const { data: register, error: registerError } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('bar_id', currentBar.id)
        .eq('cashier_id', user.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .single();

      if (registerError && registerError.code !== 'PGRST116') {
        throw registerError;
      }

      setCurrentRegister(register || null);

      // Charger les commandes du jour
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*), assignee:assigned_to(full_name)')
        .eq('bar_id', currentBar.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setTodayOrders(orders || []);

      // Calculer les statistiques
      const totalSales = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalSales,
        totalOrders: orders?.length || 0,
        pendingOrders,
      });

      // Charger les serveurs
      const { data: members, error: membersError } = await supabase
        .from('bar_members')
        .select('*, profile:user_id(*)')
        .eq('bar_id', currentBar.id)
        .eq('role', 'waiter')
        .eq('is_active', true);

      if (membersError) throw membersError;

      setWaiters(members || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCashierData();
    setRefreshing(false);
  };

  const handleOpenRegister = () => {
    Alert.prompt(
      'Ouvrir la caisse',
      'Entrez le montant initial en caisse',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ouvrir',
          onPress: async (amount) => {
            if (!amount || isNaN(parseFloat(amount))) {
              Alert.alert('Erreur', 'Montant invalide');
              return;
            }

            try {
              const { data, error } = await supabase
                .from('cash_registers')
                .insert({
                  bar_id: currentBar?.id,
                  cashier_id: user?.id,
                  opening_amount: parseFloat(amount),
                  status: 'open',
                })
                .select()
                .single();

              if (error) throw error;

              setCurrentRegister(data);
              Alert.alert('Succès', 'Caisse ouverte avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleCloseRegister = () => {
    Alert.prompt(
      'Fermer la caisse',
      'Entrez le montant final en caisse',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Fermer',
          onPress: async (amount) => {
            if (!amount || isNaN(parseFloat(amount)) || !currentRegister) {
              Alert.alert('Erreur', 'Montant invalide');
              return;
            }

            try {
              const closingAmount = parseFloat(amount);
              const expectedAmount = currentRegister.opening_amount + stats.totalSales;
              const variance = closingAmount - expectedAmount;

              const { error } = await supabase
                .from('cash_registers')
                .update({
                  closing_amount: closingAmount,
                  expected_amount: expectedAmount,
                  variance,
                  status: 'closed',
                  closed_at: new Date().toISOString(),
                })
                .eq('id', currentRegister.id);

              if (error) throw error;

              Alert.alert(
                'Caisse fermée',
                `Écart: ${variance.toLocaleString('fr-FR')} FCFA\n${
                  variance > 0 ? 'Excédent' : variance < 0 ? 'Manquant' : 'Parfait'
                }`
              );

              setCurrentRegister(null);
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleSignOut = () => {
    if (currentRegister) {
      Alert.alert(
        'Caisse ouverte',
        'Vous devez fermer la caisse avant de vous déconnecter',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'preparing':
        return Colors.info;
      case 'ready':
        return Colors.secondary;
      case 'served':
        return Colors.primary;
      case 'paid':
        return Colors.success;
      default:
        return Colors.textLight;
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'preparing':
        return 'En préparation';
      case 'ready':
        return 'Prête';
      case 'served':
        return 'Servie';
      case 'paid':
        return 'Payée';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderTable}>Table {item.table_number || 'N/A'}</Text>
          <Text style={styles.orderCustomer}>{item.customer_name || 'Client'}</Text>
        </View>
        <View style={styles.orderStatusContainer}>
          <View style={[styles.orderStatus, { backgroundColor: getOrderStatusColor(item.status) }]}>
            <Text style={styles.orderStatusText}>{getOrderStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
        <Text style={styles.orderTime}>
          {new Date(item.created_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!currentBar) {
    return (
      <View style={styles.container}>
        <Header title="MaquisPro+" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun établissement sélectionné</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={currentBar.name}
        subtitle={`Caissier • ${user?.full_name || user?.email}`}
        rightComponent={
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statut de la caisse */}
        <Card style={styles.registerCard}>
          {currentRegister ? (
            <>
              <View style={styles.registerHeader}>
                <Text style={styles.registerTitle}>🟢 Caisse Ouverte</Text>
                <Text style={styles.registerTime}>
                  Depuis {new Date(currentRegister.opened_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.registerInfo}>
                <Text style={styles.registerLabel}>Montant initial:</Text>
                <Text style={styles.registerValue}>
                  {formatCurrency(currentRegister.opening_amount)}
                </Text>
              </View>
              <Button
                title="Fermer la caisse"
                onPress={handleCloseRegister}
                variant="danger"
                style={styles.registerButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.registerTitle}>🔴 Caisse Fermée</Text>
              <Text style={styles.registerText}>
                Ouvrez la caisse pour commencer à prendre des commandes
              </Text>
              <Button
                title="Ouvrir la caisse"
                onPress={handleOpenRegister}
                style={styles.registerButton}
              />
            </>
          )}
        </Card>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Ventes du jour"
            value={formatCurrency(stats.totalSales)}
            icon="💰"
            color={Colors.primary}
          />
          <StatCard
            title="Commandes"
            value={stats.totalOrders}
            icon="📋"
            color={Colors.info}
          />
        </View>

        {/* Actions rapides */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Actions rapides</Text>
          <Button
            title="➕ Nouvelle commande"
            onPress={() => {/* Navigation */}}
            disabled={!currentRegister}
            style={styles.actionButton}
          />
          <Button
            title="👥 Superviser les serveurs"
            onPress={() => {/* Navigation */}}
            variant="outline"
            style={styles.actionButton}
          />
        </Card>

        {/* Liste des commandes */}
        <View style={styles.ordersSection}>
          <Text style={styles.ordersTitle}>
            Commandes du jour ({todayOrders.length})
          </Text>
          {todayOrders.length > 0 ? (
            <FlatList
              data={todayOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Card>
              <Text style={styles.emptyOrdersText}>Aucune commande pour le moment</Text>
            </Card>
          )}
        </View>

        {/* Liste des serveurs */}
        <View style={styles.waitersSection}>
          <Text style={styles.waitersTitle}>Serveurs actifs ({waiters.length})</Text>
          {waiters.map((waiter) => (
            <Card key={waiter.id} style={styles.waiterCard}>
              <View style={styles.waiterInfo}>
                <Text style={styles.waiterName}>
                  {waiter.profile?.full_name || waiter.profile?.email}
                </Text>
                <Text style={styles.waiterStatus}>🟢 Actif</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.screenPadding,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  registerCard: {
    margin: Spacing.md,
  },
  registerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  registerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  registerTime: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  registerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  registerLabel: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
  },
  registerValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  registerText: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    marginVertical: Spacing.md,
  },
  registerButton: {
    marginTop: Spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actionsCard: {
    margin: Spacing.md,
  },
  actionsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  ordersSection: {
    margin: Spacing.md,
  },
  ordersTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  orderTable: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  orderCustomer: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  orderStatusContainer: {
    alignItems: 'flex-end',
  },
  orderStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  orderStatusText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: FontWeights.semibold,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  orderTime: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  emptyOrdersText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSizes.md,
  },
  waitersSection: {
    margin: Spacing.md,
    marginBottom: Spacing.xl,
  },
  waitersTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  waiterCard: {
    marginBottom: Spacing.sm,
  },
  waiterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waiterName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  waiterStatus: {
    fontSize: FontSizes.sm,
    color: Colors.success,
  },
});

export default CashierDashboardScreen;
