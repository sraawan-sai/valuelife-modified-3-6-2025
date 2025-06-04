// User related types
export type KYCStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  distributorId:string;
  profilePicture?: string;
  sponsorId: string | null;
  referralCode: string;
  registrationDate: string;
  kycStatus: KYCStatus;
  kycDocuments: {
    idProof?: string;
    addressProof?: string;
    bankDetails?: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  password?: string;
  position?: 'left' | 'right';
  active?: boolean;
}

// Financial related types
export type TransactionType = 
  | 'retail_profit'      // 10-20% retail profit
  | 'referral_bonus'     // Direct refer bonus - ₹3000
  | 'team_matching'      // Team matching bonus - ₹2500 per pair (1:1)
  | 'royalty_bonus'      // 2% of company turnover
  | 'repurchase_bonus'   // 3% repurchase bonus
  | 'award_reward'       // Awards and rewards
  | 'withdrawal'         // Withdrawals
  | 'withdrawal_reversal';

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  tdsAmount?: number;
  type: TransactionType;
  description: string;
  date: string;
  status: 'pending' | 'completed' | 'rejected';
  relatedUserId?: string; // For referral/level commissions
  level?: number;
  pairs?: number;        // For team matching bonus
  paymentId?:string
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: Transaction[];
}

// Network related types
export interface NetworkMember {
  id: string;
  name: string;
  distributorId?: string;
  profilePicture?: string;
  referralCode: string;
  joinDate: string;
  active: boolean;
  children?: NetworkMember[];  // Now supports unlimited children
  position?: 'left' | 'right'; // Keep for backward compatibility
}

export interface NetworkStats {
  totalMembers: number;
  directReferrals: number;
  activeMembers: number;
  inactiveMembers: number;
  levelWiseCount: Record<number, number>;
  dailyGrowth: { date: string; count: number }[];
  weeklyGrowth: { week: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
}

// Dashboard related types
export interface DashboardStats {
  totalEarnings: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  directReferrals: number;
  teamSize: number;
  tdsTotal: number;
  recentTransactions: Transaction[];
  earningsByType: Record<TransactionType, number>;
  earningsTimeline: { date: string; amount: number }[];
}

// Commission Structure
export interface CommissionStructure {
  retailProfit: { min: number, max: number };       // 10-20%
  directReferralBonus: number;                      // ₹3000 per referral
  firstMatchingBonus: number; // Bonus for first matching commission
  teamMatchingBonus: number;                        // ₹2500 per pair (1:1)
  teamMatchingDailyCap: number;                     // 20 pairs daily cap
  royaltyBonus: number;                             // 2% of company turnover
  repurchaseBonus: number;                          // 3% repurchase bonus
  milestoneRewards: {
    pairs: Record<number, { type: string, value: string | number }>;  // Pair achievements and rewards
  };
  levelCommissions: {
    [level: number]: number;
  };
  tdsPercentage: number;
  adminFeePercentage: number;
  repurchasePercentage: number;
}

// Replace existing commission structure with Value Life commission structure
export interface ValueLifeRank {
  title: string;
  requirement: { left: number, right: number };  // PV requirements for both legs
  reward: string;
}