import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Use the environment variable or fallback to a default URL
const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://valuelife-backend.onrender.com';

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  status?: 'pending' | 'completed';
}

export interface WalletData {
  balance: number;
  pendingWithdrawals?: number;
  transactions?: WalletTransaction[];
  totalEarnings?: number;
  earningsByType?: {
    referral_bonus: number;
    team_matching: number;
    royalty_bonus: number;
    repurchase_bonus: number;
    award_reward: number;
  };
}
interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountName: string;
  bankName: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  accountDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  requestDate: string;
  processedDate?: string;
  transactionId?: string;
  remarks?: string;
}

// Function to fetch wallet data from server
export const fetchWalletData = async (userId: string): Promise<WalletData | undefined> => {
  try {
    const response = await axios.get(`${serverUrl}/api/db/wallet/${userId}`);
    if (response?.data) {
      return {
        balance: Number(response.data.balance) || 0,
        pendingWithdrawals: Number(response.data.pendingWithdrawals) || 0,
        totalEarnings: Number(response.data.totalEarnings) || 0,
        earningsByType: response.data.earningsByType || {
          referral_bonus: 0,
          team_matching: 0,
          royalty_bonus: 0,
          repurchase_bonus: 0,
          award_reward: 0
        },
        transactions: Array.isArray(response.data.transactions) ? response.data.transactions.map((tx: Partial<WalletTransaction>) => ({
          id: tx.id || uuidv4(),
          type: tx.type || 'credit',
          amount: Number(tx.amount) || 0,
          date: tx.date || new Date().toISOString(),
          description: tx.description || '',
          status: (tx.status === 'pending' || tx.status === 'completed') ? tx.status : 'completed'
        })) : []
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return undefined;
  }
};

// Function to update wallet data
export const updateWalletData = async (userId: string, walletData: WalletData): Promise<boolean> => {
  try {
    // Normalize the data before sending
    const normalizedData: WalletData = {
      balance: Number(walletData.balance) || 0,
      pendingWithdrawals: Number(walletData.pendingWithdrawals) || 0,
      totalEarnings: Number(walletData.totalEarnings) || 0,
      earningsByType: walletData.earningsByType || {
        referral_bonus: 0,
        team_matching: 0,
        royalty_bonus: 0,
        repurchase_bonus: 0,
        award_reward: 0
      },
      transactions: Array.isArray(walletData.transactions) ? walletData.transactions.map((tx: Partial<WalletTransaction>) => ({
        id: tx.id || uuidv4(),
        type: tx.type || 'credit',
        amount: Number(tx.amount) || 0,
        date: tx.date || new Date().toISOString(),
        description: tx.description || '',
        status: (tx.status === 'pending' || tx.status === 'completed') ? tx.status : 'completed'
      })) : []
    };

    // Update server
    await axios.put(`${serverUrl}/api/db/wallet/${userId}`, normalizedData);
    return true;
  } catch (error) {
    console.error('Error updating wallet data:', error);
    throw error;
  }
};

// Function to process a transaction
export const processTransaction = async (
  userId: string,
  amount: number,
  type: 'credit' | 'debit' | 'withdrawal',
  description: string
): Promise<boolean> => {
  try {
     const uuid = uuidv4();
    const response = await axios.post(`${serverUrl}/api/db/transactions`, {
      id:uuid,
      userId,
      amount,
      type,
      description,
      date: new Date().toISOString(),
      status: type === 'withdrawal' ? 'pending' : 'completed'
    });

    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error('Error processing transaction:', error);
    return false;
  }
};

// Function to handle withdrawal requests
export const createWithdrawalRequest = async (
  userId: string,
  amount: number,
  bankDetails: BankDetails,
   userName:string,
  
): Promise<boolean> => {
  try {
        const uuid = uuidv4();
    // Create the withdrawal request
    const response = await axios.post(`${serverUrl}/api/db/withdrawalRequests`, {
      id: uuid,
      userId,
      userName,
      amount,
      status: 'pending',
      accountDetails: {
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        accountHolderName: bankDetails.accountName,
        bankName: bankDetails.bankName
      },
      requestDate: new Date().toISOString()
    });

    if (response.status === 200 || response.status === 201) {
      // Create a transaction record
      await processTransaction(userId, amount, 'withdrawal', 'Withdrawal request submitted');
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Error creating withdrawal request:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(error.response?.data?.message || 'Failed to create withdrawal request');
  }
};

// Get all withdrawal requests
export const getWithdrawalRequests = async (userId?: string): Promise<WithdrawalRequest[]> => {
  try {
    const url = userId
      ? `${serverUrl}/api/db/withdrawalRequests?userId=${userId}`
      : `${serverUrl}/api/db/withdrawalRequests`;

    const response = await axios.get(url,{

    });
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return [];
  }
};

// Update withdrawal request status
export const updateWithdrawalStatus = async (
  requestId: string,
  status: WithdrawalRequest['status'],
  remarks?: string,
  transactionId?: string
): Promise<boolean> => {
  try {
    console.log('Updating withdrawal request...');
    console.log('Request ID:', requestId);
    console.log('Status:', status);
    console.log('Remarks:', remarks);
    console.log('Transaction ID:', transactionId);
    const response = await axios.put(`${serverUrl}/api/db/withdrawalRequests/${requestId}`, {
      status,
      remarks,
      transactionId,
      processedDate: new Date().toISOString(),
    });

    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error(`Failed to update withdrawal request ${requestId}:`, error);
    return false;
  }
};

// Get withdrawal requests for a specific user  
export const getUserWithdrawalRequests = async (userId: string): Promise<WithdrawalRequest[]> => {
  return await getWithdrawalRequests(userId);
}; 