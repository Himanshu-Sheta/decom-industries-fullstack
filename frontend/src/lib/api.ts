import type {
  AdminStats,
  AdminUserRow,
  HealthResponse,
  OemQuote,
  Order,
  OrderStatus,
  Product,
  QuoteStatus,
  Role,
  User,
} from './types';

// ============================================================
// THE BRIDGE: How our Frontend (localhost:3000) talks to our
// Express Backend API (localhost:4000/api)
// ============================================================
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  public readonly status: number;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

let isRefreshing = false;

/**
 * Core HTTP helper:
 * 1. Sends JSON to Express Backend
 * 2. Always includes `credentials: 'include'` so HttpOnly JWT cookies travel automatically!
 * 3. If Access Token expires (401), automatically calls POST /api/auth/refresh and retries once.
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // <-- CRITICAL: sends & receives HttpOnly auth cookies!
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  // Auto-refresh expired Access Token silently (except on auth endpoints themselves)
  if (
    res.status === 401 &&
    allowRetry &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/register') &&
    !path.startsWith('/auth/refresh') &&
    !isRefreshing
  ) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        return apiRequest<T>(path, options, false);
      }
    } catch {
      // Refresh failed; fall through to original 401 handling
    } finally {
      isRefreshing = false;
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.message || `Request failed (${res.status})`,
      res.status,
      data.errors
    );
  }

  return data as T;
}

// ============================================================
// 1. Auth API (/api/auth/*)
// ============================================================
export const authApi = {
  me: () => apiRequest<{ success: boolean; user: User }>('/auth/me'),

  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    businessName?: string;
    city?: string;
  }) =>
    apiRequest<{ success: boolean; message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<{ success: boolean; message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),

  updateProfile: (payload: {
    name?: string;
    phone?: string;
    businessName?: string | null;
    city?: string | null;
  }) =>
    apiRequest<{ success: boolean; message: string; user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

// ============================================================
// 2. Products API (/api/products/*)
// ============================================================
export const productsApi = {
  list: (params?: { category?: string; search?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') {
      query.set('category', params.category);
    }
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    const qs = query.toString();
    return apiRequest<{
      success: boolean;
      count: number;
      categories: string[];
      products: Product[];
    }>(`/products${qs ? `?${qs}` : ''}`);
  },

  adminListAll: () =>
    apiRequest<{ success: boolean; count: number; products: Product[] }>(
      '/products/admin/all'
    ),

  create: (payload: Omit<Product, 'id' | 'createdAt'>) =>
    apiRequest<{ success: boolean; message: string; product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<Omit<Product, 'id' | 'createdAt'>>) =>
    apiRequest<{ success: boolean; message: string; product: Product }>(
      `/products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),

  remove: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================
// 3. Orders API (/api/orders/*)
// ============================================================
export const ordersApi = {
  create: (payload: {
    items: { productId: string; quantity: number }[];
    shippingAddress: string;
    city: string;
    phone: string;
    notes?: string;
  }) =>
    apiRequest<{ success: boolean; message: string; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  mine: () =>
    apiRequest<{ success: boolean; count: number; orders: Order[] }>('/orders/mine'),

  adminListAll: (status?: OrderStatus) =>
    apiRequest<{ success: boolean; count: number; orders: Order[] }>(
      `/orders${status ? `?status=${status}` : ''}`
    ),

  updateStatus: (id: string, status: OrderStatus) =>
    apiRequest<{ success: boolean; message: string; order: Order }>(
      `/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),
};

// ============================================================
// 4. Custom OEM Quotes API (/api/oem-quotes/*)
// ============================================================
export const oemApi = {
  create: (payload: {
    name: string;
    email: string;
    phone: string;
    businessName?: string;
    productType: string;
    materialMicron: string;
    customSize: string;
    quantity: number;
    logoPrinting: boolean;
    notes?: string;
  }) =>
    apiRequest<{ success: boolean; message: string; quote: OemQuote }>('/oem-quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  mine: () =>
    apiRequest<{ success: boolean; count: number; quotes: OemQuote[] }>(
      '/oem-quotes/mine'
    ),

  adminListAll: () =>
    apiRequest<{ success: boolean; count: number; quotes: OemQuote[] }>('/oem-quotes'),

  updateStatus: (id: string, status: QuoteStatus) =>
    apiRequest<{ success: boolean; message: string; quote: OemQuote }>(
      `/oem-quotes/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  remove: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/oem-quotes/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================
// 5. Admin Dashboard & Health API (/api/admin/*, /api/health)
// ============================================================
export const adminApi = {
  health: () => apiRequest<HealthResponse>('/health'),

  stats: () =>
    apiRequest<{
      success: boolean;
      stats: AdminStats;
      recentOrders: Order[];
    }>('/admin/stats'),

  users: () =>
    apiRequest<{ success: boolean; count: number; users: AdminUserRow[] }>(
      '/admin/users'
    ),

  createUser: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    businessName?: string;
    city?: string;
    role: Role;
  }) =>
    apiRequest<{ success: boolean; message: string; user: AdminUserRow }>(
      '/admin/users',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  updateUser: (
    id: string,
    payload: {
      name?: string;
      phone?: string;
      businessName?: string | null;
      city?: string | null;
      role?: Role;
    }
  ) =>
    apiRequest<{ success: boolean; message: string; user: User }>(
      `/admin/users/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),

  updateUserRole: (id: string, role: Role) =>
    apiRequest<{ success: boolean; message: string; user: User }>(
      `/admin/users/${id}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }
    ),

  deleteUser: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};
