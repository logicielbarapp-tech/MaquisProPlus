/**
 * MaquisPro+ - Types TypeScript
 * Version 1.0.1
 */

// ============================================
// Types d'utilisateurs et rôles
// ============================================
export type UserRole = 'owner' | 'cashier' | 'waiter';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Types de bars
// ============================================
export interface Bar {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  invitation_code: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BarMember {
  id: string;
  bar_id: string;
  user_id: string;
  role: UserRole;
  is_active: boolean;
  joined_at: string;
  profile?: Profile;
}

// ============================================
// Types de produits
// ============================================
export interface Category {
  id: string;
  bar_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ProductEquivalence {
  unit: string;
  quantity: number;
}

export interface Product {
  id: string;
  bar_id: string;
  category_id?: string;
  name: string;
  description?: string;
  sale_price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  unit: string;
  equivalence_info?: ProductEquivalence[];
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// ============================================
// Types de paiement
// ============================================
export type PaymentMethodType = 'mobile_money' | 'cash' | 'card';

export interface PaymentMethod {
  id: string;
  bar_id: string;
  name: string;
  type: PaymentMethodType;
  qr_code_url?: string;
  account_number?: string;
  account_name?: string;
  is_active: boolean;
  created_at: string;
}

// ============================================
// Types de caisse
// ============================================
export type CashRegisterStatus = 'open' | 'closed';

export interface CashRegister {
  id: string;
  bar_id: string;
  cashier_id: string;
  opening_amount: number;
  closing_amount?: number;
  expected_amount?: number;
  variance?: number;
  status: CashRegisterStatus;
  opened_at: string;
  closed_at?: string;
  notes?: string;
  cashier?: Profile;
}

// ============================================
// Types de commandes
// ============================================
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Order {
  id: string;
  bar_id: string;
  cash_register_id?: string;
  created_by: string;
  assigned_to?: string;
  table_number?: string;
  customer_name?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  subtotal: number;
  discount: number;
  total: number;
  paid_amount: number;
  credit_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  assignee?: Profile;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  subtotal: number;
  created_at: string;
  product?: Product;
}

// ============================================
// Types de mouvements d'inventaire
// ============================================
export type InventoryMovementType = 'in' | 'out' | 'adjustment';

export interface InventoryMovement {
  id: string;
  bar_id: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  reason?: string;
  reference_id?: string;
  created_by?: string;
  created_at: string;
  product?: Product;
  creator?: Profile;
}

// ============================================
// Types de navigation
// ============================================
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OwnerDashboard: undefined;
  CashierDashboard: undefined;
  WaiterDashboard: undefined;
  BarManagement: undefined;
  EmployeeManagement: undefined;
  ProductManagement: undefined;
  PaymentMethodManagement: undefined;
  CreateOrder: undefined;
  OrderDetails: { orderId: string };
  CashRegister: undefined;
};

// ============================================
// Types de contexte
// ============================================
export interface AuthContextType {
  user: Profile | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<void>;
  signUpWithInvitation: (email: string, password: string, invitationCode: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface BarContextType {
  currentBar: Bar | null;
  bars: Bar[];
  loading: boolean;
  selectBar: (barId: string) => void;
  createBar: (bar: Partial<Bar>) => Promise<Bar>;
  updateBar: (barId: string, updates: Partial<Bar>) => Promise<void>;
  refreshBars: () => Promise<void>;
}

// ============================================
// Types utilitaires
// ============================================
export interface DashboardStats {
  totalSales: number;
  netProfit: number;
  lowStockCount: number;
  creditAmount: number;
  ordersToday: number;
  ordersPending: number;
}

export interface CashRegisterSummary {
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  mobileMoneySales: number;
  cardSales: number;
  expectedAmount: number;
  variance: number;
}
