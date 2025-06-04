import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, FileCheck, LogOut, DollarSign, Wallet, RefreshCw, IndianRupee, BarChart3, Award, Repeat } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AdminLayout from '../components/layout/AdminLayout';
import { getAllTransactions as getAllTransactionsDb ,getAllKycRequests, getAdminStats, getAllTransactions as getAllTransactionsLocal, getAllUsersForAdmin, KycRequest, getUserDashboardStats } from '../utils/localStorageService';
//import { getAllTransactions as getAllTransactionsDb } from '../utils/jsonDbService';
import { Transaction, User } from '../types';
import axios from 'axios';

const serverUrl = import.meta.env.VITE_SERVER_URL

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingKyc: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string;
    details: string;
    timestamp: string;
    timeAgo: string;
  }>>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Check for admin authentication
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      loadDashboardData();
      loadAdminStats();
      loadRecentTransactions();
    }
  }, [navigate]);

  const loadDashboardData = async () => {
    setIsRefreshing(true);

    // Get admin stats
    //const kycRequests = getAllKycRequests();
    // const transactions = getAllTransactions();

    try {
      const response = await axios.get(`${serverUrl}/api/db/admin/admin/stats`);
      const data = response.data

      const totalUsers = data.totalUsers
      const pendingKycRequests = data.pendingKycRequests
      const approvedKycRequests = data.approvedKycRequests
      const rejectedKycRequests = data.rejectedKycRequests
      const totalTransactions = data.totalTransactions
      const totalEarnings = data.totalEarnings
      const totalWithdrawals = data.totalWithdrawals
      const pendingWithdrawals = data.pendingWithdrawals


      // Prepare stats
      setStats({
        pendingKyc: pendingKycRequests,
        totalUsers: totalUsers,
        activeUsers: 0,//totalUsers.filter(user => user.kycStatus === 'approved').length,
        totalTransactions: totalTransactions,
        totalEarnings: totalEarnings,
        totalWithdrawals: totalWithdrawals,
        pendingWithdrawals: pendingWithdrawals
      });

      // Prepare recent activity
      const allActivities: Array<{
        type: string;
        details: string;
        timestamp: string;
        timeAgo: string;
      }> = [];

      // Add KYC requests to activities
      // pendingKycRequests.forEach((request: KycRequest) => {
      //   const user = totalUsers.find(u => u.id === request.userId);
      //   if (user) {
      //     allActivities.push({
      //       type: 'kyc',
      //       details: `User: ${user.name} (ID: ${user.id})`,
      //       timestamp: request.submissionDate,
      //       timeAgo: getTimeAgo(new Date(request.submissionDate))
      //     });
      //   }
      // });
      if (Array.isArray(pendingKycRequests)) {
  pendingKycRequests.forEach((request: KycRequest) => {
    const user = totalUsers.find((u: { id: string; }) => u.id === request.userId);
    if (user) {
      allActivities.push({
        type: 'kyc',
        details: `User: ${user.name} (ID: ${user.id})`,
        timestamp: request.submissionDate,
        timeAgo: getTimeAgo(new Date(request.submissionDate))
      });
    }
  });
}
     
    
      // Add transactions to activities
      // totalTransactions.forEach((transaction: Transaction) => {
      //   const user = totalUsers.find((u: { id: string; }) => u.id === transaction.userId);
      //   if (user) {
      //     allActivities.push({
      //       type: transaction.type,
      //       details: `User: ${user.name} (ID: ${user.id}) - ${transaction.description}`,
      //       timestamp: transaction.date,
      //       timeAgo: getTimeAgo(new Date(transaction.date))
      //     });
      //   }
      // });
        if (Array.isArray(totalTransactions)) {
        totalTransactions.forEach((transaction: Transaction) => {
          const user = totalUsers.find((u: { id: string; }) => u.id === transaction.userId);
          if (user) {
            allActivities.push({
              type: transaction.type,
              details: `User: ${user.name} (ID: ${user.id}) - ${transaction.description}`,
              timestamp: transaction.date,
              timeAgo: getTimeAgo(new Date(transaction.date))
            });
          }
        });
      }


      // Sort by timestamp (most recent first) and limit to 10
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(allActivities.slice(0, 10));

      setIsRefreshing(false);
    } catch (error: any) {
      console.error(error);
    }
  };

  const loadAdminStats = async () => {
    const users = getAllUsersForAdmin();
    const adminUser = users.find((u: User) => u.email === 'admin@example.com');
    if (adminUser) {
      const stats = getUserDashboardStats(adminUser.id);
      setAdminStats(stats);
    }
  };

  const loadRecentTransactions = async () => {
    const transactions = await getAllTransactionsDb();
    // Sort by date descending and take latest 10
    const sorted = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentTransactions(sorted.slice(0, 10));
  };

  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 30) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <AdminLayout>
      {/* Animated Rainbow Blobs and Gradient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Extra and more vibrant animated blobs */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-pink-400 via-yellow-300 via-green-300 via-blue-300 to-purple-400 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-300 via-pink-300 via-blue-300 to-green-300 rounded-full filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 via-pink-300 to-yellow-300 rounded-full filter blur-2xl opacity-20 animate-blob-slow animate-spin"></div>
        <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-gradient-to-tr from-green-300 via-yellow-300 to-pink-300 rounded-full filter blur-2xl opacity-20 animate-blob-fast animate-spin-reverse"></div>
        <div className="absolute left-1/3 top-0 w-80 h-80 bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 rounded-full filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute right-1/4 bottom-10 w-56 h-56 bg-gradient-to-tr from-blue-200 via-green-200 to-pink-300 rounded-full filter blur-2xl opacity-30 animate-blob-fast animation-delay-3000"></div>
        {/* New: extra small blobs for sparkle effect */}
        <div className="absolute left-1/2 top-1/3 w-24 h-24 bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 rounded-full filter blur-lg opacity-40 animate-blob animation-delay-1000"></div>
        <div className="absolute right-1/3 bottom-1/4 w-16 h-16 bg-gradient-to-tr from-green-200 via-blue-200 to-purple-200 rounded-full filter blur-lg opacity-30 animate-blob animation-delay-2500"></div>
        {/* Intensified animated rainbow gradient overlay */}
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))' }}></div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">Admin Dashboard</h1>
          <p className="text-neutral-600 font-semibold animate-fade-in">Manage users, KYC approvals, and products</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-pink-200 via-yellow-200 to-green-200 rounded-full text-primary-600 mr-4 animate-feature-glow">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Pending KYC</p>
              <h3 className="text-xl font-bold text-neutral-900">{stats.pendingKyc}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-100 via-pink-100 via-blue-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-yellow-200 via-pink-200 to-blue-200 rounded-full text-secondary-600 mr-4 animate-feature-glow">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Earnings</p>
              <h3 className="text-xl font-bold text-neutral-900">₹{stats.totalEarnings.toFixed(2)}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 via-pink-100 via-yellow-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-blue-200 via-pink-200 to-yellow-200 rounded-full text-accent-600 mr-4 animate-feature-glow">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Users</p>
              <h3 className="text-xl font-bold text-neutral-900">{stats.totalUsers}</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 via-yellow-100 via-pink-100 to-blue-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-tr from-green-200 via-yellow-200 to-pink-200 rounded-full text-success-600 mr-4 animate-feature-glow">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Pending Withdrawals</p>
              <h3 className="text-xl font-bold text-neutral-900">₹{stats.pendingWithdrawals.toFixed(2)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Commission/Bonus Breakdown */}
      {adminStats && (
        <Card title="Admin Commission & Bonus Breakdown" className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center bg-white rounded-xl shadow p-4 border border-neutral-100">
              <div className="bg-yellow-500 p-3 rounded-full flex items-center justify-center mr-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-neutral-800">Referral Bonus (Admin Share)</div>
                <div className="text-xs text-neutral-500">Admin's share of all direct referral bonuses</div>
              </div>
              <div className="text-right font-extrabold text-lg text-primary-700 min-w-[80px]">
                ₹{adminStats.earningsByType.referral_bonus?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="flex items-center bg-white rounded-xl shadow p-4 border border-neutral-100">
              <div className="bg-green-500 p-3 rounded-full flex items-center justify-center mr-4">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-neutral-800">Team Matching (Admin Share)</div>
                <div className="text-xs text-neutral-500">Admin's share of all matching bonuses</div>
              </div>
              <div className="text-right font-extrabold text-lg text-primary-700 min-w-[80px]">
                ₹{adminStats.earningsByType.team_matching?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="flex items-center bg-white rounded-xl shadow p-4 border border-neutral-100">
              <div className="bg-purple-500 p-3 rounded-full flex items-center justify-center mr-4">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-neutral-800">Royalty Bonus (Admin Share)</div>
                <div className="text-xs text-neutral-500">Admin's share of all royalty bonuses</div>
              </div>
              <div className="text-right font-extrabold text-lg text-primary-700 min-w-[80px]">
                ₹{adminStats.earningsByType.royalty_bonus?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="flex items-center bg-white rounded-xl shadow p-4 border border-neutral-100">
              <div className="bg-blue-500 p-3 rounded-full flex items-center justify-center mr-4">
                <Repeat className="h-7 w-7 text-white" />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-neutral-800">Repurchase Bonus (Admin Share)</div>
                <div className="text-xs text-neutral-500">Admin's share of all repurchase bonuses</div>
              </div>
              <div className="text-right font-extrabold text-lg text-primary-700 min-w-[80px]">
                ₹{adminStats.earningsByType.repurchase_bonus?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/admin/kyc')}
            leftIcon={<FileCheck className="h-5 w-5" />}
          >
            Manage KYC Approvals
            {stats.pendingKyc > 0 && (
              <span className="ml-2 bg-white text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {stats.pendingKyc} new
              </span>
            )}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/admin/products')}
            leftIcon={<Package className="h-5 w-5" />}
          >
            Manage Products
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/admin/users')}
            leftIcon={<Users className="h-5 w-5" />}
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Transactions">
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, idx) => (
              <div key={tx.id || idx} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-b-0">
                <div>
                  <p className="text-neutral-900 font-medium capitalize">{tx.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-neutral-500">{tx.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-semibold ${tx.type === 'withdrawal' ? 'text-error-600' : 'text-success-600'}`}>{tx.type === 'withdrawal' ? '-' : '+'}₹{tx.amount}</span>
                  <span className="text-xs text-neutral-500">{new Date(tx.date).toLocaleString()}</span>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{tx.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-center py-4">No recent transactions</p>
          )}
        </div>
      </Card>

      {/* Custom Animations and Effects */}
      <style>{`
        @keyframes blobSlow {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(20deg); }
        }
        .animate-blob-slow {
          animation: blobSlow 18s ease-in-out infinite;
        }
        @keyframes blobFast {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(-15deg); }
        }
        .animate-blob-fast {
          animation: blobFast 8s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spinReverse 24s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          100% { transform: rotate(-360deg); }
        }
        @keyframes bgGradientMoveVivid {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient-vivid {
          background-size: 300% 300%;
          animation: bgGradientMoveVivid 24s ease-in-out infinite;
        }
        .animate-blob {
          animation: blobFast 12s ease-in-out infinite;
        }
        @keyframes cardPop {
          0% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
          50% { transform: scale(1.02); box-shadow: 0 0 32px 8px #ff00cc44; }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
        }
        .animate-card-pop {
          animation: cardPop 6s ease-in-out infinite;
        }
        @keyframes featureGlow {
          0%, 100% { filter: drop-shadow(0 0 0 #ffb300); }
          50% { filter: drop-shadow(0 0 12px #ffb300); }
        }
        .animate-feature-glow {
          animation: featureGlow 2.5s infinite;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard; 