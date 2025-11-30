/**
 * MaquisPro+ - Tableau de Bord Serveur
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
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useBar } from '../../contexts/BarContext';
import { supabase } from '../../services/supabase';
import { Header, Card, Button } from '../../components';
import { Colors, FontSizes, FontWeights, Spacing, Layout, Shadows } from '../../utils/theme';
import { Order, PaymentMethod } from '../../types';

export const WaiterDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { currentBar } = useBar();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (currentBar && user) {
      loadWaiterData();
    }
  }, [currentBar, user]);

  const loadWaiterData = async () => {
    if (!currentBar || !user) return;

    try {
      // Charger mes commandes assignées
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*, product:product_id(*))')
        .eq('bar_id', currentBar.id)
        .eq('assigned_to', user.id)
        .in('status', ['pending', 'preparing', 'ready', 'served'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setMyOrders(orders || []);

      // Charger les méthodes de paiement
      const { data: methods, error: methodsError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('bar_id', currentBar.id)
        .eq('is_active', true);

      if (methodsError) throw methodsError;

      setPaymentMethods(methods || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWaiterData();
    setRefreshing(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      await loadWaiterData();
      Alert.alert('Succès', 'Statut de la commande mis à jour');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert(
      'Accepter la commande',
      'Confirmez-vous la prise en charge de cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: () => handleUpdateOrderStatus(orderId, 'preparing'),
        },
      ]
    );
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
      default:
        return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'served';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'Accepter';
      case 'preparing':
        return 'Marquer prête';
      case 'ready':
        return 'Marquer servie';
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const nextStatus = getNextStatus(item.status);
    const nextStatusLabel = getNextStatusLabel(item.status);

    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderTable}>Table {item.table_number || 'N/A'}</Text>
            <Text style={styles.orderCustomer}>{item.customer_name || 'Client'}</Text>
          </View>
          <View style={[styles.orderStatus, { backgroundColor: getOrderStatusColor(item.status) }]}>
            <Text style={styles.orderStatusText}>{getOrderStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {item.order_items?.map((orderItem: any) => (
            <View key={orderItem.id} style={styles.orderItemRow}>
              <Text style={styles.orderItemQuantity}>{orderItem.quantity}x</Text>
              <Text style={styles.orderItemName}>{orderItem.product_name}</Text>
              <Text style={styles.orderItemPrice}>
                {formatCurrency(orderItem.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>Total: {formatCurrency(item.total)}</Text>
          <Text style={styles.orderTime}>
            {new Date(item.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.orderActions}>
          {nextStatus && nextStatusLabel && (
            <Button
              title={nextStatusLabel}
              onPress={() => {
                if (item.status === 'pending') {
                  handleAcceptOrder(item.id);
                } else {
                  handleUpdateOrderStatus(item.id, nextStatus);
                }
              }}
              size="small"
              style={styles.actionButton}
            />
          )}
          {item.status === 'served' && (
            <Button
              title="Voir paiements"
              onPress={() => {
                setSelectedOrder(item);
                setShowPaymentModal(true);
              }}
              variant="secondary"
              size="small"
              style={styles.actionButton}
            />
          )}
        </View>
      </Card>
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <Card key={method.id} style={styles.paymentMethodCard}>
      <Text style={styles.paymentMethodName}>{method.name}</Text>
      {method.qr_code_url && (
        <View style={styles.qrCodeContainer}>
          <Image
            source={{ uri: method.qr_code_url }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        </View>
      )}
      {method.account_number && (
        <View style={styles.accountInfo}>
          <Text style={styles.accountLabel}>Numéro:</Text>
          <Text style={styles.accountValue}>{method.account_number}</Text>
        </View>
      )}
      {method.account_name && (
        <View style={styles.accountInfo}>
          <Text style={styles.accountLabel}>Nom:</Text>
          <Text style={styles.accountValue}>{method.account_name}</Text>
        </View>
      )}
    </Card>
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

  const pendingOrders = myOrders.filter(o => o.status === 'pending');
  const activeOrders = myOrders.filter(o => ['preparing', 'ready', 'served'].includes(o.status));

  return (
    <View style={styles.container}>
      <Header
        title={currentBar.name}
        subtitle={`Serveur • ${user?.full_name || user?.email}`}
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
        {/* Résumé */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{pendingOrders.length}</Text>
            <Text style={styles.summaryLabel}>Nouvelles</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeOrders.length}</Text>
            <Text style={styles.summaryLabel}>En cours</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{myOrders.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </Card>
        </View>

        {/* Nouvelles commandes */}
        {pendingOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔔 Nouvelles commandes ({pendingOrders.length})
            </Text>
            <FlatList
              data={pendingOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Commandes actives */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📋 Mes commandes en cours ({activeOrders.length})
            </Text>
            <FlatList
              data={activeOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Aucune commande */}
        {myOrders.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>
              Aucune commande assignée pour le moment
            </Text>
          </Card>
        )}

        {/* Méthodes de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Méthodes de paiement</Text>
          <Button
            title="Voir les QR codes"
            onPress={() => setShowPaymentModal(true)}
            variant="outline"
          />
        </View>
      </ScrollView>

      {/* Modal des méthodes de paiement */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Méthodes de paiement</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {selectedOrder && (
                <Card style={styles.orderSummary}>
                  <Text style={styles.orderSummaryTitle}>Commande</Text>
                  <Text style={styles.orderSummaryTable}>
                    Table {selectedOrder.table_number}
                  </Text>
                  <Text style={styles.orderSummaryTotal}>
                    Total: {formatCurrency(selectedOrder.total)}
                  </Text>
                </Card>
              )}
              {paymentMethods.map(renderPaymentMethod)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  summaryValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  section: {
    margin: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  orderCard: {
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  orderTable: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  orderCustomer: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: 2,
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
  orderItems: {
    marginBottom: Spacing.md,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderItemQuantity: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
    width: 40,
  },
  orderItemName: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  orderItemPrice: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: Spacing.md,
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
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    margin: Spacing.md,
    padding: Spacing.xl,
  },
  emptyCardText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSizes.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  modalClose: {
    fontSize: FontSizes.xxl,
    color: Colors.textLight,
  },
  modalBody: {
    padding: Spacing.md,
  },
  orderSummary: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.primaryLight,
  },
  orderSummaryTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  orderSummaryTable: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  orderSummaryTotal: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  paymentMethodCard: {
    marginBottom: Spacing.md,
  },
  paymentMethodName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  accountLabel: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
  },
  accountValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
});

export default WaiterDashboardScreen;
