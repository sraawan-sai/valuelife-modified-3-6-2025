import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '../utils/localStorageService';

// In a real application, this would be a backend API endpoint
// This is just a mock implementation for demonstration purposes

// Define order interface
export interface Order {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Store orders in localStorage for demo purposes
//const ORDERS_STORAGE_KEY = 'value_life_orders';
const serverUrl = import.meta.env.VITE_SERVER_URL;
const API_BASE_URL = `${serverUrl}/api/db/orders`;


// Initialize orders if not exist
// const initializeOrders = () => {
//   if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
//     localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
//   }
// };

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return await response.json();
};

// Get user orders

export const getUserOrders = async (): Promise<Order[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not logged in');

  const response = await fetch(`${API_BASE_URL}?userId=${user.id}`);
  if (!response.ok) throw new Error('Failed to fetch user orders');
  return await response.json();
};

// Create a new order
export const createOrder = async (productId: string, amount: number): Promise<Order> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not logged in');

  const newOrder: Order = {
    id: uuidv4(),
    userId: user.id,
    productId,
    amount,
    currency: 'INR',
    status: 'created',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOrder)
  });

  if (!response.ok) throw new Error('Order creation failed');
  return await response.json();
};

// Update an order with Razorpay payment details
export const updateOrderWithPayment = async (
  orderId: string,
  razorpayPaymentId: string,
  status: 'paid' | 'failed'
): Promise<Order> => {
  const response = await fetch(`${API_BASE_URL}/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpayPaymentId,
      status,
      updatedAt: new Date().toISOString()
    })
  });

  if (!response.ok) throw new Error('Failed to update order');
  return await response.json();
};
// Get an order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const response = await fetch(`${API_BASE_URL}/${orderId}`);
  if (!response.ok) return null;
  return await response.json();
};


// Get an order by payment ID
export const getOrderByPaymentId = async (paymentId: string): Promise<Order | null> => {
  const response = await fetch(`${API_BASE_URL}/payment/${paymentId}`);
  if (!response.ok) return null;
  return await response.json();
};


// For demo purposes: Generate a mock Razorpay order ID
// In a real app, this would be created through the Razorpay API on your backend
export const generateMockRazorpayOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}; 