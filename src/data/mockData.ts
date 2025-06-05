import { User, Transaction, NetworkMember, NetworkStats, DashboardStats, Wallet, CommissionStructure } from '../types';

// Mock current user
export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: '123 Main St, City, Country',
  profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
  sponsorId: null,
  referralCode: 'JOHNDOE123',
  registrationDate: '2023-01-15T10:30:00Z',
  kycStatus: 'approved',
  kycDocuments: {
    idProof: 'id_proof.jpg',
    addressProof: 'address_proof.jpg',
    bankDetails: 'bank_details.jpg',
  },
  bankDetails: {
    accountName: 'John Doe',
    accountNumber: '1234567890',
    bankName: 'Example Bank',
    ifscCode: 'EXBK0001234',
  },
};

// Mock transactions
export const transactions: Transaction[] = [
  {
    id: 't1',
    userId: '1',
    amount: 3000,
    type: 'referral_bonus',
    description: 'Direct referral bonus from Jane Smith',
    date: '2023-05-10T14:30:00Z',
    status: 'completed',
    relatedUserId: '2',
  },
  {
    id: 't2',
    userId: '1',
    amount: 2500,
    type: 'team_matching',
    description: 'Team matching bonus (1 pair)',
    date: '2023-05-15T09:45:00Z',
    status: 'completed',
    pairs: 1,
  },
  {
    id: 't3',
    userId: '1',
    amount: 1500,
    type: 'retail_profit',
    description: 'Retail profit on water purifier sale',
    date: '2023-05-20T16:20:00Z',
    status: 'completed',
  },
  {
    id: 't4',
    userId: '1',
    amount: 150,
    type: 'withdrawal',
    description: 'Withdrawal to bank account',
    date: '2023-05-25T11:15:00Z',
    status: 'pending',
  },
  {
    id: 't5',
    userId: '1',
    amount: 500,
    type: 'royalty_bonus',
    description: 'Royalty bonus from May company turnover',
    date: '2023-05-30T13:50:00Z',
    status: 'completed',
  },
  {
    id: 't6',
    userId: '1',
    amount: 300,
    type: 'repurchase_bonus',
    description: '3% repurchase bonus from team activity',
    date: '2023-06-01T10:15:00Z',
    status: 'completed',
  },
  {
    id: 't7',
    userId: '1',
    amount: 5000,
    type: 'award_reward',
    description: 'Award for achieving 5-5 pair milestone',
    date: '2023-06-05T14:30:00Z',
    status: 'completed',
  },
];

// Mock wallet
export const wallet: Wallet = {
  userId: '1',
  balance: 12650, // Sum of completed transactions minus withdrawals
  transactions: transactions,
};

// Mock network members (downline)
export const networkMembers: NetworkMember = {
  id: '1',
  name: 'John Doe',
  profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
  referralCode: 'JOHNDOE123',
  joinDate: '2023-01-15T10:30:00Z',
  active: false,
  children: [
    {
      id: '2',
      name: 'Jane Smith',
      profilePicture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      referralCode: 'JANESMITH456',
      joinDate: '2023-02-10T14:45:00Z',
      active: false,
      children: [
        {
          id: '5',
          name: 'Emily Davis',
          profilePicture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
          referralCode: 'EMILYDAVIS789',
          joinDate: '2023-03-05T09:15:00Z',
          active: false,
        },
        {
          id: '6',
          name: 'David Wilson',
          profilePicture: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
          referralCode: 'DAVIDWILSON012',
          joinDate: '2023-03-10T16:30:00Z',
          active: false,
        },
      ],
    },
    {
      id: '3',
      name: 'Michael Johnson',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300',
      referralCode: 'MICHAELJOHNSON789',
      joinDate: '2023-02-15T11:20:00Z',
      active: false,
    },
    {
      id: '4',
      name: 'Sarah Williams',
      profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300',
      referralCode: 'SARAHWILLIAMS012',
      joinDate: '2023-02-20T15:10:00Z',
      active: false,
      children: [
        {
          id: '7',
          name: 'Robert Brown',
          profilePicture: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=300',
          referralCode: 'ROBERTBROWN345',
          joinDate: '2023-03-15T10:45:00Z',
          active: false,
        },
      ],
    },
  ],
};

// Mock network statistics
export const networkStats: NetworkStats = {
  totalMembers: 7,
  directReferrals: 3,
  activeMembers: 0,
  inactiveMembers: 7,
  levelWiseCount: {
    1: 3,
    2: 3,
    3: 0,
  },
  dailyGrowth: [
    { date: '2023-05-25', count: 0 },
    { date: '2023-05-26', count: 1 },
    { date: '2023-05-27', count: 0 },
    { date: '2023-05-28', count: 2 },
    { date: '2023-05-29', count: 0 },
    { date: '2023-05-30', count: 1 },
    { date: '2023-05-31', count: 0 },
  ],
  weeklyGrowth: [
    { week: 'Week 1', count: 3 },
    { week: 'Week 2', count: 2 },
    { week: 'Week 3', count: 1 },
    { week: 'Week 4', count: 1 },
  ],
  monthlyGrowth: [
    { month: 'Jan', count: 1 },
    { month: 'Feb', count: 3 },
    { month: 'Mar', count: 3 },
    { month: 'Apr', count: 0 },
    { month: 'May', count: 0 },
  ],
};

// Mock dashboard statistics
export const dashboardStats: DashboardStats = {
  totalEarnings: 12800,
  pendingWithdrawals: 150,
  completedWithdrawals: 0,
  directReferrals: 3,
  teamSize: 7,
  recentTransactions: transactions.slice(0, 5),
  earningsByType: {
    retail_profit: 1500,
    referral_bonus: 3000,
    team_matching: 2500,
    royalty_bonus: 500,
    repurchase_bonus: 300,
    award_reward: 5000,
    withdrawal: -150,
    withdrawal_reversal: 0,
  },
  earningsTimeline: [
    { date: '2023-05-01', amount: 0 },
    { date: '2023-05-10', amount: 3000 },
    { date: '2023-05-15', amount: 5500 },
    { date: '2023-05-20', amount: 7000 },
    { date: '2023-05-30', amount: 7500 },
    { date: '2023-06-01', amount: 7800 },
    { date: '2023-06-05', amount: 12800 },
  ],
};

// Mock commission structure
export const commissionStructure: CommissionStructure = {
  retailProfit: { min: 10, max: 20 },       // 10-20% retail profit
  directReferralBonus: 3000,                // ₹3000 per referral
  firstMatchingBonus: 500,                  // ₹500 first matching bonus
  teamMatchingBonus: 2500,                  // ₹2500 per pair (1:1)
  teamMatchingDailyCap: 20,                 // 20 pairs daily cap
  royaltyBonus: 2,                          // 2% of company turnover
  repurchaseBonus: 3,                       // 3% repurchase bonus
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
      1: { type: 'Insurance', value: '₹15,00,000 Insurance'},
      5: { type: 'Travel', value: 'TA & DA Eligibility'},
      15: { type: 'Travel', value: 'Goa Tour'},
      50: { type: 'Travel', value: 'Thailand Tour'},
      100: { type: 'Product', value: 'Dell Laptop'},
      250: { type: 'Travel', value: 'Singapore Tour'},
      500: { type: 'Cash/Gold', value: '2.5 Lack Gold/Cash'},
      1000: { type: 'Insurance', value: '1 Cr Health Insurance or 5 Lack Cash'},
      2500: { type: 'Cash', value: '10 Lacks Car Fund'},
      5000: { type: 'Cash', value: '25 Lacks House Fund'},
      10000: { type: 'Car', value: 'Toyota Fortuner'},
      25000: { type: 'Cash', value: '50 Lacks Reward'},
      50000: { type: 'Cash', value: '1 Cr Villa Fund'},
      100000: { type: 'Cash', value: '2 Cr Retirement Fund'},
    }
  }
};