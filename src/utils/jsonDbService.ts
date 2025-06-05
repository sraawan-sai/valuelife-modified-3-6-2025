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

// API endpoint
const API_URL = 'http://localhost:3001/api/db';

// KYC Request interface
export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  documents: {
    idProof?: string;
    addressProof?: string;
    bankDetails?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  reviewDate?: string;
  reviewNotes?: string;
}

// KYC Submission interface
export interface KycSubmission {
  documentType: string;
  status: KYCStatus;
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

// Generic fetch API function
const fetchApi = async (endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    return null;
  }
};

// Initialize database with mock data
export const initializeDatabase = async (): Promise<void> => {
  console.log('Initializing JSON database...');
  
  try {
    // Get the current database state
    const db = await fetchApi('');
    
    // If currentUser is null, initialize with mock data
    if (!db || !db.currentUser) {
      console.log('Initializing database with mock data');
      
      // Update each section with mock data
      await fetchApi('/currentUser', 'POST', currentUser);
      await fetchApi('/users', 'POST', [currentUser]);
      await fetchApi('/transactions', 'POST', transactions);
      await fetchApi('/networkMembers', 'POST', networkMembers);
      await fetchApi('/networkStats', 'POST', networkStats);
      await fetchApi('/dashboardStats', 'POST', dashboardStats);
      await fetchApi('/wallet', 'POST', wallet);
      await fetchApi('/commissionStructure', 'POST', commissionStructure);
      
      console.log('Database initialization complete');
    } else {
      console.log('Database already initialized');
    }
  } catch (error) {
    console.error('Fatal error during database initialization:', error);
  }
};

// Create fresh data structures for new users
const createFreshNetworkMember = (user: User): NetworkMember => {
  return {
    id: user.id,
    name: user.name,
    profilePicture: user.profilePicture,
    referralCode: user.referralCode,
    joinDate: user.registrationDate,
    active: true,
    children: []
  };
};

const createFreshNetworkStats = (): NetworkStats => {
  return {
    totalMembers: 0,
    directReferrals: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    levelWiseCount: { 1: 0 },
    dailyGrowth: [
      { date: new Date().toISOString().split('T')[0], count: 0 }
    ],
    weeklyGrowth: [
      { week: `Week ${Math.ceil(new Date().getDate() / 7)}`, count: 0 }
    ],
    monthlyGrowth: [
      { month: new Date().toLocaleString('default', { month: 'short' }), count: 0 }
    ]
  };
};

const createFreshWallet = (userId: string): Wallet => {
  return {
    userId,
    balance: 0,
    transactions: []
  };
};

const createFreshDashboardStats = (): DashboardStats => {
  return {
    totalEarnings: 0,
    pendingWithdrawals: 0,
    completedWithdrawals: 0,
    directReferrals: 0,
    teamSize: 0,
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
    earningsTimeline: [
      { date: new Date().toISOString().split('T')[0], amount: 0 }
    ]
  };
};

// User related functions
export const getCurrentUser = async (): Promise<User | null> => {
  const user = await fetchApi('/currentUser');
  return user;
};

export const updateCurrentUser = async (user: User): Promise<void> => {
  await fetchApi('/currentUser/update', 'POST', user);
};

export const getAllUsers = async (): Promise<User[]> => {
  const users = await fetchApi('/users');
  return users || [];
};

export const addUser = async (user: User): Promise<void> => {
  const users = await getAllUsers();
  users.push(user);
  await fetchApi('/users', 'POST', users);
};

// Network related functions
export const getUserNetworkMembers = async (userId: string): Promise<NetworkMember> => {
  const networkMembers = await fetchApi('/networkMembers');
  
  if (!networkMembers) {
    return createFreshNetworkMember(await getCurrentUser() as User);
  }
  
  const findMemberById = (member: NetworkMember, id: string): NetworkMember | null => {
    if (member.id === id) return member;
    
    if (member.children) {
      for (const child of member.children) {
        const found = findMemberById(child, id);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  const currentUser = await getCurrentUser();
  
  if (userId === currentUser?.id) {
    return networkMembers;
  }
  
  const member = findMemberById(networkMembers, userId);
  const users = await getAllUsers();
  return member || createFreshNetworkMember(users.find(u => u.id === userId) || currentUser as User);
};

export const getUserNetworkStats = async (userId: string): Promise<NetworkStats> => {
  const networkStats = await fetchApi('/networkStats');
  const currentUser = await getCurrentUser();
  
  if (userId === currentUser?.id) {
    return networkStats || createFreshNetworkStats();
  }
  
  // For other users, return empty stats (would calculate in a real app)
  return createFreshNetworkStats();
};

export const getUserWallet = async (userId: string): Promise<Wallet> => {
  const wallet = await fetchApi('/wallet');
  const transactions = await fetchApi('/transactions');
  const currentUser = await getCurrentUser();
  
  if (userId === currentUser?.id) {
    return wallet || createFreshWallet(userId);
  }
  
  // For other users, create a wallet based on their transactions
  if (transactions) {
    const userTransactions = transactions.filter((t: Transaction) => t.userId === userId);
    return {
      userId,
      balance: userTransactions
        .filter((t: Transaction) => t.status === 'completed')
        .reduce((sum: number, t: Transaction) => 
          sum + (t.type === 'withdrawal' ? -t.amount : t.amount), 0),
      transactions: userTransactions
    };
  }
  
  return createFreshWallet(userId);
};

export const getUserDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const dashboardStats = await fetchApi('/dashboardStats');
  const currentUser = await getCurrentUser();
  
  if (userId === currentUser?.id) {
    return dashboardStats || createFreshDashboardStats();
  }
  
  // For other users, return empty stats
  return createFreshDashboardStats();
};

// Transaction related functions
export const getAllTransactions = async (): Promise<Transaction[]> => {
  const transactions = await fetchApi('/transactions');
  return transactions || [];
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const transactions = await getAllTransactions();
  return transactions.filter(t => t.userId === userId);
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  const transactions = await getAllTransactions();
  transactions.push(transaction);
  await fetchApi('/transactions', 'POST', transactions);
  
  // Update wallet balance and transactions
  await updateWalletAfterTransaction(transaction);
  
  // Update dashboard stats
  const dashboardStats = await fetchApi('/dashboardStats');
  if (dashboardStats) {
    const allTransactions = await getAllTransactions();
    dashboardStats.recentTransactions = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    await fetchApi('/dashboardStats', 'POST', dashboardStats);
  }
};

const updateWalletAfterTransaction = async (transaction: Transaction): Promise<void> => {
  const currentUser = await getCurrentUser();
  
  if (transaction.userId === currentUser?.id) {
    const wallet = await fetchApi('/wallet');
    const dashboardStats = await fetchApi('/dashboardStats');
    
    if (wallet && dashboardStats) {
      // Only update balance for completed transactions
      if (transaction.status === 'completed') {
        // For withdrawals, subtract from balance
        if (transaction.type === 'withdrawal') {
          wallet.balance -= transaction.amount;
        } else {
          wallet.balance += transaction.amount;
        }
      }
      
      // Add to wallet transactions
      if (!wallet.transactions.find((t: Transaction) => t.id === transaction.id)) {
        wallet.transactions.push(transaction);
      }
      
      // Update dashboard stats
      if (transaction.status === 'completed') {
        // Update earnings by type
        dashboardStats.earningsByType[transaction.type] += 
          (transaction.type === 'withdrawal' ? -transaction.amount : transaction.amount);
        
        // Update total earnings
        if (transaction.type !== 'withdrawal' && transaction.type !== 'withdrawal_reversal') {
          dashboardStats.totalEarnings += transaction.amount;
        }
        
        // Update withdrawals
        if (transaction.type === 'withdrawal') {
          dashboardStats.completedWithdrawals += transaction.amount;
        }
      } else if (transaction.status === 'pending' && transaction.type === 'withdrawal') {
        dashboardStats.pendingWithdrawals += transaction.amount;
      }
      
      await fetchApi('/wallet', 'POST', wallet);
      await fetchApi('/dashboardStats', 'POST', dashboardStats);
    }
  }
};

// Network related functions
export const getNetworkMembers = async (): Promise<NetworkMember> => {
  const networkMembers = await fetchApi('/networkMembers');
  return networkMembers || {
    id: '',
    name: '',
    referralCode: '',
    joinDate: '',
    active: false,
    children: []
  };
};

export const updateNetworkMembers = async (networkMember: NetworkMember): Promise<void> => {
  await fetchApi('/networkMembers', 'POST', networkMember);
};

export const getNetworkStats = async (): Promise<NetworkStats> => {
  const networkStats = await fetchApi('/networkStats');
  return networkStats || createFreshNetworkStats();
};

export const updateNetworkStats = async (stats: NetworkStats): Promise<void> => {
  await fetchApi('/networkStats', 'POST', stats);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const dashboardStats = await fetchApi('/dashboardStats');
  return dashboardStats || createFreshDashboardStats();
};

export const updateDashboardStats = async (stats: DashboardStats): Promise<void> => {
  await fetchApi('/dashboardStats', 'POST', stats);
};

export const getWallet = async (): Promise<Wallet> => {
  const wallet = await fetchApi('/wallet');
  return wallet || createFreshWallet('');
};

export const updateWallet = async (updatedWallet: Wallet): Promise<void> => {
  await fetchApi('/wallet', 'POST', updatedWallet);
};

export const getCommissionStructure = async (): Promise<CommissionStructure> => {
  const commissionStructure = await fetchApi('/commissionStructure');
  return commissionStructure || {
    retailProfit: { min: 10, max: 20 },
    directReferralBonus: 3000,
    firstMatchingBonus: 500,
    teamMatchingBonus: 2500,
    teamMatchingDailyCap: 20,
    royaltyBonus: 2,
    repurchaseBonus: 3,
    levelCommissions: {
      1: 0.07,
      2: 0.05,
      3: 0.03,
      4: 0.02,
      5: 0.01
    },
    tdsPercentage: 0.05,
    adminFeePercentage: 0.10,
    repurchasePercentage: 0.03,
    milestoneRewards: {
      pairs: {}
    }
  };
};

export const updateCommissionStructure = async (structure: CommissionStructure): Promise<void> => {
  await fetchApi('/commissionStructure', 'POST', structure);
};

// KYC Functions
export const getAllKycRequests = async (): Promise<KycRequest[]> => {
  const kycRequests = await fetchApi('/kycRequests');
  return kycRequests || [];
};

export const addKycRequest = async (request: KycRequest): Promise<void> => {
  await fetchApi('/kycRequests/add', 'POST', request);
};

export const updateKycRequest = async (updatedRequest: KycRequest): Promise<void> => {
  const kycRequests = await getAllKycRequests();
  const index = kycRequests.findIndex(r => r.id === updatedRequest.id);
  
  if (index !== -1) {
    kycRequests[index] = updatedRequest;
    await fetchApi('/kycRequests', 'POST', kycRequests);
    
    // If the request is for the current user, update their KYC status
    const users = await getAllUsers();
    const user = users.find(u => u.id === updatedRequest.userId);
    
    if (user) {
      user.kycStatus = updatedRequest.status;
      await fetchApi('/users', 'POST', users);
      
      // If this is the current user, update current user as well
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.id === user.id) {
        currentUser.kycStatus = updatedRequest.status;
        await updateCurrentUser(currentUser);
      }
    }
  }
};

// Add a new user with all required data structures
export const addNewUserWithData = async (user: User): Promise<void> => {
  // Add user to users array
  const users = await getAllUsers();
  users.push(user);
  await fetchApi('/users', 'POST', users);
  
  // If this user has a sponsor, update the sponsor's network
  if (user.sponsorId) {
    const networkMembers = await getNetworkMembers();
    const networkStats = await getNetworkStats();
    const dashboardStats = await getDashboardStats();
    const currentUser = await getCurrentUser();
    
    const updateNetworkRecursively = (member: NetworkMember): boolean => {
      if (member.id === user.sponsorId) {
        // Found the sponsor, add the new user as their child
        if (!member.children) {
          member.children = [];
        }
        
        member.children.push(createFreshNetworkMember(user));
        return true;
      }
      
      // Check children recursively
      if (member.children) {
        for (const child of member.children) {
          if (updateNetworkRecursively(child)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    // Start the recursive update from the root
    updateNetworkRecursively(networkMembers);
    await updateNetworkMembers(networkMembers);
    
    // Update network stats
    networkStats.totalMembers++;
    networkStats.activeMembers++;
    
    // Update daily/weekly/monthly growth
    const today = new Date().toISOString().split('T')[0];
    const currentWeek = `Week ${Math.ceil(new Date().getDate() / 7)}`;
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    
    // Update daily growth
    const dayIndex = networkStats.dailyGrowth.findIndex(d => d.date === today);
    if (dayIndex !== -1) {
      networkStats.dailyGrowth[dayIndex].count++;
    } else {
      networkStats.dailyGrowth.push({ date: today, count: 1 });
    }
    
    // Update weekly growth
    const weekIndex = networkStats.weeklyGrowth.findIndex(w => w.week === currentWeek);
    if (weekIndex !== -1) {
      networkStats.weeklyGrowth[weekIndex].count++;
    } else {
      networkStats.weeklyGrowth.push({ week: currentWeek, count: 1 });
    }
    
    // Update monthly growth
    const monthIndex = networkStats.monthlyGrowth.findIndex(m => m.month === currentMonth);
    if (monthIndex !== -1) {
      networkStats.monthlyGrowth[monthIndex].count++;
    } else {
      networkStats.monthlyGrowth.push({ month: currentMonth, count: 1 });
    }
    
    await updateNetworkStats(networkStats);
    
    // Update sponsor's direct referrals count if the sponsor is the current user
    if (user.sponsorId === currentUser?.id) {
      networkStats.directReferrals++;
      dashboardStats.directReferrals++;
      
      await updateDashboardStats(dashboardStats);
    }
  }
};

// Admin Functions
export const getAllUsersForAdmin = async (): Promise<User[]> => {
  return await getAllUsers();
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const currentUser = await getCurrentUser();
  
  // Cannot delete current user
  if (userId === currentUser?.id) {
    return false;
  }
  
  // Find and remove user
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return false;
  }
  
  // Remove user from users array
  users.splice(userIndex, 1);
  await fetchApi('/users', 'POST', users);
  
  // Remove user from network structure recursively
  const networkMembers = await getNetworkMembers();
  const networkStats = await getNetworkStats();
  
  const removeFromNetwork = (member: NetworkMember): void => {
    if (member.children) {
      // Check if any direct child matches the userId
      const childIndex = member.children.findIndex(child => child.id === userId);
      if (childIndex !== -1) {
        // Remove the child
        member.children.splice(childIndex, 1);
        return;
      }
      
      // Recursively check children's children
      for (const child of member.children) {
        removeFromNetwork(child);
      }
    }
  };
  
  removeFromNetwork(networkMembers);
  await updateNetworkMembers(networkMembers);
  
  // Update network stats
  networkStats.totalMembers--;
  await updateNetworkStats(networkStats);
  
  // Remove user's transactions
  const transactions = await getAllTransactions();
  const filteredTransactions = transactions.filter(t => t.userId !== userId);
  await fetchApi('/transactions', 'POST', filteredTransactions);
  
  return true;
};

export const updateUserKycStatus = async (userId: string, status: KYCStatus, reviewNotes?: string): Promise<boolean> => {
  // Find and update user
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return false;
  }
  
  // Update user's KYC status
  users[userIndex].kycStatus = status;
  await fetchApi('/users', 'POST', users);
  
  // If this is the current user, update current user as well
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    currentUser.kycStatus = status;
    await updateCurrentUser(currentUser);
  }
  
  // Find and update KYC request if it exists
  const kycRequests = await getAllKycRequests();
  const requestIndex = kycRequests.findIndex(r => r.userId === userId);
  if (requestIndex !== -1) {
    kycRequests[requestIndex].status = status;
    kycRequests[requestIndex].reviewDate = new Date().toISOString();
    if (reviewNotes) {
      kycRequests[requestIndex].reviewNotes = reviewNotes;
    }
    await fetchApi('/kycRequests', 'POST', kycRequests);
  }
  
  return true;
};

export const getAdminStats = async () => {
  const users = await getAllUsers();
  const kycRequests = await getAllKycRequests();
  const transactions = await getAllTransactions();
  
  return {
    totalUsers: users.length,
    pendingKyc: kycRequests.filter(r => r.status === 'pending').length,
    totalTransactions: transactions.length,
    totalRevenue: transactions
      .filter(t => t.status === 'completed' && t.type !== 'withdrawal' && t.type !== 'withdrawal_reversal')
      .reduce((sum, t) => sum + t.amount, 0),
    pendingWithdrawals: transactions
      .filter(t => t.status === 'pending' && t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0)
  };
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  // Find user
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return false;
  }
  
  // Update user with new data
  users[userIndex] = {
    ...users[userIndex],
    ...userData
  };
  
  await fetchApi('/users', 'POST', users);
  
  // If this is the current user, update current user as well
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    await updateCurrentUser({
      ...currentUser,
      ...userData
    });
  }
  
  return true;
};

export const processWithdrawalRequest = async (transactionId: string, approved: boolean): Promise<boolean> => {
  // Find the transaction
  const transactions = await getAllTransactions();
  const transactionIndex = transactions.findIndex(t => t.id === transactionId);
  if (transactionIndex === -1) {
    return false;
  }
  
  const transaction = transactions[transactionIndex];
  
  // Make sure it's a withdrawal transaction with pending status
  if (transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
    return false;
  }
  
  // Update transaction status
  if (approved) {
    transactions[transactionIndex].status = 'completed';
    
    // Update wallet and dashboard stats if it's the current user
    const currentUser = await getCurrentUser();
    if (transaction.userId === currentUser?.id) {
      const dashboardStats = await getDashboardStats();
      
      // Move from pending to completed withdrawals
      dashboardStats.pendingWithdrawals -= transaction.amount;
      dashboardStats.completedWithdrawals += transaction.amount;
      
      await updateDashboardStats(dashboardStats);
    }
  } else {
    transactions[transactionIndex].status = 'rejected';
    
    // Create a withdrawal reversal transaction
    const reversalTransaction: Transaction = {
      id: `reversal-${transactionId}`,
      userId: transaction.userId,
      amount: transaction.amount,
      type: 'withdrawal_reversal',
      description: `Reversal for rejected withdrawal #${transactionId}`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    transactions.push(reversalTransaction);
    
    // Update wallet balance if it's the current user
    const currentUser = await getCurrentUser();
    if (transaction.userId === currentUser?.id) {
      const wallet = await getWallet();
      const dashboardStats = await getDashboardStats();
      
      wallet.balance += transaction.amount;
      wallet.transactions.push(reversalTransaction);
      
      // Update dashboard stats
      dashboardStats.pendingWithdrawals -= transaction.amount;
      dashboardStats.earningsByType.withdrawal_reversal += transaction.amount;
      
      await updateWallet(wallet);
      await updateDashboardStats(dashboardStats);
    }
  }
  
  await fetchApi('/transactions', 'POST', transactions);
  return true;
};

// Admin Authentication
export const validateAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  const adminAuth = await fetchApi('/adminAuth');
  
  return (
    adminAuth &&
    adminAuth.username === username &&
    adminAuth.password === password
  );
};

export const updateAdminCredentials = async (username: string, password: string): Promise<boolean> => {
  await fetchApi('/adminAuth', 'POST', { username, password });
  return true;
};

// Clear database for testing/reset
export const clearDatabase = async (): Promise<void> => {
  // Reset each section
  await fetchApi('/currentUser', 'POST', null);
  await fetchApi('/users', 'POST', []);
  await fetchApi('/transactions', 'POST', []);
  await fetchApi('/networkMembers', 'POST', {
    id: '',
    name: '',
    referralCode: '',
    joinDate: '',
    active: false,
    children: []
  });
  await fetchApi('/networkStats', 'POST', createFreshNetworkStats());
  await fetchApi('/dashboardStats', 'POST', createFreshDashboardStats());
  await fetchApi('/wallet', 'POST', createFreshWallet(''));
  await fetchApi('/kycRequests', 'POST', []);
  
  console.log('Database cleared');
}; 