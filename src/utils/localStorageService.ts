import {
  User,
  Transaction,
  NetworkMember,
  NetworkStats,
  DashboardStats,
  Wallet,
  CommissionStructure,
  KYCStatus
} from '../types';
import {
  currentUser,
  transactions,
  networkMembers,
  networkStats,
  dashboardStats,
  wallet,
  commissionStructure
} from '../data/mockData';
import axios from 'axios';
import { get } from 'jquery';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'mlm_current_user',
  USERS: 'mlm_users',
  TRANSACTIONS: 'mlm_transactions',
  NETWORK_MEMBERS: 'mlm_network_members',
  NETWORK_STATS: 'mlm_network_stats',
  DASHBOARD_STATS: 'mlm_dashboard_stats',
  WALLET: 'mlm_wallet',
  COMMISSION_STRUCTURE: 'mlm_commission_structure',
  PRODUCTS: 'value_life_products',
  ADMIN_AUTH: 'adminAuthenticated',
  KYC_REQUESTS: 'mlm_kyc_requests'
};

const serverUrl = import.meta.env.VITE_SERVER_URL

export const apiCall = async (
  method: 'post' | 'put' | 'delete' | 'patch' | 'get', // restrict to body-based methods
  route: string,
  data?: any
) => {
  try {
    const response = await axios({
      method,
      url: `${serverUrl}${route}`,
      data, // sends as body
    });

    return response.data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};


// Check if localStorage is available and working
export const isLocalStorageAvailable = () => {
  try {
    const testKey = 'test_storage';
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === testKey;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

// Create fallback in-memory storage for environments where localStorage isn't available
const memoryStorage: Record<string, string> = {};

// Safe version of localStorage.getItem
const safeGetItem = (key: string): string | null => {
  if (isLocalStorageAvailable()) {
    return localStorage.getItem(key);
  }
  return memoryStorage[key] || null;
};

// Safe version of localStorage.setItem
const safeSetItem = (key: string, value: string): void => {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(key, value);
  } else {
    memoryStorage[key] = value;
    console.warn(`Using in-memory storage for key "${key}" because localStorage is not available`);
  }
};

// Safe version of localStorage.removeItem
const safeRemoveItem = (key: string): void => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(key);
  } else {
    delete memoryStorage[key];
  }
};

// Initialize all data in local storage if it doesn't exist
export const initializeLocalStorage = () => {
  console.log('Initializing local storage...');

  try {
    // Log if localStorage is working
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available! Using in-memory storage as fallback.');
    }

    try {
      // Check if current user exists, if not initialize with mock data
      if (!safeGetItem(STORAGE_KEYS.CURRENT_USER)) {
        console.log('Initializing current user with mock data');
        safeSetItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Error initializing current user:', error);
    }

    try {
      // Initialize users array with current user if not exists
      if (!safeGetItem(STORAGE_KEYS.USERS)) {
        console.log('Initializing users list with mock data');
        safeSetItem(STORAGE_KEYS.USERS, JSON.stringify([currentUser]));
      }
    } catch (error) {
      console.error('Error initializing users:', error);
    }

    try {
      // Initialize transactions
      if (!safeGetItem(STORAGE_KEYS.TRANSACTIONS)) {
        console.log('Initializing transactions with mock data');
        safeSetItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }
    } catch (error) {
      console.error('Error initializing transactions:', error);
    }

    try {
      // Initialize network members
      if (!safeGetItem(STORAGE_KEYS.NETWORK_MEMBERS)) {
        console.log('Initializing network members with mock data');
        safeSetItem(STORAGE_KEYS.NETWORK_MEMBERS, JSON.stringify(networkMembers));
      }
    } catch (error) {
      console.error('Error initializing network members:', error);
    }

    try {
      // Initialize network stats
      if (!safeGetItem(STORAGE_KEYS.NETWORK_STATS)) {
        console.log('Initializing network stats with mock data');
        safeSetItem(STORAGE_KEYS.NETWORK_STATS, JSON.stringify(networkStats));
      }
    } catch (error) {
      console.error('Error initializing network stats:', error);
    }

    try {
      // Initialize dashboard stats
      if (!safeGetItem(STORAGE_KEYS.DASHBOARD_STATS)) {
        console.log('Initializing dashboard stats with mock data');
        safeSetItem(STORAGE_KEYS.DASHBOARD_STATS, JSON.stringify(dashboardStats));
      }
    } catch (error) {
      console.error('Error initializing dashboard stats:', error);
    }

    try {
      // Initialize wallet
      if (!safeGetItem(STORAGE_KEYS.WALLET)) {
        console.log('Initializing wallet with mock data');
        safeSetItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
    }

    try {
      // Initialize commission structure
      if (!safeGetItem(STORAGE_KEYS.COMMISSION_STRUCTURE)) {
        console.log('Initializing commission structure with mock data');
        safeSetItem(STORAGE_KEYS.COMMISSION_STRUCTURE, JSON.stringify(commissionStructure));
      }
    } catch (error) {
      console.error('Error initializing commission structure:', error);
    }

    try {
      // Initialize KYC requests array
      if (!safeGetItem(STORAGE_KEYS.KYC_REQUESTS)) {
        console.log('Initializing KYC requests');
        safeSetItem(STORAGE_KEYS.KYC_REQUESTS, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing KYC requests:', error);
    }

    console.log('Local storage initialization complete');
  } catch (error) {
    console.error('Fatal error during local storage initialization:', error);
  }
};

// Generic get function for any data type
export const getFromStorage = <T>(key: string): T | null => {
  const data = safeGetItem(key);
  return data ? JSON.parse(data) : null;
};

// Generic set function for any data type
export const setToStorage = <T>(key: string, data: T): void => {
  safeSetItem(key, JSON.stringify(data));
};

// User related functions
//done
export const getCurrentUser = (): User | null => {
  return getFromStorage<User>(STORAGE_KEYS.CURRENT_USER);
};

export const updateCurrentUser = (user: User): void => {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);

  // Also update in the users array
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS) || [];
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  setToStorage(STORAGE_KEYS.USERS, updatedUsers);
};

export const getAllUsers = async (): Promise<User[]> => {
  // return getFromStorage<User[]>(STORAGE_KEYS.USERS) || [];
  const allUsers = await apiCall('get', '/api/db/users')
  console.log(allUsers);

  return allUsers
};

export const addUser = async (user: User): Promise<void> => {
  const users = await getAllUsers();
  users.push(user);
  setToStorage(STORAGE_KEYS.USERS, users);
};

// Create fresh network member data for a new user
// mark
const createFreshNetworkMember = (user: User): NetworkMember => {
  return {
    id: user.id,
    name: user.name,
    profilePicture: user.profilePicture || '',
    referralCode: user.referralCode,
    joinDate: user.registrationDate,
    active: false, // New users are not active until payment
    children: [] // New user has no downline initially
  };
};

// Create fresh network stats for a new user
//mark
const createFreshNetworkStats = (): NetworkStats => {
  const today = new Date();
  const pastDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const pastWeeks = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    totalMembers: 1, // Just the user themselves
    directReferrals: 0,
    activeMembers: 1,
    inactiveMembers: 0,
    levelWiseCount: { 1: 0, 2: 0, 3: 0 },
    dailyGrowth: pastDates.map(date => ({ date, count: 0 })),
    weeklyGrowth: pastWeeks.map(week => ({ week, count: 0 })),
    monthlyGrowth: months.map(month => ({ month, count: 0 }))
  };
};

// Create fresh wallet for a new user
//mark
const createFreshWallet = (userId: string): Wallet => {
  return {
    userId,
    balance: 0,
    transactions: []
  };
};

// Create fresh dashboard stats for a new user
//mark
const createFreshDashboardStats = (): DashboardStats => {
  const today = new Date();
  const pastDates = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return {
    totalEarnings: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    directReferrals: 0,
    teamSize: 1, // Just the user themselves
    tdsTotal: 0, // Add tdsTotal property
    recentTransactions: [],
    earningsByType: {
      retail_profit: 0,
      referral_bonus: 0,
      team_matching: 0,
      royalty_bonus: 0,
      repurchase_bonus: 0,
      award_reward: 0,
      withdrawal: 0,
      withdrawal_reversal: 0
    },
    earningsTimeline: pastDates.map(date => ({ date, amount: 0 }))
  };
};

// Get user-specific network members
// done
export const getUserNetworkMembers = async (userId: string): Promise<NetworkMember> => {
  console.log(`Retrieving network members for user ID: ${userId}`);

  // Try to get user-specific network data first
  const userNetwork = await apiCall('get', `/api/db/network/${userId}`)

  if (userNetwork) {
    console.log(`Found network data ${userNetwork.children?.length || 0} children`);
    return userNetwork;
  }


  // Fall back to default network data (for backward compatibility)
  console.log(`No specific network data found for user ${userId}, falling back to default`);
  return getNetworkMembers();
};

// Get user-specific network stats
export const getUserNetworkStats = (userId: string): NetworkStats => {
  // Try to get user-specific stats first
  const userStats = getFromStorage<NetworkStats>(`${STORAGE_KEYS.NETWORK_STATS}_${userId}`);
  if (userStats) {
    return userStats;
  }

  // Fall back to default stats (for backward compatibility)
  return getNetworkStats();
};

// Get user-specific wallet
export const getUserWallet = async (userId: string): Promise<Wallet> => {
  try {
    const response = await axios.get(`${serverUrl}/api/db/wallet/${userId}`);
    if (response && response.data) {
      return response.data;
    }
    throw new Error('No wallet data found');
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    throw error;
  }
};


// Get user-specific dashboard stats
export const getUserDashboardStats = async (userId: string): Promise<DashboardStats> => {
  try {
    const response = await axios.get(`${serverUrl}/api/db/stats/dashboard/${userId}`);
    
    // Return the data directly since axios already throws for non-2xx responses
    return response.data || {
      totalEarnings: 0,
      pendingWithdrawals: 0,
      completedWithdrawals: 0,
      directReferrals: 0,
      teamSize: 0,
      tdsTotal: 0, // Add tdsTotal property
      recentTransactions: [],
      earningsByType: {
        retail_profit: 0,
        referral_bonus: 0,
        team_matching: 0,
        royalty_bonus: 0,
        repurchase_bonus: 0,
        award_reward: 0,
        withdrawal: 0,
        withdrawal_reversal: 0
      },
      earningsTimeline: []
    };
  } catch (err) {
    console.error('API error in getUserDashboardStats:', err);
    // Return default stats object instead of throwing
    return {
      totalEarnings: 0,
      pendingWithdrawals: 0,
      completedWithdrawals: 0,
      directReferrals: 0,
      teamSize: 0,
      tdsTotal: 0, // Add tdsTotal property
      recentTransactions: [],
      earningsByType: {
        retail_profit: 0,
        referral_bonus: 0,
        team_matching: 0,
        royalty_bonus: 0,
        repurchase_bonus: 0,
        award_reward: 0,
        withdrawal: 0,
        withdrawal_reversal: 0
      },
      earningsTimeline: []
    };
  }
};
// Transaction related functions
export const getAllTransactions = async (): Promise<Transaction[]> => {
  // return getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  const response = await axios.get(`${serverUrl}/api/db/transactions?userId=${getCurrentUser()?.id}`);
  const data = response.data;
  return data || []
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const transactions =  await axios.get(`${serverUrl}/api/db/transactions?userId=${userId}`);
  return transactions.data || []
};

// export const addTransaction = async (transaction: Transaction): Promise<void> => {
//   const transactions = await getAllTransactions();
//   transactions.push(transaction);
//   setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

//   // Update wallet balance
//   await updateWalletAfterTransaction(transaction);
// };
export const addTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    // Fetch existing transactions for the current user
    const transactions = await getAllTransactions();

    // If no transactions found, create a new one
    if (transactions.length === 0) {
      console.log('No transactions found, creating a new one...');
      
      // Create a new transaction based on the passed data
      const newTransaction: Transaction = {
        id: uuidv4(),  // Generate a new transaction ID
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        date: new Date().toISOString(),
        status: 'completed',  // Set default status
        paymentId: transaction.paymentId || '',  // Use the provided payment ID or an empty string
      };

      // Call API to create the new transaction in the backend
      await axios.post(`${serverUrl}/api/db/transactions`, newTransaction);  // Send the new transaction to the backend

      // Optionally, update local storage with the new transaction
      const currentTransactions = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
      currentTransactions.push(newTransaction);
      setToStorage(STORAGE_KEYS.TRANSACTIONS, currentTransactions);

      console.log('New transaction created and saved to local storage:', newTransaction);
    } else {
      // If transactions already exist, add the new one to the array
      transactions.push(transaction);

      // Send the new transaction to the backend
      await axios.post(`${serverUrl}/api/db/transactions`, transaction);  // API call to create the transaction in the database

      // Update local storage with the new transaction
      setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
      console.log('New transaction added and saved to local storage:', transaction);
    }

    // After adding the transaction, update the user's wallet balance
    await updateWalletAfterTransaction(transaction);

    // --- NEW: Update user's dashboardStats.recentTransactions ---
    // Get the user's dashboard stats (from storage or API)
    const userId = transaction.userId;
    let dashboardStats: DashboardStats | null = null;
    try {
      dashboardStats = await getUserDashboardStats(userId);
    } catch (e) {
      dashboardStats = getDashboardStats();
    }
    if (dashboardStats) {
      // Get all transactions for the user, sort by date desc, take 10
      const userTransactions = await getUserTransactions(userId);
      const sorted = userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      dashboardStats.recentTransactions = sorted.slice(0, 10);
      setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${userId}`, dashboardStats);
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
  }
};


// Update wallet after a transaction
const updateWalletAfterTransaction = async (transaction: Transaction): Promise<void> => {
  if (transaction.status !== 'completed') return;

  // Get the specific user's wallet
  const userWallet = await getUserWallet(transaction.userId);
  if (!userWallet) return;

  let balanceChange = 0;

  if (transaction.type === 'withdrawal') {
    balanceChange = -transaction.amount;
  } else if (transaction.type === 'withdrawal_reversal') {
    balanceChange = transaction.amount;
  } else {
    balanceChange = transaction.amount;
  }

  const userTransactions = await getUserTransactions(transaction.userId);

  const updatedWallet: Wallet = {
    ...userWallet,
    userId:userWallet.userId,
    balance: userWallet.balance + balanceChange,
    transactions: userTransactions
  };

  // Update the user-specific wallet
  setToStorage(`${STORAGE_KEYS.WALLET}_${transaction.userId}`, updatedWallet);

  // Also update the general wallet for backward compatibility
  const generalWallet = getWallet();
  if (generalWallet.userId === transaction.userId) {
    setToStorage(STORAGE_KEYS.WALLET, updatedWallet);
  }
  try {
    await axios.put(`${serverUrl}/api/db/wallet/${transaction.userId}`, {
      balance: updatedWallet.balance,
      transactions: updatedWallet.transactions
    });
    console.log(`Wallet updated for user ${transaction.userId} in the database.`);
  } catch (error) {
    console.error('Error updating wallet in database:', error);
  }
};

// Network related functions
export const getNetworkMembers = (): NetworkMember => {
  return getFromStorage<NetworkMember>(STORAGE_KEYS.NETWORK_MEMBERS) || {
    id: '', name: '', referralCode: '', joinDate: '', active: false
  };
};

export const updateNetworkMembers = (networkMember: NetworkMember): void => {
  setToStorage(STORAGE_KEYS.NETWORK_MEMBERS, networkMember);
};

export const getNetworkStats = (): NetworkStats => {
  return getFromStorage<NetworkStats>(STORAGE_KEYS.NETWORK_STATS) || {
    totalMembers: 0, directReferrals: 0, activeMembers: 0, inactiveMembers: 0,
    levelWiseCount: {}, dailyGrowth: [], weeklyGrowth: [], monthlyGrowth: []
  };
};

export const updateNetworkStats = (stats: NetworkStats): void => {
  setToStorage(STORAGE_KEYS.NETWORK_STATS, stats);
};

// Dashboard related functions
export const getDashboardStats = (): DashboardStats => {
  return getFromStorage<DashboardStats>(STORAGE_KEYS.DASHBOARD_STATS) || {
    totalEarnings: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    directReferrals: 0,
    teamSize: 0,
    tdsTotal: 0, // Add tdsTotal property
    recentTransactions: [],
    earningsByType: {
      retail_profit: 0,
      referral_bonus: 0,
      team_matching: 0,
      royalty_bonus: 0,
      repurchase_bonus: 0,
      award_reward: 0,
      withdrawal: 0,
      withdrawal_reversal: 0
    },
    earningsTimeline: []
  };
};

export const updateDashboardStats = (stats: DashboardStats): void => {
  setToStorage(STORAGE_KEYS.DASHBOARD_STATS, stats);
};

// Wallet related functions
export const getWallet = (): Wallet => {
  return getFromStorage<Wallet>(STORAGE_KEYS.WALLET) || {
    userId: '', balance: 0, transactions: []
  };
};

export const updateWallet = (updatedWallet: Wallet): void => {
  setToStorage(STORAGE_KEYS.WALLET, updatedWallet);
};

// Commission related functions
export const getCommissionStructure = (): CommissionStructure => {
  // Check if we have a commission structure in local storage
  const storedStructure = getFromStorage(STORAGE_KEYS.COMMISSION_STRUCTURE);

  if (storedStructure) {
    return storedStructure as CommissionStructure;
  }

  // Default commission structure
  const defaultStructure: CommissionStructure = {
    retailProfit: { min: 10, max: 20 },
    directReferralBonus: 3000,
    firstMatchingBonus: 3000, // Added first matching bonus of 3000 NPR
    teamMatchingBonus: 2500, // Added team matching bonus of 2500/- per pair
    teamMatchingDailyCap: 20, // Added team matching daily cap of 20 pairs
    royaltyBonus: 2, // 2% of company turnover
    repurchaseBonus: 3, // 3% repurchase bonus
    levelCommissions: {
      1: 0.07, // 7%
      2: 0.05, // 5%
      3: 0.03, // 3%
      4: 0.02, // 2%
      5: 0.01  // 1%
    },
    tdsPercentage: 0.05,     // 5% TDS
    adminFeePercentage: 0.10, // 10% Admin fee
    repurchasePercentage: 0.03, // 3% Repurchase allocation
    milestoneRewards: {
      pairs: {
        1: { type: 'Insurance', value: '₹15,00,000 Insurance' },
        5: { type: 'Travel', value: 'TA & DA Eligibility' },
        15: { type: 'Travel', value: 'Goa Tour' },
        50: { type: 'Travel', value: 'Thailand Tour' },
        100: { type: 'Product', value: 'Dell Laptop' },
        250: { type: 'Travel', value: 'Singapore Tour' },
        500: { type: 'Cash/Gold', value: '2.5 Lack Gold/Cash' },
        1000: { type: 'Insurance', value: '1 Cr Health Insurance or 5 Lack Cash' },
        2500: { type: 'Cash', value: '10 Lacks Car Fund' }
      }
    }
  };

  // Store the default structure for future use
  setToStorage(STORAGE_KEYS.COMMISSION_STRUCTURE, defaultStructure);

  return defaultStructure;
};

export const updateCommissionStructure = (structure: CommissionStructure): void => {
  setToStorage(STORAGE_KEYS.COMMISSION_STRUCTURE, structure);
};

// KYC related functions
export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  inputValue: string;
  documentType: string
  // documents: {
  //   idProof?: string;
  //   addressProof?: string;
  //   bankDetails?: string;
  // };
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  reviewDate?: string;
  reviewNotes?: string;
}

//done
export const getAllKycRequests = async (): Promise<KycRequest[]> => {
  try {
    const data = await apiCall('get', '/api/db/kycRequests');
    return data || [];
  } catch (error) {
    console.error('Failed to fetch KYC requests:', error);
    return []; // ✅ fixes the TypeScript error
  }
};

export const addKycRequest = async (request: KycRequest): Promise<void> => {
  const requests = await getAllKycRequests();
  requests.push(request);
  setToStorage(STORAGE_KEYS.KYC_REQUESTS, requests);
};

export const updateKycRequest = async (updatedRequest: KycRequest): Promise<void> => {
  const requests = await getAllKycRequests();
  const updatedRequests = requests.map(req =>
    req.id === updatedRequest.id ? updatedRequest : req
  );
  setToStorage(STORAGE_KEYS.KYC_REQUESTS, updatedRequests);

  // Also update the user's KYC status
  const user = await getCurrentUser();
  if (user && user.id === updatedRequest.userId) {
    updateCurrentUser({
      ...user,
      kycStatus: updatedRequest.status
    });
  }
};

// Get KYC documents for current user
export const getKycDocuments = async (userId: string): Promise<any[]> => {
  try {
    const data = await apiCall('get', `/api/db/kycRequests/user/${userId}/kyc-docs`);
    return data.data || [];
  } catch (error) {
    console.error('Error retrieving KYC documents:', error);
    return [];
  }
};

// Helper: Find the first available spot in the given position (left/right) branch
function findAvailableSpotInBranch(root: NetworkMember, position: 'left' | 'right'): NetworkMember | null {
  let queue: (NetworkMember | undefined)[] = [root];
  while (queue.length > 0) {
    let node = queue.shift();
    if (!node) continue;
    if (!node.children) node.children = [];
    const idx = position === 'left' ? 0 : 1;
    if (!node.children[idx]) {
      return node;
    } else {
      queue.push(node.children[idx]);
    }
  }
  return null;
}

// Helper: Find the deepest available spot in the given position (left/right) branch
function findDeepestAvailableSpot(root: NetworkMember, position: 'left' | 'right'): NetworkMember {
  let node = root;
  while (node.children && node.children[position === 'left' ? 0 : 1]) {
    node = node.children[position === 'left' ? 0 : 1];
  }
  return node;
}

// Helper: Find the next available spot in the binary tree (BFS)
function findNextAvailableBinarySpot(root: NetworkMember): { parent: NetworkMember, position: 'left' | 'right' } | null {
  let queue: NetworkMember[] = [root];
  while (queue.length > 0) {
    let node = queue.shift()!;
    if (!node.children) node.children = [];
    if (!node.children[0]) return { parent: node, position: 'left' };
    if (!node.children[1]) return { parent: node, position: 'right' };
    queue.push(node.children[0]);
    queue.push(node.children[1]);
  }
  return null;
}

// Add a new user with all related fresh data
export const addNewUserWithData = async (user: User, sponsorId?: string, position?: 'left' | 'right', referralCodeForRegistration?: string): Promise<void> => {
  console.log("============== ADDING NEW USER WITH DATA ==============");
  console.log("Adding new user:", user.name, "with referral code:", user.referralCode);
  console.log("Sponsor ID:", user.sponsorId || "NONE");

  // Add user to users array
  const allUsers = await getAllUsers();

  // Check if user with this ID or referral code already exists to avoid duplication
  const existingUserIndex = allUsers.findIndex(u =>
    u.id === user.id || u.referralCode === user.referralCode
  );

  if (existingUserIndex >= 0) {
    console.log(`User with ID ${user.id} or referral code ${user.referralCode} already exists. Updating instead of adding.`);
    allUsers[existingUserIndex] = user;
  } else {
    allUsers.push(user);
  }

  setToStorage(STORAGE_KEYS.USERS, allUsers);
  console.log(`Users array now contains ${allUsers.length} users`);

  // Create and add fresh network member data
  const networkMember = createFreshNetworkMember(user);

  // If this user has a sponsor, update the sponsor's network
  if (sponsorId || referralCodeForRegistration) {
    let sponsor: User | undefined = undefined;
    if (sponsorId) {
      sponsor = allUsers.find((u: User) => u.distributorId === sponsorId || u.referralCode === sponsorId);
    } else if (referralCodeForRegistration) {
      sponsor = allUsers.find((u: User) => u.referralCode === referralCodeForRegistration);
    }
    if (sponsor) {
      const sponsorNetworkKey = `mlm_network_members_${sponsor.id}`;
      let sponsorNetwork = getFromStorage<NetworkMember>(sponsorNetworkKey) || {
        id: sponsor.id,
        name: sponsor.name,
        profilePicture: sponsor.profilePicture || '',
        referralCode: sponsor.referralCode,
        joinDate: sponsor.registrationDate,
        active: true,
        children: [],
      };
      // Place the new user in the next available spot in the binary tree
      const spot = findNextAvailableBinarySpot(sponsorNetwork);
      if (spot) {
        if (!spot.parent.children) spot.parent.children = [];
        const idx = spot.position === 'left' ? 0 : 1;
        spot.parent.children[idx] = {
          id: user.id,
          name: user.name,
          profilePicture: user.profilePicture || '',
          referralCode: user.referralCode,
          joinDate: user.registrationDate,
          active: true,
          children: [],
          position: spot.position
        };
        setToStorage(sponsorNetworkKey, sponsorNetwork);
      }
    }
  } else {
    console.log("User has no sponsor - will be at the top level of their own network");
  }

  // Set user's own network data
  const userNetworkKey = `mlm_network_members_${user.id}`;
  setToStorage(userNetworkKey, networkMember);
  console.log(`Set up new user's network data at key: ${userNetworkKey}`);
};

// Admin specific functions
// not being used 
export const getAllUsersForAdmin = (): User[] => {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS) || [];
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Get all users
    const users = getAllUsersForAdmin();
    const userToDelete = users.find(user => user.id === userId);

    if (!userToDelete) {
      return false;
    }

    // Remove user from users array
    const updatedUsers = users.filter(user => user.id !== userId);
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);

    // Remove user-specific data
    const userSpecificKeys = [
      `${STORAGE_KEYS.NETWORK_MEMBERS}_${userId}`,
      `${STORAGE_KEYS.NETWORK_STATS}_${userId}`,
      `${STORAGE_KEYS.WALLET}_${userId}`,
      `${STORAGE_KEYS.DASHBOARD_STATS}_${userId}`
    ];

    userSpecificKeys.forEach(key => {
      safeRemoveItem(key);
    });

    // Remove from KYC requests
    const kycRequests = await getAllKycRequests();
    const updatedKycRequests = kycRequests.filter((req: KycRequest) => req.userId !== userId);
    setToStorage(STORAGE_KEYS.KYC_REQUESTS, updatedKycRequests);

    // Remove user's transactions
    const transactions = await getAllTransactions();
    const updatedTransactions = transactions.filter((t: { userId: string; }) => t.userId !== userId);
    setToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTransactions);

    // Update network structure of other users if this user is in their downline
    // Find users who have this user as direct referral
    const possibleSponsors = users.filter(u => u.id !== userId);

    for (const sponsor of possibleSponsors) {
      const sponsorNetwork = await getUserNetworkMembers(sponsor.id);

      if (sponsorNetwork && sponsorNetwork.children) {
        // Check if deleted user is in sponsor's direct downline
        const userIndex = sponsorNetwork.children.findIndex(child => child.id === userId);

        if (userIndex !== -1) {
          // Remove user from sponsor's network
          sponsorNetwork.children.splice(userIndex, 1);

          // Save updated network
          setToStorage(`${STORAGE_KEYS.NETWORK_MEMBERS}_${sponsor.id}`, sponsorNetwork);

          // Update sponsor's stats
          const sponsorStats = getUserNetworkStats(sponsor.id);
          if (sponsorStats) {
            sponsorStats.totalMembers = Math.max(0, sponsorStats.totalMembers - 1);
            sponsorStats.directReferrals = Math.max(0, sponsorStats.directReferrals - 1);
            sponsorStats.activeMembers = Math.max(0, sponsorStats.activeMembers - 1);

            if (sponsorStats.levelWiseCount && sponsorStats.levelWiseCount[1]) {
              sponsorStats.levelWiseCount[1] = Math.max(0, sponsorStats.levelWiseCount[1] - 1);
            }

            setToStorage(`${STORAGE_KEYS.NETWORK_STATS}_${sponsor.id}`, sponsorStats);
          }

          // Update sponsor's dashboard stats
          const sponsorDashboard = getUserDashboardStats(sponsor.id);
          if (sponsorDashboard) {
            (await sponsorDashboard).directReferrals = Math.max(0, (await sponsorDashboard).directReferrals - 1);
            (await sponsorDashboard).teamSize = Math.max(1, (await sponsorDashboard).teamSize - 1);

            setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${sponsor.id}`, sponsorDashboard);
          }

          break; // User can only have one sponsor
        }
      }
    }

    console.log(`Successfully deleted user with ID: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const updateUserKycStatus = async (kycId: string, userId: string, status: KYCStatus, reviewNotes?: string): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return false;
    }

    // Update user KYC status
    users[userIndex].kycStatus = status;
    await apiCall('put', '/api/db/kycRequests', { kycId, userId, status })
    setToStorage(STORAGE_KEYS.USERS, users);

    // Update KYC request if exists
    const kycRequests = await getAllKycRequests();
    const requestIndex = kycRequests.findIndex(req => req.userId === userId);

    if (requestIndex !== -1) {
      kycRequests[requestIndex].status = status;
      kycRequests[requestIndex].reviewDate = new Date().toISOString();

      if (reviewNotes) {
        kycRequests[requestIndex].reviewNotes = reviewNotes;
      }

      setToStorage(STORAGE_KEYS.KYC_REQUESTS, kycRequests);

      // In a real application, send email notification to user
      console.log(`KYC status updated to ${status} for user ${users[userIndex].name}. 
        In a production environment, an email would be sent to ${users[userIndex].email}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating user KYC status:', error);
    return false;
  }
};

export const getAdminStats = async () => {
  const users = getAllUsersForAdmin();
  const kycRequests = await getAllKycRequests();
  const transactions = await getAllTransactions();

  return {
    totalUsers: users.length,
    pendingKycRequests: kycRequests.filter(req => req.status === 'pending').length,
    approvedKycRequests: kycRequests.filter(req => req.status === 'approved').length,
    rejectedKycRequests: kycRequests.filter(req => req.status === 'rejected').length,
    totalTransactions: transactions.length,
    totalEarnings: transactions
      .filter((t: { status: string; type: string; }) => t.status === 'completed' && t.type !== 'withdrawal')
      .reduce((sum: any, t: { amount: any; }) => sum + t.amount, 0),
    totalWithdrawals: (await transactions)
      .filter(t => t.status === 'completed' && t.type === 'withdrawal')
      .reduce((sum: number, t: { amount: number; }) => sum + Math.abs(t.amount), 0),
    pendingWithdrawals: transactions
      .filter((t: { status: string; type: string; }) => t.status === 'pending' && t.type === 'withdrawal')
      .reduce((sum: number, t: { amount: number; }) => sum + Math.abs(t.amount), 0)
  };
};

export const updateUserProfile = (userId: string, userData: Partial<User>): boolean => {
  try {
    const users = getAllUsersForAdmin();
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return false;
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...userData
    };

    setToStorage(STORAGE_KEYS.USERS, users);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const processWithdrawalRequest = async (transactionId: string, approved: boolean): Promise<boolean> => {
  try {
    const transactions = await getAllTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);

    if (transactionIndex === -1) {
      return false;
    }

    // Update transaction status
    if (approved) {
      transactions[transactionIndex].status = 'completed';
    } else {
      transactions[transactionIndex].status = 'rejected';

      // Add a reversal transaction if rejected
      const originalTransaction = transactions[transactionIndex];
      const reversalTransaction: Transaction = {
        id: `rev-${originalTransaction.id}`,
        userId: originalTransaction.userId,
        amount: Math.abs(originalTransaction.amount), // Make it positive
        type: 'withdrawal_reversal',
        description: `Reversal of rejected withdrawal: ${originalTransaction.description}`,
        date: new Date().toISOString(),
        status: 'completed'
      };

      transactions.push(reversalTransaction);

      // Update user wallet balance
      const userWallet = await getUserWallet(originalTransaction.userId);
      if (userWallet) {
        userWallet.balance += Math.abs(originalTransaction.amount);
        updateWallet(userWallet);
      }
    }

    setToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return true;
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    return false;
  }
};

// Admin authentication
export const validateAdminCredentials = (username: string, password: string): boolean => {
  // In a real application, this would validate against securely stored credentials
  // For demo purposes, we'll use hardcoded credentials
  // In production, you should use proper authentication with hashed passwords

  // Get admin credentials from storage or use defaults
  const storedAdminUsername = getFromStorage<string>('admin_username') || 'admin';
  const storedAdminPassword = getFromStorage<string>('admin_password') || 'admin123';

  return username === storedAdminUsername && password === storedAdminPassword;
};

export const updateAdminCredentials = (username: string, password: string): boolean => {
  try {
    setToStorage('admin_username', username);
    setToStorage('admin_password', password);
    return true;
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    return false;
  }
};

// Get user data (alias for getCurrentUser for better semantics)
export const getUserData = (): User | null => {
  return getCurrentUser();
};

// Save the last KYC status for comparison
export const saveLastKycStatus = (status: KYCStatus): void => {
  localStorage.setItem('lastKycStatus', status);
};

// Interface for KYC submission history
//done
export interface KycSubmission {
  documentType: string;
  status: KYCStatus;
  inputValue: string;
  submissionDate: string;
  reviewedAt?: string;
  notes?: string;
}

// Get KYC submission history for current user
//done
export const getKycSubmissionHistory = async (): Promise<KycSubmission[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const storedHistory = localStorage.getItem(`kycHistory_${currentUser.id}`);
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error('Error retrieving KYC submission history:', error);
    return [];
  }
};

// Add a new KYC submission to history
// done
export const addKycSubmission = async (submission: KycSubmission): Promise<void> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const userId = currentUser.id
    const userName = currentUser.name

    const updatedSubmission = await apiCall('post', '/api/db/kycRequests', { submission, userId, userName })

    const history = await getKycSubmissionHistory();
    history.push(updatedSubmission);

    localStorage.setItem(`kycHistory_${currentUser.id}`, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving KYC submission history:', error);
  }
};

// Save KYC documents for current user
export const saveKycDocuments = (documents: any[]): void => {
  try {
    localStorage.setItem('kycDocuments', JSON.stringify(documents));
  } catch (error) {
    console.error('Error saving KYC documents:', error);
  }
};

// Function to create and add a referral bonus transaction for the sponsor
export const addReferralBonusTransaction = async (sponsorId: string, referredUserId: string, referredUserName: string): Promise<void> => {
  // Get the commission structure to determine the bonus amount
  const commissionStructure = getCommissionStructure();
  const grossBonusAmount = commissionStructure.directReferralBonus || 3000; // Default to 3000 if not set

  // Calculate deductions
  const tdsFee = grossBonusAmount * 0.05; // 5% TDS
  const adminFee = grossBonusAmount * 0.10; // 10% Admin fee
  const repurchaseAllocation = grossBonusAmount * 0.03; // 3% Repurchase allocation

  // Calculate net amount after deductions
  const netBonusAmount = grossBonusAmount - tdsFee - adminFee - repurchaseAllocation;

  // Create a new transaction for the net bonus amount
  const transaction: Transaction = {
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: sponsorId,
    amount: netBonusAmount,
    type: 'referral_bonus',
    description: `Direct referral bonus from ${referredUserName} (after deductions)`,
    date: new Date().toISOString(),
    status: 'completed',
    relatedUserId: referredUserId
  };

  // Create separate transactions for tracking the deductions
  const tdsTransaction: Transaction = {
    id: `tds-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: sponsorId,
    amount: -tdsFee, // Negative amount as it's a deduction
    type: 'referral_bonus',
    description: `5% TDS on referral bonus for ${referredUserName}`,
    date: new Date().toISOString(),
    status: 'completed',
    relatedUserId: referredUserId
  };

  const adminTransaction: Transaction = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: sponsorId,
    amount: -adminFee, // Negative amount as it's a deduction
    type: 'referral_bonus',
    description: `10% Admin fee on referral bonus for ${referredUserName}`,
    date: new Date().toISOString(),
    status: 'completed',
    relatedUserId: referredUserId
  };

  const repurchaseTransaction: Transaction = {
    id: `repurch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: sponsorId,
    amount: -repurchaseAllocation, // Negative amount as it's a deduction
    type: 'repurchase_bonus',
    description: `3% Repurchase allocation from referral bonus for ${referredUserName}`,
    date: new Date().toISOString(),
    status: 'completed',
    relatedUserId: referredUserId
  };

  // Add all transactions
  await addTransaction(transaction);
  await addTransaction(tdsTransaction);
  await addTransaction(adminTransaction);
  await addTransaction(repurchaseTransaction);

  // Get the admin user (for admin fee allocation)
  const allUsers = await getAllUsers();
  const adminUser: User | undefined = allUsers.find((user: User) => user.email === 'admin@example.com'); // Assuming admin has this email

  if (adminUser) {
    // Add the admin fee to the admin's wallet
    const adminBonusTransaction: Transaction = {
      id: `admin-bonus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: adminUser.id,
      amount: adminFee,
      type: 'referral_bonus',
      description: `Admin fee from referral bonus of ${referredUserName}`,
      date: new Date().toISOString(),
      status: 'completed',
      relatedUserId: sponsorId
    };

   await addTransaction(adminBonusTransaction);

    // Update admin's dashboard stats
    const adminDashboardStats = getUserDashboardStats(adminUser.id);
    if (adminDashboardStats) {
      // Update total earnings
      (await
        // Update total earnings
        adminDashboardStats).totalEarnings += adminFee;

      // Update earnings by type
      (await
        // Update earnings by type
        adminDashboardStats).earningsByType.referral_bonus =
        ((await adminDashboardStats).earningsByType.referral_bonus || 0) + adminFee;

      // Add to admin's recent transactions
      if ((await adminDashboardStats).recentTransactions.length > 10) {
        // Keep only the 10 most recent transactions
        (await
          // Keep only the 10 most recent transactions
          adminDashboardStats).recentTransactions.pop();
      }
      (await adminDashboardStats).recentTransactions.unshift(adminBonusTransaction);

      // Update the admin's dashboard stats
      setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${adminUser.id}`, adminDashboardStats);
    }
  }

  // Now update the sponsor's dashboard stats with the net amount 
  // (the main transaction takes care of this via updateWalletAfterTransaction)
  const sponsorDashboardStats = getUserDashboardStats(sponsorId);
  if (sponsorDashboardStats) {
    // Update total earnings (the gross amount will be added in wallet updates)
    // We don't need to adjust the total here, just the display of different components

    // Update earnings by type
    // Note: The actual wallet balance is updated correctly by the transactions

    // Add to earnings timeline with the net effect
    const today = new Date().toISOString().split('T')[0];
    const timelineIndex = (await sponsorDashboardStats).earningsTimeline.findIndex(
      entry => entry.date === today
    );

    if (timelineIndex >= 0) {
      // Update existing entry for today
      (await
        // Update existing entry for today
        sponsorDashboardStats).earningsTimeline[timelineIndex].amount += netBonusAmount;
    } else {
      // Add new entry for today
      // Find the last entry to determine the new total
      const lastEntryAmount = (await sponsorDashboardStats).earningsTimeline.length > 0
        ? (await sponsorDashboardStats).earningsTimeline[(await sponsorDashboardStats).earningsTimeline.length - 1].amount
        : 0;

      (await sponsorDashboardStats).earningsTimeline.push({
        date: today,
        amount: lastEntryAmount + netBonusAmount
      });
    }

    // Add to recent transactions
    if ((await sponsorDashboardStats).recentTransactions.length > 10) {
      // Keep only the 10 most recent transactions
      (await
        // Keep only the 10 most recent transactions
        sponsorDashboardStats).recentTransactions.pop();
    }

    // Add all related transactions to the recent list
    (await
      // Add all related transactions to the recent list
      sponsorDashboardStats).recentTransactions.unshift(transaction);
    (await sponsorDashboardStats).recentTransactions.unshift(tdsTransaction);
    (await sponsorDashboardStats).recentTransactions.unshift(adminTransaction);
    (await sponsorDashboardStats).recentTransactions.unshift(repurchaseTransaction);

    // Limit to 10 recent transactions
    if ((await sponsorDashboardStats).recentTransactions.length > 10) {
      (await sponsorDashboardStats).recentTransactions = (await sponsorDashboardStats).recentTransactions.slice(0, 10);
    }

    // Update the sponsor's dashboard stats
    setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${sponsorId}`, sponsorDashboardStats);
  }

  console.log(`Added referral bonus for ${referredUserName}:`);
  console.log(`Gross amount: ${grossBonusAmount}, Net after deductions: ${netBonusAmount}`);
  console.log(`Deductions: TDS: ${tdsFee}, Admin: ${adminFee}, Repurchase: ${repurchaseAllocation}`);
};

// Function to check for missing referral bonuses and add them if needed
export const checkAndUpdateMissingReferralBonuses = async (userId: string): Promise<void>  => {
    const allUsers = await getAllUsers();
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  console.log(`Checking for missing referral bonuses for user ${user.name} (${userId})`);

  // Get all users who have this user as their sponsor
  //const allUsers = await getAllUsers();
  const referredUsers = allUsers.filter(u => {
    // Check if this user's referral code is the sponsor ID of another user
    return u.sponsorId &&
      (u.sponsorId === userId ||
        u.sponsorId.toUpperCase() === user.referralCode.toUpperCase());
  });

  if (referredUsers.length === 0) {
    console.log("No referred users found");
    return;
  }

  console.log(`Found ${referredUsers.length} users sponsored by ${user.name}`);

  // Get all existing referral bonus transactions for this user
  const userTransactions = await getUserTransactions(userId);
  const existingReferralBonuses = userTransactions.filter(
    t => t.type === 'referral_bonus' && t.status === 'completed'
  );

  // Check for each referred user if there's a corresponding referral bonus
  for (const referredUser of referredUsers) {
    const hasBonus = existingReferralBonuses.some(
      t => t.relatedUserId === referredUser.id
    );

    if (!hasBonus) {
      console.log(`No referral bonus found for referred user ${referredUser.name}, adding it now`);
      await addReferralBonusTransaction(userId, referredUser.id, referredUser.name);
    } else {
      console.log(`Referral bonus already exists for ${referredUser.name}`);
    }
  }
};

// Function to get a user wallet and ensure all referral bonuses are included
export const getUserWalletWithUpdatedBonuses = async (userId: string): Promise<Wallet> => {
  // First check and update any missing referral bonuses
  await checkAndUpdateMissingReferralBonuses(userId);
 const userWallet = await getUserWallet(userId);
  if (!userWallet) {
    throw new Error("Failed to fetch user wallet.");
  }
  // Then return the updated wallet
  return userWallet
};

// Function to create and add a team matching bonus transaction
export const addTeamMatchingBonus = async(userId: string, pairs: number): Promise<void> => {
  const commissionStructure = getCommissionStructure();
  const bonusPerPair = commissionStructure.teamMatchingBonus || 2500;
  const dailyCap = commissionStructure.teamMatchingDailyCap || 20;
  const firstMatchingBonus = commissionStructure.firstMatchingBonus || 500;

  // --- NEW: Enforce daily cap per user per day ---
  const userTransactions = await getUserTransactions(userId);
  const today = new Date().toISOString().split('T')[0];
  const todaysPairsCredited = userTransactions
    .filter(t => t.type === 'team_matching' && t.status === 'completed' && t.date.startsWith(today))
    .reduce((sum, t) => sum + (t.pairs || 0), 0);
  const remainingPairs = Math.max(0, dailyCap - todaysPairsCredited);
  const actualPairs = Math.min(pairs, remainingPairs);
  if (actualPairs <= 0) {
    console.log(`Daily cap reached for user ${userId}. No more team matching bonuses will be credited today.`);
    return;
  }

  // --- Check if this is the user's first ever pair ---
  const hasReceivedTeamMatching = userTransactions.some(
    t => t.type === 'team_matching' && t.status === 'completed'
  );

  // If this is the first time, credit the first matching bonus
  if (!hasReceivedTeamMatching && actualPairs > 0) {
    const firstBonusTransaction: Transaction = {
      id: `first-matching-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: userId,
      amount: firstMatchingBonus,
      type: 'team_matching',
      description: 'First matching bonus (one-time)',
      date: new Date().toISOString(),
      status: 'completed',
      pairs: 1
    };
    await addTransaction(firstBonusTransaction);
  }

  // Calculate gross bonus amount
  const grossBonusAmount = actualPairs * bonusPerPair;

  // Calculate deductions
  const tdsFee = grossBonusAmount * 0.05;
  const adminFee = grossBonusAmount * 0.10;
  const repurchaseAllocation = grossBonusAmount * 0.03;

  // Calculate net amount after deductions
  const netBonusAmount = grossBonusAmount - tdsFee - adminFee - repurchaseAllocation;

  // Create a new transaction for the net bonus amount
  const transaction: Transaction = {
    id: `tm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: netBonusAmount,
    type: 'team_matching',
    description: `Team matching bonus for ${actualPairs} pair${actualPairs !== 1 ? 's' : ''} (after deductions)`,
    date: new Date().toISOString(),
    status: 'completed',
    pairs: actualPairs
  };

  // DEBUG: Log transaction before adding
  console.log('DEBUG: About to add team_matching transaction:', transaction);
  try {
    await addTransaction(transaction);
    console.log('DEBUG: team_matching transaction successfully added!');
  } catch (error) {
    console.error('DEBUG: Failed to add team_matching transaction:', error);
  }

  // Create separate transactions for tracking the deductions
  const tdsTransaction: Transaction = {
    id: `tm-tds-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -tdsFee, // Negative amount as it's a deduction
    type: 'team_matching',
    description: `5% TDS on team matching bonus for ${actualPairs} pair${actualPairs !== 1 ? 's' : ''}`,
    date: new Date().toISOString(),
    status: 'completed'
  };
  // DEBUG: Log TDS transaction before adding
  console.log('DEBUG: About to add TDS deduction transaction:', tdsTransaction);
  try {
    await addTransaction(tdsTransaction);
    console.log('DEBUG: TDS deduction transaction successfully added!');
  } catch (error) {
    console.error('DEBUG: Failed to add TDS deduction transaction:', error);
  }

  const adminTransaction: Transaction = {
    id: `tm-admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -adminFee, // Negative amount as it's a deduction
    type: 'team_matching',
    description: `10% Admin fee on team matching bonus for ${actualPairs} pair${actualPairs !== 1 ? 's' : ''}`,
    date: new Date().toISOString(),
    status: 'completed'
  };
  // DEBUG: Log Admin transaction before adding
  console.log('DEBUG: About to add Admin deduction transaction:', adminTransaction);
  try {
    await addTransaction(adminTransaction);
    console.log('DEBUG: Admin deduction transaction successfully added!');
  } catch (error) {
    console.error('DEBUG: Failed to add Admin deduction transaction:', error);
  }

  const repurchaseTransaction: Transaction = {
    id: `tm-repurch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -repurchaseAllocation, // Negative amount as it's a deduction
    type: 'repurchase_bonus',
    description: `3% Repurchase allocation from team matching bonus for ${actualPairs} pair${actualPairs !== 1 ? 's' : ''}`,
    date: new Date().toISOString(),
    status: 'completed'
  };
  // DEBUG: Log Repurchase transaction before adding
  console.log('DEBUG: About to add Repurchase deduction transaction:', repurchaseTransaction);
  try {
    await addTransaction(repurchaseTransaction);
    console.log('DEBUG: Repurchase deduction transaction successfully added!');
  } catch (error) {
    console.error('DEBUG: Failed to add Repurchase deduction transaction:', error);
  }

  // Get the admin user (for admin fee allocation)
  const allUsers = await getAllUsers();
  const adminUser: User | undefined = allUsers.find((user: User) => user.email === 'admin@example.com'); // Assuming admin has this email

  if (adminUser) {
    // Add the admin fee to the admin's wallet
    const adminBonusTransaction: Transaction = {
      id: `tm-admin-bonus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: adminUser.id,
      amount: adminFee,
      type: 'team_matching',
      description: `Admin fee from team matching bonus (${actualPairs} pair${actualPairs !== 1 ? 's' : ''})`,
      date: new Date().toISOString(),
      status: 'completed',
      relatedUserId: userId
    };

    addTransaction(adminBonusTransaction);

    // Update admin's dashboard stats
    const adminDashboardStats = getUserDashboardStats(adminUser.id);
    if (adminDashboardStats) {
      // Update total earnings
      (await
        // Update total earnings
        adminDashboardStats).totalEarnings += adminFee;

      // Update earnings by type
      (await
        // Update earnings by type
        adminDashboardStats).earningsByType.team_matching =
        ((await adminDashboardStats).earningsByType.team_matching || 0) + adminFee;

      // Add to admin's recent transactions
      if ((await adminDashboardStats).recentTransactions.length > 10) {
        // Keep only the 10 most recent transactions
        (await
          // Keep only the 10 most recent transactions
          adminDashboardStats).recentTransactions.pop();
      }
      (await adminDashboardStats).recentTransactions.unshift(adminBonusTransaction);

      // Update the admin's dashboard stats
      setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${adminUser.id}`, adminDashboardStats);
    }
  }

  // Update the user's dashboard stats with the net amount
  const userDashboardStats = getUserDashboardStats(userId);
  if (userDashboardStats) {
    // Add to earnings timeline with the net effect
    const today = new Date().toISOString().split('T')[0];
    const timelineIndex = (await userDashboardStats).earningsTimeline.findIndex(
      entry => entry.date === today
    );

    if (timelineIndex >= 0) {
      // Update existing entry for today
      (await
        // Update existing entry for today
        userDashboardStats).earningsTimeline[timelineIndex].amount += netBonusAmount;
    } else {
      // Add new entry for today
      // Find the last entry to determine the new total
      const lastEntryAmount = (await userDashboardStats).earningsTimeline.length > 0
        ? (await userDashboardStats).earningsTimeline[(await userDashboardStats).earningsTimeline.length - 1].amount
        : 0;

      (await userDashboardStats).earningsTimeline.push({
        date: today,
        amount: lastEntryAmount + netBonusAmount
      });
    }

    // Add to recent transactions
    if ((await userDashboardStats).recentTransactions.length > 10) {
      // Keep only the 10 most recent transactions
      (await
        // Keep only the 10 most recent transactions
        userDashboardStats).recentTransactions.pop();
    }

    // Add all related transactions to the recent list
    (await
      // Add all related transactions to the recent list
      userDashboardStats).recentTransactions.unshift(transaction);
    (await userDashboardStats).recentTransactions.unshift(tdsTransaction);
    (await userDashboardStats).recentTransactions.unshift(adminTransaction);
    (await userDashboardStats).recentTransactions.unshift(repurchaseTransaction);

    // Limit to 10 recent transactions
    if ((await userDashboardStats).recentTransactions.length > 10) {
      (await userDashboardStats).recentTransactions = (await userDashboardStats).recentTransactions.slice(0, 10);
    }

    // Update the user's dashboard stats
    setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${userId}`, userDashboardStats);
  }

  console.log(`Added team matching bonus for ${actualPairs} pair${actualPairs !== 1 ? 's' : ''}:`);
  console.log(`Gross amount: ${grossBonusAmount}, Net after deductions: ${netBonusAmount}`);
  console.log(`Deductions: TDS: ${tdsFee}, Admin: ${adminFee}, Repurchase: ${repurchaseAllocation}`);

  // Check if user has achieved any milestone rewards based on total pairs
  checkAndAddMilestoneRewards(userId, actualPairs);
};

// Function to check and add milestone rewards based on pair achievements
const checkAndAddMilestoneRewards = async (userId: string, newPairs: number): Promise<void> => {
  const commissionStructure = getCommissionStructure();
  if (!commissionStructure.milestoneRewards || !commissionStructure.milestoneRewards.pairs) {
    return;
  }

  // Get user's total pairs achieved so far (including the new ones)
  const userTransactions = await getUserTransactions(userId);
  const teamMatchingTransactions = userTransactions.filter(t =>
    t.type === 'team_matching' && t.status === 'completed' && t.pairs
  );

  // Sum up all pairs from transactions
  const totalPairsAchieved = teamMatchingTransactions.reduce((sum, t) => sum + (t.pairs || 0), 0);

  // Check if user has reached any milestone
  const milestones = Object.keys(commissionStructure.milestoneRewards.pairs)
    .map(Number)
    .sort((a, b) => a - b);

  for (const milestone of milestones) {
    // Check if this milestone has been achieved
    if (totalPairsAchieved >= milestone) {
      // Check if this milestone has already been rewarded
      const alreadyRewarded = userTransactions.some(t =>
        t.type === 'award_reward' &&
        t.description.includes(`milestone reward for achieving ${milestone} pairs`)
      );

      if (!alreadyRewarded) {
        // Add milestone reward
        const reward = commissionStructure.milestoneRewards.pairs[milestone];
        const rewardDescription = `${reward.type}: ${reward.value}`;

        // Calculate a symbolic amount for record-keeping
        // In a real system, this might be handled differently
        let rewardAmount = 0;
        if (typeof reward.value === 'string' && reward.value.includes('₹')) {
          // Try to extract amount from strings like "₹15,00,000 Insurance"
          const match = reward.value.match(/₹([0-9,]+)/);
          if (match && match[1]) {
            // Remove commas and convert to number
            rewardAmount = parseFloat(match[1].replace(/,/g, ''));
          } else {
            // Default to a symbolic amount
            rewardAmount = milestone * 100;
          }
        } else if (typeof reward.value === 'number') {
          rewardAmount = reward.value;
        } else {
          // Default to a symbolic amount
          rewardAmount = milestone * 100;
        }

        // Create reward transaction
        const rewardTransaction: Transaction = {
          id: `reward-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: userId,
          amount: rewardAmount,
          type: 'award_reward',
          description: `${reward.type} milestone reward for achieving ${milestone} pairs: ${reward.value}`,
          date: new Date().toISOString(),
          status: 'completed'
        };

        await addTransaction(rewardTransaction);

        console.log(`Added milestone reward for ${userId}: ${rewardDescription}`);
      }
    }
  }
};

// Function to calculate and add royalty bonus based on company turnover
export const addRoyaltyBonus = async (userId: string, turnoverAmount: number): Promise<void> => {
  // Get the commission structure to determine the bonus percentage
  const commissionStructure = getCommissionStructure();
  const royaltyPercentage = commissionStructure.royaltyBonus / 100 || 0.02; // Default to 2% if not set

  // Calculate gross bonus amount
  const grossBonusAmount = turnoverAmount * royaltyPercentage;

  // Calculate deductions
  const tdsFee = grossBonusAmount * 0.05; // 5% TDS
  const adminFee = grossBonusAmount * 0.10; // 10% Admin fee
  const repurchaseAllocation = grossBonusAmount * 0.03; // 3% Repurchase allocation

  // Calculate net amount after deductions
  const netBonusAmount = grossBonusAmount - tdsFee - adminFee - repurchaseAllocation;

  // Format date for description
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long' });

  // Create a new transaction for the net bonus amount
  const transaction: Transaction = {
    id: `royalty-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: netBonusAmount,
    type: 'royalty_bonus',
    description: `Royalty bonus (${commissionStructure.royaltyBonus}%) from ${monthName} company turnover (after deductions)`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  // Create separate transactions for tracking the deductions
  const tdsTransaction: Transaction = {
    id: `royalty-tds-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -tdsFee, // Negative amount as it's a deduction
    type: 'royalty_bonus',
    description: `5% TDS on royalty bonus for ${monthName}`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  const adminTransaction: Transaction = {
    id: `royalty-admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -adminFee, // Negative amount as it's a deduction
    type: 'royalty_bonus',
    description: `10% Admin fee on royalty bonus for ${monthName}`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  const repurchaseTransaction: Transaction = {
    id: `royalty-repurch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -repurchaseAllocation, // Negative amount as it's a deduction
    type: 'repurchase_bonus',
    description: `3% Repurchase allocation from royalty bonus for ${monthName}`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  // Add all transactions
  addTransaction(transaction);
  addTransaction(tdsTransaction);
  addTransaction(adminTransaction);
  addTransaction(repurchaseTransaction);

  // Get the admin user (for admin fee allocation)
  const allUsers = await getAllUsers();
  const adminUser: User | undefined = allUsers.find((user: User) => user.email === 'admin@example.com'); // Assuming admin has this email

  if (adminUser) {
    // Add the admin fee to the admin's wallet
    const adminBonusTransaction: Transaction = {
      id: `royalty-admin-bonus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: adminUser.id,
      amount: adminFee,
      type: 'royalty_bonus',
      description: `Admin fee from royalty bonus for ${monthName}`,
      date: new Date().toISOString(),
      status: 'completed',
      relatedUserId: userId
    };

    addTransaction(adminBonusTransaction);

    // Update admin's dashboard stats
    const adminDashboardStats = getUserDashboardStats(adminUser.id);
    if (adminDashboardStats) {
      // Update total earnings
      (await
        // Update total earnings
        adminDashboardStats).totalEarnings += adminFee;

      // Update earnings by type
      (await
        // Update earnings by type
        adminDashboardStats).earningsByType.royalty_bonus =
        ((await adminDashboardStats).earningsByType.royalty_bonus || 0) + adminFee;

      // Add to admin's recent transactions
      if ((await adminDashboardStats).recentTransactions.length > 10) {
        // Keep only the 10 most recent transactions
        (await
          // Keep only the 10 most recent transactions
          adminDashboardStats).recentTransactions.pop();
      }
      (await adminDashboardStats).recentTransactions.unshift(adminBonusTransaction);

      // Update the admin's dashboard stats
      setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${adminUser.id}`, adminDashboardStats);
    }
  }

  // Update the user's dashboard stats with the net amount
  const userDashboardStats = getUserDashboardStats(userId);
  if (userDashboardStats) {
    // Add to earnings timeline with the net effect
    const today = new Date().toISOString().split('T')[0];
    const timelineIndex = (await userDashboardStats).earningsTimeline.findIndex(
      entry => entry.date === today
    );

    if (timelineIndex >= 0) {
      // Update existing entry for today
      (await
        // Update existing entry for today
        userDashboardStats).earningsTimeline[timelineIndex].amount += netBonusAmount;
    } else {
      // Add new entry for today
      // Find the last entry to determine the new total
      const lastEntryAmount = (await userDashboardStats).earningsTimeline.length > 0
        ? (await userDashboardStats).earningsTimeline[(await userDashboardStats).earningsTimeline.length - 1].amount
        : 0;

      (await userDashboardStats).earningsTimeline.push({
        date: today,
        amount: lastEntryAmount + netBonusAmount
      });
    }

    // Add to recent transactions
    if ((await userDashboardStats).recentTransactions.length > 10) {
      // Keep only the 10 most recent transactions
      (await
        // Keep only the 10 most recent transactions
        userDashboardStats).recentTransactions.pop();
    }

    // Add all related transactions to the recent list
    (await
      // Add all related transactions to the recent list
      userDashboardStats).recentTransactions.unshift(transaction);
    (await userDashboardStats).recentTransactions.unshift(tdsTransaction);
    (await userDashboardStats).recentTransactions.unshift(adminTransaction);
    (await userDashboardStats).recentTransactions.unshift(repurchaseTransaction);

    // Limit to 10 recent transactions
    if ((await userDashboardStats).recentTransactions.length > 10) {
      (await userDashboardStats).recentTransactions = (await userDashboardStats).recentTransactions.slice(0, 10);
    }

    // Update the user's dashboard stats
    setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${userId}`, userDashboardStats);
  }

  console.log(`Added royalty bonus for ${userId} based on ${turnoverAmount} turnover:`);
  console.log(`Gross amount: ${grossBonusAmount}, Net after deductions: ${netBonusAmount}`);
  console.log(`Deductions: TDS: ${tdsFee}, Admin: ${adminFee}, Repurchase: ${repurchaseAllocation}`);
};

// Function to calculate and add repurchase bonus
export const addRepurchaseBonus = async (userId: string, productAmount: number, productName: string): Promise<void> => {
  // Get the commission structure to determine the bonus percentage
  const commissionStructure = getCommissionStructure();
  const repurchasePercentage = commissionStructure.repurchaseBonus / 100 || 0.03; // Default to 3% if not set

  // Calculate gross bonus amount
  const grossBonusAmount = productAmount * repurchasePercentage;

  // Calculate deductions
  const tdsFee = grossBonusAmount * 0.05; // 5% TDS
  const adminFee = grossBonusAmount * 0.10; // 10% Admin fee

  // Calculate net amount after deductions
  const netBonusAmount = grossBonusAmount - tdsFee - adminFee;

  // Create a new transaction for the net bonus amount
  const transaction: Transaction = {
    id: `repurch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: netBonusAmount,
    type: 'repurchase_bonus',
    description: `Repurchase bonus (${commissionStructure.repurchaseBonus}%) for ${productName} (after deductions)`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  // Create separate transactions for tracking the deductions
  const tdsTransaction: Transaction = {
    id: `repurch-tds-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -tdsFee, // Negative amount as it's a deduction
    type: 'repurchase_bonus',
    description: `5% TDS on repurchase bonus for ${productName}`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  const adminTransaction: Transaction = {
    id: `repurch-admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId,
    amount: -adminFee, // Negative amount as it's a deduction
    type: 'repurchase_bonus',
    description: `10% Admin fee on repurchase bonus for ${productName}`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  // Add all transactions
  addTransaction(transaction);
  addTransaction(tdsTransaction);
  addTransaction(adminTransaction);

  // Get the admin user (for admin fee allocation)
  const allUsers = getAllUsers();
  const adminUser: User | undefined = (await allUsers).find((user: User) => user.email === 'admin@example.com'); // Assuming admin has this email

  if (adminUser) {
    // Add the admin fee to the admin's wallet
    const adminBonusTransaction: Transaction = {
      id: `repurch-admin-bonus-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: adminUser.id,
      amount: adminFee,
      type: 'repurchase_bonus',
      description: `Admin fee from repurchase bonus for ${productName}`,
      date: new Date().toISOString(),
      status: 'completed',
      relatedUserId: userId
    };

    addTransaction(adminBonusTransaction);

    // Update admin's dashboard stats
    const adminDashboardStats = getUserDashboardStats(adminUser.id);
    if (adminDashboardStats) {
      // Update total earnings
      (await
        // Update total earnings
        adminDashboardStats).totalEarnings += adminFee;

      // Update earnings by type
      (await
        // Update earnings by type
        adminDashboardStats).earningsByType.repurchase_bonus =
        ((await adminDashboardStats).earningsByType.repurchase_bonus || 0) + adminFee;

      // Add to admin's recent transactions
      if ((await adminDashboardStats).recentTransactions.length > 10) {
        // Keep only the 10 most recent transactions
        (await
          // Keep only the 10 most recent transactions
          adminDashboardStats).recentTransactions.pop();
      }}
  }

  // Update the user's dashboard stats with the net amount
  const userDashboardStats = getUserDashboardStats(userId);
  if (userDashboardStats) {
    // Add to earnings timeline with the net effect
    const today = new Date().toISOString().split('T')[0];
    const timelineIndex = (await userDashboardStats).earningsTimeline.findIndex(
      entry => entry.date === today
    );

    if (timelineIndex >= 0) {
      // Update existing entry for today
      (await
        // Update existing entry for today
        userDashboardStats).earningsTimeline[timelineIndex].amount += netBonusAmount;
    } else {
      // Add new entry for today
      // Find the last entry to determine the new total
      const lastEntryAmount = (await userDashboardStats).earningsTimeline.length > 0
        ? (await userDashboardStats).earningsTimeline[(await userDashboardStats).earningsTimeline.length - 1].amount
        : 0;

      (await userDashboardStats).earningsTimeline.push({
        date: today,
        amount: lastEntryAmount + netBonusAmount
      });
    }

    // Add to recent transactions
    if ((await userDashboardStats).recentTransactions.length > 10) {
      // Keep only the 10 most recent transactions
      (await
        // Keep only the 10 most recent transactions
        userDashboardStats).recentTransactions.pop();
    }

    // Add all related transactions to the recent list
    (await
      // Add all related transactions to the recent list
      userDashboardStats).recentTransactions.unshift(transaction);
    (await userDashboardStats).recentTransactions.unshift(tdsTransaction);
    (await userDashboardStats).recentTransactions.unshift(adminTransaction);

    // Limit to 10 recent transactions
    if ((await userDashboardStats).recentTransactions.length > 10) {
      (await userDashboardStats).recentTransactions = (await userDashboardStats).recentTransactions.slice(0, 10);
    }

    // Update the user's dashboard stats
    setToStorage(`${STORAGE_KEYS.DASHBOARD_STATS}_${userId}`, userDashboardStats);
  }

  console.log(`Added repurchase bonus for ${userId} based on ${productAmount} product cost:`);
  console.log(`Gross amount: ${grossBonusAmount}, Net after deductions: ${netBonusAmount}`);
  console.log(`Deductions: TDS: ${tdsFee}, Admin: ${adminFee}`);
};

// Clear all data from local storage
export const clearLocalDatabase = async (): Promise<void> => {
  try {
    // Clear all MLM-related data using storage keys
    Object.values(STORAGE_KEYS).forEach((key: string) => {
      safeRemoveItem(key);
    });

    // Clear any user-specific data
    const users = await getAllUsers();
    users.forEach((user: User) => {
      const userSpecificKeys = [
        `${STORAGE_KEYS.NETWORK_MEMBERS}_${user.id}`,
        `${STORAGE_KEYS.NETWORK_STATS}_${user.id}`,
        `${STORAGE_KEYS.WALLET}_${user.id}`,
        `${STORAGE_KEYS.DASHBOARD_STATS}_${user.id}`
      ];

      userSpecificKeys.forEach((key: string) => {
        safeRemoveItem(key);
      });
    });

    // Clear orders
    safeRemoveItem('value_life_orders');

    console.log('Local database cleared successfully');
  } catch (error) {
    console.error('Error clearing local database:', error);
  }
};

// Add a default export with all the exported functions
export default {
  STORAGE_KEYS,
  initializeLocalStorage,
  isLocalStorageAvailable,
  getFromStorage,
  setToStorage,
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  addUser,
  getUserNetworkMembers,
  getUserNetworkStats,
  getUserWallet,
  getUserDashboardStats,
  getAllTransactions,
  getUserTransactions,
  addTransaction,
  getNetworkMembers,
  updateNetworkMembers,
  getNetworkStats,
  updateNetworkStats,
  getDashboardStats,
  updateDashboardStats,
  getWallet,
  updateWallet,
  getCommissionStructure,
  updateCommissionStructure,
  getAllKycRequests,
  addKycRequest,
  updateKycRequest,
  addNewUserWithData,
  getAllUsersForAdmin,
  deleteUser,
  updateUserKycStatus,
  getAdminStats,
  updateUserProfile,
  processWithdrawalRequest,
  validateAdminCredentials,
  updateAdminCredentials,
  getUserData,
  getKycDocuments,
  saveLastKycStatus,
  getKycSubmissionHistory,
  addKycSubmission,
  saveKycDocuments,
  addReferralBonusTransaction,
  checkAndUpdateMissingReferralBonuses,
  getUserWalletWithUpdatedBonuses,
  addTeamMatchingBonus,
  checkAndAddMilestoneRewards,
  addRoyaltyBonus,
  addRepurchaseBonus,
  clearLocalDatabase
};

/**
 * Check if a position (left/right) is available under a sponsor/referrer in the network tree.
 * @param sponsorId - The sponsor's user ID
 * @param position - 'left' or 'right'
 * @param isReferral - If true, check the deepest available spot (for referral code registration)
 * @returns Promise<boolean> - true if available, false if occupied
 */
export const isNetworkPositionAvailable = async (
  sponsorId: string,
  position: 'left' | 'right',
  isReferral: boolean = false
): Promise<boolean> => {
  // Always return true since we now allow unlimited referrals
  return true;
};

// Retroactive team matching bonus check for all users
export const checkAndAwardAllTeamMatchingBonuses = async () => {
  const allUsers = await getAllUsers();
  for (const sponsor of allUsers) {
    // Find left and right children who are active
    const leftChild = allUsers.find(u => u.sponsorId === sponsor.distributorId && u.position === 'left');
    const rightChild = allUsers.find(u => u.sponsorId === sponsor.distributorId && u.position === 'right');

    console.log(`Sponsor: ${sponsor.name} (${sponsor.distributorId})`);
    if (leftChild) {
      console.log(`  Left Child: ${leftChild.name} (active: ${leftChild.active})`);
    } else {
      console.log('  Left Child: NONE');
    }
    if (rightChild) {
      console.log(`  Right Child: ${rightChild.name} (active: ${rightChild.active})`);
    } else {
      console.log('  Right Child: NONE');
    }

    if (leftChild && leftChild.active && rightChild && rightChild.active) {
      // Check if sponsor already received team matching bonus for this pair
      const transactions = await getUserTransactions(sponsor.id);
      const hasPairBonus = transactions.some(
        t => t.type === 'team_matching' && t.status === 'completed' && t.pairs === 1
      );
      if (!hasPairBonus) {
        await addTeamMatchingBonus(sponsor.id, 1);
      }
    }
  }
};

// Mark a user as active and check for all team matching bonuses
export const markUserAsActiveAndCheckBonuses = async (userId: string): Promise<void> => {
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return;
  users[userIndex].active = true;
  setToStorage(STORAGE_KEYS.USERS, users);
  await checkAndAwardAllTeamMatchingBonuses();
};

// Debug function: Print all users and their team matching bonus status
export const printTeamMatchingBonusStatus = async () => {
  const allUsers = await getAllUsers();
  for (const sponsor of allUsers) {
    const leftChild = allUsers.find(u => u.sponsorId === sponsor.distributorId && u.position === 'left');
    const rightChild = allUsers.find(u => u.sponsorId === sponsor.distributorId && u.position === 'right');
    const leftActive = leftChild?.active ? '✅' : '❌';
    const rightActive = rightChild?.active ? '✅' : '❌';
    const transactions = await getUserTransactions(sponsor.id);
    const hasPairBonus = transactions.some(
      t => t.type === 'team_matching' && t.status === 'completed' && t.pairs === 1
    );
    const bonusStatus = hasPairBonus ? 'BONUS RECEIVED 🎉' : 'NO BONUS';
    console.log(`Sponsor: ${sponsor.name} (${sponsor.id}) | Left: ${leftChild?.name || '-'} ${leftActive} | Right: ${rightChild?.name || '-'} ${rightActive} | ${bonusStatus}`);
  }
};

// Debug utility: Flatten a NetworkMember tree to a users array with sponsorId, position, and active fields
export const flattenNetworkMembersToUsers = (
  networkMember: NetworkMember,
  sponsorId: string | null = null,
  position: 'left' | 'right' | undefined = undefined
): User[] => {
  const users: User[] = [];
  users.push({
    id: networkMember.id,
    name: networkMember.name,
    distributorId: networkMember.referralCode,
    sponsorId: sponsorId,
    position: position,
    active: networkMember.active,
    email: '',
    phone: '',
    address: '',
    profilePicture: networkMember.profilePicture || '',
    referralCode: networkMember.referralCode,
    registrationDate: networkMember.joinDate || '',
    kycStatus: 'pending',
    kycDocuments: {},
    bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' },
  });
  if (networkMember.children && networkMember.children.length > 0) {
    if (networkMember.children[0]) {
      users.push(...flattenNetworkMembersToUsers(networkMember.children[0], networkMember.referralCode, 'left'));
    }
    if (networkMember.children[1]) {
      users.push(...flattenNetworkMembersToUsers(networkMember.children[1], networkMember.referralCode, 'right'));
    }
    // If more than 2 children, treat as extra (no position)
    for (let i = 2; i < networkMember.children.length; i++) {
      users.push(...flattenNetworkMembersToUsers(networkMember.children[i], networkMember.referralCode, undefined));
    }
  }
  return users;
};

export const syncUsersFromNetworkTreeToJson = () => {
  const users = flattenNetworkMembersToUsers(networkMembers);
  const dbPath = path.resolve(__dirname, '../data/db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  db.users = users;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('Users array in db.json updated from network tree!');
};

export const hasReachedTeamMatchingDailyCap = async (userId: string): Promise<boolean> => {
  const commissionStructure = getCommissionStructure();
  const dailyCap = commissionStructure.teamMatchingDailyCap || 20;
  const userTransactions = await getUserTransactions(userId);
  const today = new Date().toISOString().split('T')[0];
  const todaysPairsCredited = userTransactions
    .filter(t => t.type === 'team_matching' && t.status === 'completed' && t.date.startsWith(today))
    .reduce((sum, t) => sum + (t.pairs || 0), 0);
  return todaysPairsCredited >= dailyCap;
};
