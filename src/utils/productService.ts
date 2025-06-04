import { v4 as uuidv4 } from 'uuid';
import { getFromStorage, setToStorage } from './localStorageService';
import axios from 'axios';
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  commissionRate: number;
  active: boolean;
  createdDate: string;
}

// Local storage keys
const PRODUCTS_STORAGE_KEY = 'value_life_products';
const serverUrl = import.meta.env.VITE_SERVER_URL

// Default products
const defaultProducts: Product[] = [
  {
    id: 'prod1',
    name: 'PH Alkaline Water Filter',
    price: 199.99,
    description: 'Our water filters provide alkaline water that helps improve immunity, enhance brain function, slow down aging, and make your body healthier.',
    commissionRate: 15,
    active: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: 'prod2',
    name: 'Bio Magnetic Mattress',
    price: 499.99,
    description: 'Improves blood circulation, relieves pain, enhances sleep quality, boosts energy levels, and supports natural detoxification.',
    commissionRate: 20,
    active: true,
    createdDate: new Date().toISOString(),
  },
  {
    id: 'prod3',
    name: 'Premium Health Package',
    price: 799.99,
    description: 'Our comprehensive health package includes both the PH Alkaline Water Filter and Bio Magnetic Mattress for maximum health benefits.',
    commissionRate: 25,
    active: true,
    createdDate: new Date().toISOString(),
  }
];

// Initialize products in local storage if they don't exist
//done
const initializeProducts = async () => {
  try {
    const response = await axios.get(`${serverUrl}/api/db/products`);
    const storedProducts = response.data;

    // ✅ Store in local storage after successful fetch
    setToStorage(PRODUCTS_STORAGE_KEY, storedProducts);

    // Optional: You can read it again to confirm or log
    const products = getFromStorage<Product[]>(PRODUCTS_STORAGE_KEY);
    console.log('Products stored in local storage:', products);
  } catch (error) {
    console.error('Error initializing products:', error);

    // 🛑 If API fails, fallback to default products
    setToStorage(PRODUCTS_STORAGE_KEY, defaultProducts);
    console.warn('Using default products instead.');
  }
};


// Get all products from storage
export const getAllProducts = (): Product[] => {
  initializeProducts();
  return getFromStorage<Product[]>(PRODUCTS_STORAGE_KEY) || [];
};

// Get active products only (for customer-facing views)
export const getActiveProducts = (): Product[] => {
  return getAllProducts().filter(product => product.active);
};

// Add a new product
//done
export const addProduct = async (product: Omit<Product, 'id' | 'createdDate'>): Promise<Product> => {
  const newProduct: Product = {
    id: uuidv4(),
    createdDate: new Date().toISOString(),
    ...product
  };

  const response = await axios.post(`${serverUrl}/api/db/products`, newProduct);
  console.log(response);

  const products = getAllProducts();
  products.push(newProduct);
  setToStorage(PRODUCTS_STORAGE_KEY, products);

  return newProduct;
};

// Update an existing product
//done
export const updateProduct = async (updatedProduct: Product): Promise<Product | null> => {
  try {
    // Call backend to update product
    const response = await axios.put(`${serverUrl}/api/db/products/${updatedProduct.id}`, updatedProduct);

    const updated = response.data;

    // Update in local storage
    const products = getAllProducts();
    const index = products.findIndex(p => p.id === updated.id);

    if (index !== -1) {
      products[index] = updated;
      setToStorage(PRODUCTS_STORAGE_KEY, products);
    }

    return updated;
  } catch (error) {
    console.error(`Failed to update product with ID ${updatedProduct.id}:`, error);
    return null;
  }
};

// Delete a product
//done
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    // Call backend to delete the product
    await axios.delete(`${serverUrl}/api/db/products/${productId}`);

    // Update localStorage
    const products = getAllProducts();
    const filteredProducts = products.filter(p => p.id !== productId);
    setToStorage(PRODUCTS_STORAGE_KEY, filteredProducts);

    return true;
  } catch (error) {
    console.error(`Failed to delete product with ID ${productId}:`, error);
    return false;
  }
};

// Get a product by ID
export const getProductById = (productId: string): Product | null => {
  const products = getAllProducts();
  const product = products.find(p => p.id === productId);
  return product || null;
}; 