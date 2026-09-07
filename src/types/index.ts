export type Role = 'admin' | 'manager' | 'cashier' | 'waiter';

export interface Employee {
  id: string;
  name: string;
  username: string;
  pin: string; // 4-digit PIN for fast authorization
  role: Role;
  active: boolean;
  phone?: string;
  createdAt: string;
}

export type ProductCategory = 
  | 'Bebidas e Refrigerantes'
  | 'Cervejas'
  | 'Vinhos e Destilados'
  | 'Petiscos e Porções'
  | 'Pratos e Refeições'
  | 'Lanches e Sanduíches'
  | 'Cafetaria'
  | 'Sobremesas';

export type UnitType = 'un' | 'dose' | 'lata' | 'garrafa' | 'kg' | 'prato';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory | string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: UnitType | string;
  active: boolean;
  image?: string;
}

export type MovementType = 'entrada' | 'saida_ajuste' | 'quebra_perda' | 'venda';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  reason: string;
  employeeName: string;
  cost?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  total: number;
  notes?: string;
}

export type PaymentMethod = 'dinheiro' | 'cartao_tpa' | 'transferencia_pix' | 'fiado';

export interface Sale {
  id: string;
  receiptNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: number;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  costTotal: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  customerName?: string;
  tableOrOrder?: string;
  status: 'completed' | 'cancelled';
}

export interface CashDrop {
  id: string;
  amount: number;
  type: 'sangria' | 'suprimento';
  reason: string;
  time: string;
  employeeName: string;
}

export interface Shift {
  id: string;
  shiftNumber: number;
  employeeId: string;
  employeeName: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  status: 'open' | 'closed';
  openingCash: number;
  closingCashReported?: number;
  closingCashExpected?: number;
  cashDifference?: number;
  totalSales: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  salesCount: number;
  notes?: string;
  cashDrops: CashDrop[];
}

export interface StoreSettings {
  storeName: string;
  nif: string;
  address: string;
  phone: string;
  receiptFooter: string;
  currency: string;
  currencySymbol: string;
  taxPercentage: number;
}
