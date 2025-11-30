/**
 * MaquisPro+ - Tableau de Bord Propriétaire
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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useBar } from '../../contexts/BarContext';
import { supabase } from '../../services/supabase';
import { Header, StatCard, Card, Button } from '../../components';
import { Colors, FontSizes, FontWeights, Spacing, Layout } from '../../utils/theme';
import { DashboardStats } from '../../types';

export const OwnerDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentBar, bars, selectBar } = useBar();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    netProfit: 0,
    lowStockCount: 0,
    creditAmount: 0,
    ordersToday: 0,
    ordersPending: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showBarSelector, setShowBarSelector] = useState(false);

  useEffect(() => {
    if (currentBar) {
      loadDashboardStats();
    }
  }, [currentBar]);

  const loadDashboardStats = async () => {
    if (!currentBar) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Charger les commandes du jour
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('bar_id', currentBar.id)
        .gte('created_at', today.toISOString());

      if (ordersError) throw ordersError;

      // Calculer les statistiques
      const totalSales = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      
      const netProfit = orders?.reduce((sum, order) => {
        const orderProfit = order.order_items?.reduce((itemSum: number, item: any) => {
          return itemSum + ((item.unit_price - item.unit_cost) * item.quantity);
        }, 0) || 0;
        return sum + orderProfit;
      }, 0) || 0;

      const creditAmount = orders?.reduce((sum, order) => sum + order.credit_amount, 0) || 0;
      const ordersPending = orders?.filter(o => o.status === 'pending').length || 0;

      // Charger les produits en stock faible
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('bar_id', currentBar.id)
        .eq('is_active', true);

      if (productsError) throw productsError;

      const lowStockCount = products?.filter(
        p => p.stock_quantity <= p.low_stock_threshold
      ).length || 0;

      setStats({
        totalSales,
        netProfit,
        lowStockCount,
        creditAmount,
        ordersToday: orders?.length || 0,
        ordersPending,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const handleSignOut = () => {
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

  if (!currentBar) {
    return (
      <View style={styles.container}>
        <Header title="MaquisPro+" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun établissement</Text>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore créé d'établissement. Créez-en un pour commencer.
          </Text>
          <Button
            title="Créer mon premier bar"
            onPress={() => {/* Navigation vers création */}}
            style={styles.createButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={currentBar.name}
        subtitle={`Propriétaire • ${user?.full_name || user?.email}`}
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
        {/* Sélecteur de bar */}
        {bars.length > 1 && (
          <Card style={styles.barSelector}>
            <TouchableOpacity onPress={() => setShowBarSelector(!showBarSelector)}>
              <View style={styles.barSelectorHeader}>
                <Text style={styles.barSelectorTitle}>Établissement actuel</Text>
                <Text style={styles.barSelectorIcon}>{showBarSelector ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>
            {showBarSelector && (
              <View style={styles.barList}>
                {bars.map((bar) => (
                  <TouchableOpacity
                    key={bar.id}
                    style={[
                      styles.barItem,
                      bar.id === currentBar.id && styles.barItemActive,
                    ]}
                    onPress={() => {
                      selectBar(bar.id);
                      setShowBarSelector(false);
                    }}
                  >
                    <Text style={styles.barItemText}>{bar.name}</Text>
                    {bar.id === currentBar.id && (
                      <Text style={styles.barItemCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Statistiques principales */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Ventes du jour"
            value={formatCurrency(stats.totalSales)}
            icon="💰"
            color={Colors.primary}
          />
          <StatCard
            title="Bénéfice Net"
            value={formatCurrency(stats.netProfit)}
            icon="📈"
            color={Colors.secondary}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Stock Faible"
            value={stats.lowStockCount}
            icon="📦"
            color={stats.lowStockCount > 0 ? Colors.warning : Colors.success}
            subtitle={stats.lowStockCount > 0 ? 'Articles à réapprovisionner' : 'Tout va bien'}
          />
          <StatCard
            title="Crédits Clients"
            value={formatCurrency(stats.creditAmount)}
            icon="💳"
            color={Colors.error}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Commandes du jour"
            value={stats.ordersToday}
            icon="📋"
            color={Colors.info}
          />
          <StatCard
            title="En attente"
            value={stats.ordersPending}
            icon="⏱️"
            color={Colors.warning}
          />
        </View>

        {/* Menu de gestion */}
        <Card style={styles.menuCard}>
          <Text style={styles.menuTitle}>Gestion</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🏢</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Gérer mes bars</Text>
              <Text style={styles.menuItemSubtitle}>Créer, modifier, code d'invitation</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👥</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Employés</Text>
              <Text style={styles.menuItemSubtitle}>Gérer les rôles et accès</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🍺</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Produits & Inventaire</Text>
              <Text style={styles.menuItemSubtitle}>Articles, prix, stock</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>💳</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Paiements Mobile Money</Text>
              <Text style={styles.menuItemSubtitle}>QR codes, comptes</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📊</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Rapports & Analyses</Text>
              <Text style={styles.menuItemSubtitle}>Ventes, marges, tendances</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Code d'invitation */}
        <Card style={styles.invitationCard}>
          <Text style={styles.invitationTitle}>Code d'invitation</Text>
          <View style={styles.invitationCodeContainer}>
            <Text style={styles.invitationCode}>{currentBar.invitation_code}</Text>
          </View>
          <Text style={styles.invitationText}>
            Partagez ce code avec vos employés pour qu'ils rejoignent votre établissement
          </Text>
        </Card>
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
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  createButton: {
    minWidth: 200,
  },
  logoutText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  barSelector: {
    margin: Spacing.md,
  },
  barSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barSelectorTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  barSelectorIcon: {
    fontSize: FontSizes.md,
    color: Colors.primary,
  },
  barList: {
    marginTop: Spacing.md,
  },
  barItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  barItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  barItemText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  barItemCheck: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  menuCard: {
    margin: Spacing.md,
  },
  menuTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    fontSize: FontSizes.xxl,
    marginRight: Spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
  },
  menuArrow: {
    fontSize: FontSizes.xl,
    color: Colors.textLight,
  },
  invitationCard: {
    margin: Spacing.md,
    marginBottom: Spacing.xl,
  },
  invitationTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  invitationCodeContainer: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  invitationCode: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    letterSpacing: 4,
  },
  invitationText: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default OwnerDashboardScreen;
