import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Globe, CreditCard, BarChart, Save, Bell, Key } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { updateAdminCredentials, getFromStorage } from '../utils/localStorageService';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentialsChanged, setCredentialsChanged] = useState(false);
  
  // System settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Value Life',
    contactEmail: 'admin@valuelife.in',
    supportPhone: '+91 1234567890',
    maintenanceMode: false,
    allowRegistration: true
  });
  
  const [commissionSettings, setCommissionSettings] = useState({
    directReferralBonus: 3000,
    matchingBonus: 2500,
    royaltyBonus: 2,
    repurchaseBonus: 3
  });

  // Load saved commission settings
  useEffect(() => {
    const savedCommissionStructure = localStorage.getItem('commissionStructure');
    if (savedCommissionStructure) {
      const parsed = JSON.parse(savedCommissionStructure);
      setCommissionSettings({
        directReferralBonus: parsed.directReferralBonus,
        matchingBonus: parsed.teamMatchingBonus,
        royaltyBonus: parsed.royaltyBonus,
        repurchaseBonus: parsed.repurchaseBonus
      });
    }
  }, []);

  const [paymentSettings, setPaymentSettings] = useState({
    minimumWithdrawal: 500,
    withdrawalFee: 0,
    taxRate: 5,
    adminCharges: 10
  });

  // Admin credentials state
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [adminCredentialsError, setAdminCredentialsError] = useState<string | null>(null);
  const [adminCredentialsSuccess, setAdminCredentialsSuccess] = useState<string | null>(null);

  // Check for admin authentication
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      // Set current admin username
      const currentUsername = getFromStorage<string>('admin_username') || 'admin';
      setAdminCredentials(prev => ({
        ...prev,
        username: currentUsername
      }));
    }
  }, [navigate]);

  const handleSaveSettings = () => {
    setLoading(true);
    
    // Save commission settings to localStorage
    const commissionStructure = {
      retailProfit: { min: 10, max: 20 },
      directReferralBonus: commissionSettings.directReferralBonus,
      teamMatchingBonus: commissionSettings.matchingBonus,
      teamMatchingDailyCap: 20,
      royaltyBonus: commissionSettings.royaltyBonus,
      repurchaseBonus: commissionSettings.repurchaseBonus,
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
      },
      levelCommissions: {
        1: 0.07,
        2: 0.05,
        3: 0.03,
        4: 0.02,
        5: 0.01
      },
      tdsPercentage: 5,
      adminFeePercentage: 10,
      repurchasePercentage: 3
    };

    localStorage.setItem('commissionStructure', JSON.stringify(commissionStructure));
    
    // Simulate API call to save settings
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleAdminCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setAdminCredentialsError(null);
    setCredentialsChanged(true);
  };

  const handleSaveAdminCredentials = () => {
    // Validate
    if (adminCredentials.password !== adminCredentials.confirmPassword) {
      setAdminCredentialsError("Passwords don't match");
      return;
    }

    if (adminCredentials.password.length < 6) {
      setAdminCredentialsError("Password must be at least 6 characters");
      return;
    }

    if (!adminCredentials.username.trim()) {
      setAdminCredentialsError("Username cannot be empty");
      return;
    }

    // Update credentials
    const success = updateAdminCredentials(
      adminCredentials.username, 
      adminCredentials.password
    );

    if (success) {
      setAdminCredentialsSuccess("Admin credentials updated successfully");
      // Clear password fields
      setAdminCredentials(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setCredentialsChanged(false);
    } else {
      setAdminCredentialsError("Failed to update credentials");
    }
  };

  return (
    <AdminLayout>
      {/* Animated Rainbow Blobs and Gradient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-pink-400 via-yellow-300 via-green-300 via-blue-300 to-purple-400 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-300 via-pink-300 via-blue-300 to-green-300 rounded-full filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 via-pink-300 to-yellow-300 rounded-full filter blur-2xl opacity-20 animate-blob-slow animate-spin"></div>
        <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-gradient-to-tr from-green-300 via-yellow-300 to-pink-300 rounded-full filter blur-2xl opacity-20 animate-blob-fast animate-spin-reverse"></div>
        <div className="absolute left-1/3 top-0 w-80 h-80 bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 rounded-full filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute right-1/4 bottom-10 w-56 h-56 bg-gradient-to-tr from-blue-200 via-green-200 to-pink-300 rounded-full filter blur-2xl opacity-30 animate-blob-fast animation-delay-3000"></div>
        <div className="absolute left-1/2 top-1/3 w-24 h-24 bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 rounded-full filter blur-lg opacity-40 animate-blob animation-delay-1000"></div>
        <div className="absolute right-1/3 bottom-1/4 w-16 h-16 bg-gradient-to-tr from-green-200 via-blue-200 to-purple-200 rounded-full filter blur-lg opacity-30 animate-blob animation-delay-2500"></div>
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))'}}></div>
      </div>
      <div className="mb-6 relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">Admin Settings</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
          <p className="text-neutral-600">Configure application-wide settings</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={handleSaveSettings}
          isLoading={loading}
        >
          Save All Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Admin Credentials */}
        <Card className="bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center mb-6">
            <Key className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Admin Credentials</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Admin Username"
              name="username"
              value={adminCredentials.username}
              onChange={handleAdminCredentialsChange}
              placeholder="Admin username"
            />
            
            <div className="md:col-span-2">
              <Input
                label="New Password"
                name="password"
                type="password"
                value={adminCredentials.password}
                onChange={handleAdminCredentialsChange}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="md:col-span-2">
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={adminCredentials.confirmPassword}
                onChange={handleAdminCredentialsChange}
                placeholder="Confirm new password"
              />
            </div>
            
            {adminCredentialsError && (
              <div className="md:col-span-2 text-error-600 text-sm mt-1">
                {adminCredentialsError}
              </div>
            )}
            
            {adminCredentialsSuccess && (
              <div className="md:col-span-2 text-success-600 text-sm mt-1">
                {adminCredentialsSuccess}
              </div>
            )}
            
            <div className="md:col-span-2 mt-2">
              <Button
                variant="primary"
                onClick={handleSaveAdminCredentials}
                disabled={!credentialsChanged}
              >
                Update Admin Credentials
              </Button>
            </div>
          </div>
        </Card>

        {/* General Settings */}
        <Card className="bg-gradient-to-br from-yellow-100 via-pink-100 via-blue-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Site Name"
              value={generalSettings.siteName}
              onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
              placeholder="Company or platform name"
            />
            
            <Input
              label="Contact Email"
              type="email"
              value={generalSettings.contactEmail}
              onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})}
              placeholder="Primary contact email"
            />
            
            <Input
              label="Support Phone"
              value={generalSettings.supportPhone}
              onChange={(e) => setGeneralSettings({...generalSettings, supportPhone: e.target.value})}
              placeholder="Customer support phone number"
            />
            
            <div className="md:col-span-2">
              <div className="flex flex-col mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onChange={() => setGeneralSettings({...generalSettings, maintenanceMode: !generalSettings.maintenanceMode})}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 text-sm font-medium text-neutral-700">
                    Maintenance Mode (Temporarily disable user access)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    checked={generalSettings.allowRegistration}
                    onChange={() => setGeneralSettings({...generalSettings, allowRegistration: !generalSettings.allowRegistration})}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="allowRegistration" className="ml-2 text-sm font-medium text-neutral-700">
                    Allow New User Registrations
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Commission Settings */}
        <Card className="bg-gradient-to-br from-blue-100 via-pink-100 via-yellow-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center mb-6">
            <BarChart className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Commission Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Direct Referral Bonus (₹)"
              type="number"
              value={commissionSettings.directReferralBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, directReferralBonus: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Matching Bonus (₹)"
              type="number"
              value={commissionSettings.matchingBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, matchingBonus: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Royalty Bonus (%)"
              type="number"
              value={commissionSettings.royaltyBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, royaltyBonus: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
            
            <Input
              label="Repurchase Bonus (%)"
              type="number"
              value={commissionSettings.repurchaseBonus}
              onChange={(e) => setCommissionSettings({...commissionSettings, repurchaseBonus: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="bg-gradient-to-br from-green-100 via-yellow-100 via-pink-100 to-blue-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center mb-6">
            <CreditCard className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Payment & Withdrawal Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Minimum Withdrawal Amount (₹)"
              type="number"
              value={paymentSettings.minimumWithdrawal}
              onChange={(e) => setPaymentSettings({...paymentSettings, minimumWithdrawal: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Withdrawal Fee (₹)"
              type="number"
              value={paymentSettings.withdrawalFee}
              onChange={(e) => setPaymentSettings({...paymentSettings, withdrawalFee: Number(e.target.value)})}
              min="0"
            />
            
            <Input
              label="Tax Rate (%)"
              type="number"
              value={paymentSettings.taxRate}
              onChange={(e) => setPaymentSettings({...paymentSettings, taxRate: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
            
            <Input
              label="Admin Charges (%)"
              type="number"
              value={paymentSettings.adminCharges}
              onChange={(e) => setPaymentSettings({...paymentSettings, adminCharges: Number(e.target.value)})}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </Card>
        
        {/* Security Settings */}
        {/* <Card className="bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center mb-6">
            <Shield className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Require KYC Verification</p>
                <p className="text-sm text-neutral-500">Require users to complete KYC before withdrawal</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="requireKyc"
                />
                <label 
                  htmlFor="requireKyc" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Two-Factor Authentication for Admin</p>
                <p className="text-sm text-neutral-500">Require 2FA for all admin accounts</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={false} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="adminTwoFactor"
                />
                <label 
                  htmlFor="adminTwoFactor" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-neutral-300"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-0" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">IP Restriction for Admin Panel</p>
                <p className="text-sm text-neutral-500">Restrict admin access to specific IP addresses</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={false} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="ipRestriction"
                />
                <label 
                  htmlFor="ipRestriction" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-neutral-300"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-0" 
                  />
                </label>
              </div>
            </div>
          </div>
        </Card> */}
        
        {/* Notification Settings */}
        {/* <Card className="bg-gradient-to-br from-yellow-100 via-pink-100 via-green-100 to-blue-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex items-center mb-6">
            <Bell className="h-5 w-5 text-primary-600 mr-3" />
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">New User Registration</p>
                <p className="text-sm text-neutral-500">Receive notifications for new user registrations</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="newUserNotification"
                />
                <label 
                  htmlFor="newUserNotification" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">KYC Submission</p>
                <p className="text-sm text-neutral-500">Receive notifications for new KYC submissions</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="kycNotification"
                />
                <label 
                  htmlFor="kycNotification" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-800 font-medium">Withdrawal Requests</p>
                <p className="text-sm text-neutral-500">Receive notifications for withdrawal requests</p>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  checked={true} 
                  className="opacity-0 absolute block w-6 h-6 cursor-pointer"
                  id="withdrawalNotification"
                />
                <label 
                  htmlFor="withdrawalNotification" 
                  className="block overflow-hidden h-6 rounded-full cursor-pointer bg-primary-600"
                >
                  <span 
                    className="dot block h-6 w-6 rounded-full bg-white transform transition-transform duration-300 ease-in-out translate-x-6" 
                  />
                </label>
              </div>
            </div>
          </div>
        </Card> */}
      </div>

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
        @keyframes cardPop {
          0% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
          50% { transform: scale(1.02); box-shadow: 0 0 32px 8px #ff00cc44; }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
        }
        .animate-card-pop {
          animation: cardPop 6s ease-in-out infinite;
        }
        .rainbow-border-glow {
          box-shadow: 0 0 0 4px rgba(255,0,150,0.12), 0 0 32px 8px rgba(0,229,255,0.12), 0 0 32px 8px rgba(255,255,0,0.12), 0 0 32px 8px rgba(0,255,128,0.12);
        }
        @keyframes gradientX {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 8s ease-in-out infinite;
        }
        @keyframes pulseRainbow {
          0%, 100% { text-shadow: 0 0 8px #ff00cc, 0 0 16px #00eaff; }
          25% { text-shadow: 0 0 16px #fffb00, 0 0 32px #3333ff; }
          50% { text-shadow: 0 0 24px #00ff94, 0 0 48px #ff00cc; }
          75% { text-shadow: 0 0 16px #00eaff, 0 0 32px #fffb00; }
        }
        .animate-pulse-rainbow {
          animation: pulseRainbow 3s infinite;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminSettings; 