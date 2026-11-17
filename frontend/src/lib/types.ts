export type Role = 'USER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export type QuoteStatus = 'NEW' | 'REVIEWED' | 'QUOTED' | 'CONVERTED' | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string | null;
  city: string | null;
  role: Role;
  createdAt: string;
}

export interface AdminUserRow extends User {
  _count: {
    orders: number;
    oemQuotes: number;
  };
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  materialSpec: string;
  dimensions: string;
  moq: number;
  priceINR: number;
  samplePriceINR: number;
  stock: number;
  imageUrl: string;
  galleryUrls: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceINR: number;
  lineTotalINR: number;
  product: {
    id: string;
    name: string;
    sku: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotalINR: number;
  gstINR: number;
  grandTotalINR: number;
  shippingAddress: string;
  city: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    businessName: string | null;
  };
}

export interface OemQuote {
  id: string;
  quoteNumber: string;
  name: string;
  email: string;
  phone: string;
  businessName: string | null;
  productType: string;
  materialMicron: string;
  customSize: string;
  quantity: number;
  logoPrinting: boolean;
  notes: string | null;
  status: QuoteStatus;
  createdAt: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  imageUrl: string;
  priceINR: number;
}

export interface CategoryRevenue {
  category: string;
  revenueINR: number;
  units: number;
}

export interface AdminStats {
  totalRevenueINR: number;
  totalGstINR: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  newOemQuotes: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByCategory: CategoryRevenue[];
  lowStockList: LowStockItem[];
}

export interface HealthResponse {
  success: boolean;
  service: string;
  environment: string;
  database: string;
  timestamp: string;
}
