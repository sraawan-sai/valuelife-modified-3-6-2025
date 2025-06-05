import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Wallet as WalletIcon, Clock, ArrowDown, ArrowUp, Filter, RefreshCw, AlertTriangle, Users, BarChart3, Award, Repeat, Gift, DollarSign } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import TransactionList from '../components/dashboard/TransactionList';
import WithdrawFunds from '../components/wallet/WithdrawFunds';
import { getCurrentUser, getUserDashboardStats } from '../utils/localStorageService';
import { Wallet as WalletType, DashboardStats, Transaction, User, TransactionType } from '../types';
import KycRequired from '../components/auth/KycRequired';
import { formatCurrency, currencySymbol } from '../utils/currencyFormatter';
import { fetchWalletData, processTransaction, WalletData } from '../services/walletService';
import toast from 'react-hot-toast';

const Wallet: React.FC = () => {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'referrals'>('all');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const loadWalletData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = getCurrentUser();
      setCurrentUser(user);
      
      if (!user?.id) {
        throw new Error('User not found');
      }

      // Check if user is admin
      const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
      setIsAdmin(isAdminAuthenticated);

      const [data, stats] = await Promise.all([
        fetchWalletData(user.id),
        getUserDashboardStats(user.id)
      ]);
      
      if (data) {
        setWalletData(data);
      }
      
      // Stats will always have a value now, even if it's default values
      setDashboardStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading wallet data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleWithdrawalSuccess = () => {
    setShowWithdrawForm(false);
    loadWalletData();
    toast.success('Withdrawal request submitted successfully');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-error-600 mb-4">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Wallet</h2>
          <p className="text-neutral-600">{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={loadWalletData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">Wallet</h1>
          <p className="text-lg font-semibold text-blue-400 animate-fade-in">Manage your earnings and withdrawals</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            variant="outline"
            onClick={loadWalletData}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            leftIcon={showWithdrawForm ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          >
            {showWithdrawForm ? 'Hide Withdrawal Form' : 'Withdraw Funds'}
          </Button>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
                <div>
                  <h2 className="text-lg font-medium text-neutral-700">Total Earnings</h2>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-success-600">
                      {!isAdmin ? 
                        formatCurrency(
                          (dashboardStats?.earningsByType?.referral_bonus || 0) + 
                          (dashboardStats?.earningsByType?.team_matching || 0) +
                          (dashboardStats?.earningsByType?.repurchase_bonus || 0) +
                          (dashboardStats?.earningsByType?.royalty_bonus || 0) +
                          (dashboardStats?.earningsByType?.award_reward || 0)
                        ) :
                        formatCurrency(dashboardStats?.totalEarnings || 0)
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                {/* Total Transactions */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Total Transactions</span>
                  <span className="font-semibold">
                    {!isAdmin ? 
                      // For regular users, count only referral and team matching transactions
                      walletData?.transactions?.filter(tx => {
                        const txType = tx.type as TransactionType;
                        return txType === 'referral_bonus' || txType === 'team_matching';
                      }).length || 0 :
                      // For admin, show all transactions
                      walletData?.transactions?.length || 0
                    }
                  </span>
                </div>
                {/* Pending Withdrawals */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Pending Withdrawals</span>
                  <span className="font-semibold text-warning-600">
                    {formatCurrency(walletData?.pendingWithdrawals || 0)}
                  </span>
                </div>
                {/* Last Transaction */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Last Transaction</span>
                  <span className="font-semibold">
                    {walletData?.transactions?.length ? 
                      new Date(walletData.transactions[0].date).toLocaleDateString() : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Earnings Breakdown */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-neutral-700 mb-4">Earnings Breakdown</h3>
              <div className="space-y-4">
                {/* Referral Bonus */}
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Referral Bonus</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(dashboardStats?.earningsByType?.referral_bonus || 0)}
                  </span>
                </div>

                {/* Team Matching */}
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-green-500 mr-2" />
                    <span>Team Matching</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(dashboardStats?.earningsByType?.team_matching || 0)}
                  </span>
                </div>

                {/* Repurchase Bonus */}
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center">
                    <Repeat className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Repurchase Bonus</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(dashboardStats?.earningsByType?.repurchase_bonus || 0)}
                  </span>
                </div>

                {/* Royalty Bonus */}
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-purple-500 mr-2" />
                    <span>Royalty Bonus</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(dashboardStats?.earningsByType?.royalty_bonus || 0)}
                  </span>
                </div>

                {/* Awards & Rewards */}
                <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                  <div className="flex items-center">
                    <Gift className="h-5 w-5 text-indigo-500 mr-2" />
                    <span>Awards & Rewards</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(dashboardStats?.earningsByType?.award_reward || 0)}
                  </span>
                </div>

                {/* Purchase Amount - Admin only */}
                {isAdmin && (
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-purple-500 mr-2" />
                      <span>Purchase Amount</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(dashboardStats?.earningsByType?.retail_profit || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Withdrawal Form */}
      {showWithdrawForm && (
        <div className="mb-6">
          <WithdrawFunds
            totalEarnings={dashboardStats?.totalEarnings || 0}
            onSuccess={handleWithdrawalSuccess}
          />
        </div>
      )}

      {/* Transactions List */}
      <div className="mb-6">
        <Card
          title="Transaction History"
          subtitle="Your recent transactions"
        >
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'referrals' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('referrals')}
                >
                  Referrals
                </Button>
              </div>
            </div>
            
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {walletData.transactions
                  .filter(tx => {
                    // First apply status filter
                    if (filterStatus === 'completed') return tx.status === 'completed';
                    if (filterStatus === 'pending') return tx.status === 'pending';
                    if (filterStatus === 'referrals') {
                      // Show both direct referral bonuses and team matching bonuses
                      return tx.type === 'referral_bonus' || tx.type === 'team_matching';
                    }
                    
                    // For regular users, show all transactions except retail_profit
                    if (!isAdmin) {
                      return tx.type !== 'retail_profit';
                    }
                    
                    // For admin, show all transactions
                    return true;
                  })
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
                  .map(transaction => (
                    <div key={transaction.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-neutral-900">{transaction.description}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(transaction.date).toLocaleDateString()}
                          {transaction.relatedUserId && transaction.type === 'referral_bonus' && (
                            <span className="ml-2 text-blue-500">• Direct Referral</span>
                          )}
                          {transaction.type === 'team_matching' && (
                            <span className="ml-2 text-green-500">• Team Matching</span>
                          )}
                        </p>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount < 0 ? 'text-error-600' : 
                        transaction.type === 'withdrawal' ? 'text-warning-600' : 
                        'text-success-600'
                      }`}>
                        {transaction.amount < 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No transactions found
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Wallet;