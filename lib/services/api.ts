const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Product types
export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: "APPAREL" | "EQUIPMENT" | "ACCESSORY";
  image_url: string;
  tech_stats: {
    weight?: string;
    drag_coefficient?: string;
    temperature?: string;
    occasion?: string;
    fit?: string;
  };
  featured: boolean;
}

interface ProductsResponse {
  products: Product[];
}

interface ProductResponse {
  product: Product;
}

interface LoginResponse {
  message: string;
  userId: number;
  email: string;
}

interface RegisterResponse {
  message: string;
  userId: number;
  email: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total_price: number;
  shipping_address: ShippingAddress;
  is_paid: boolean;
  status: string;
  created_at: string;
}

interface OrdersResponse {
  orders: Order[];
}

interface ReturnResponse {
  message: string;
  orderId: string;
  status: string;
}

interface ApiError {
  error: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as ApiError).error || "An error occurred");
  }
  return data as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<LoginResponse>(response);
}

export async function register(email: string, password: string): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<RegisterResponse>(response);
}

export async function getMyOrders(): Promise<OrdersResponse> {
  const response = await fetch(`${API_BASE}/api/my-orders`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse<OrdersResponse>(response);
}

export async function requestReturn(orderId: string): Promise<ReturnResponse> {
  const response = await fetch(`${API_BASE}/api/return/${orderId}`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse<ReturnResponse>(response);
}

export async function checkout(
  items: OrderItem[],
  total_price: number,
  shipping_address: ShippingAddress
): Promise<{ message: string; orderId: string; status: string }> {
  const response = await fetch(`${API_BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items, total_price, shipping_address }),
  });
  return handleResponse(response);
}

// Smart Checkout - Handles authenticated, new account, and guest checkout
export interface SmartCheckoutResponse {
  message: string;
  orderId: string;
  status: string;
  isNewAccount: boolean;
  isGuest: boolean;
  userId?: number;
  email?: string;
}

export async function smartCheckout(
  items: OrderItem[],
  total_price: number,
  shipping_address: ShippingAddress,
  password?: string
): Promise<SmartCheckoutResponse> {
  const response = await fetch(`${API_BASE}/api/smart-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ items, total_price, shipping_address, password }),
  });
  return handleResponse<SmartCheckoutResponse>(response);
}

// Profile API
export interface ProfileResponse {
  userId: number;
  email: string;
  name: string | null;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE}/api/profile`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse<ProfileResponse>(response);
}

export async function updateProfile(
  name: string,
  shippingAddress: ShippingAddress
): Promise<{ message: string; name: string; shippingAddress: ShippingAddress }> {
  const response = await fetch(`${API_BASE}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, shippingAddress }),
  });
  return handleResponse(response);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/api/profile/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(response);
}

// Products API
export async function getProducts(): Promise<ProductsResponse> {
  const response = await fetch(`${API_BASE}/api/products`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse<ProductsResponse>(response);
}

export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  const response = await fetch(`${API_BASE}/api/products/${slug}`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse<ProductResponse>(response);
}
