import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, AlertTriangle, Eye, DollarSign, CreditCard, RefreshCw } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { getWithdrawalRequests, updateWithdrawalStatus, WithdrawalRequest } from '../services/walletService';
import { processPayout, getRazorpayBalance } from '../services/razorpayService';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../utils/localStorageService';
import { User } from '../types';

const AdminWithdrawals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [razorpayBalance, setRazorpayBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load withdrawal requests and Razorpay balance
  const loadData = async () => {
    // Check for admin authentication
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    const user = getCurrentUser();
    console.log("Current user in AdminWithdrawals:", user);

    
if (!user?.id) {
  console.error("❌ Missing user ID — cannot fetch withdrawal requests.");
  return;
}
    // Load withdrawal requests
    const requests = await getWithdrawalRequests(user?.id);
    setWithdrawalRequests(requests);

    // Load Razorpay balance
    loadRazorpayBalance();
  };

  const loadRazorpayBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const balance = await getRazorpayBalance();
      setRazorpayBalance(balance);
    } catch (error) {
      console.error('Error loading Razorpay balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const filteredRequests = withdrawalRequests.filter(request => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApproveRequest = async (request: WithdrawalRequest) => {
    // Update request status to approved
    console.log(request,"handleApproveRequest request")
    const success = await updateWithdrawalStatus(request.id, 'approved', 'Approved by admin');
    if (success) {
      toast.success(`Request approved for ${request.userName}`);
      loadData();
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (request: WithdrawalRequest) => {
    // Update request status to rejected
    const success = await updateWithdrawalStatus(request.id, 'rejected', 'Rejected by admin');
    if (success) {
      toast.success(`Request rejected for ${request.userName}`);
      loadData();
    } else {
      toast.error('Failed to reject request');
    }
  };

  const handleProcessPayment = async (request: WithdrawalRequest) => {
    setIsProcessing(true);

    try {
      toast.loading("Initializing Razorpay payment gateway...");

      // Process the payout using Razorpay (this will open the Razorpay checkout UI)
      const result = await processPayout(request);

      toast.dismiss(); // Remove loading toast

      if (result.success && result.data) {
        // Update withdrawal request status
        const updateSuccess = await updateWithdrawalStatus(
          request.id,
          'paid',
          'Processed through Razorpay',
          result.data.id
        );

        if (updateSuccess) {
          toast.success(`Payment of ₹${request.amount} processed successfully to ${request.accountDetails.accountHolderName}`);
          setShowDetailsModal(false);
          loadData();
        } else {
          toast.error('Failed to update withdrawal status');
        }
      } else {
        toast.error(`Payment failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.dismiss(); // Remove loading toast
      console.error('Error processing payment:', error);

      if (error instanceof Error && error.message === "Payment cancelled by user") {
        toast.error("Payment cancelled by user");
      } else {
        toast.error('Payment processing failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800';
      case 'paid':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800';
      case 'pending':
      default:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success-600 animate-pulse" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-error-600 animate-pulse" />;
      case 'paid':
        return <CreditCard className="h-4 w-4 text-primary-600 animate-pulse" />;
      case 'pending':
      default:
        return <AlertTriangle className="h-4 w-4 text-warning-600 animate-pulse" />;
    }
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
        {/* Small blobs for sparkle effect */}
        <div className="absolute left-1/2 top-1/3 w-24 h-24 bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 rounded-full filter blur-lg opacity-40 animate-blob animation-delay-1000"></div>
        <div className="absolute right-1/3 bottom-1/4 w-16 h-16 bg-gradient-to-tr from-green-200 via-blue-200 to-purple-200 rounded-full filter blur-lg opacity-30 animate-blob animation-delay-2500"></div>
        {/* Gradient overlay */}
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))' }}></div>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">Withdrawal Requests</h1>
        <p className="text-neutral-600 font-semibold animate-fade-in">Manage and process user withdrawal requests</p>
      </div>

      {/* Balance and Controls */}
      <Card className="mb-6 bg-gradient-to-br from-blue-100 via-pink-100 via-yellow-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-gradient-to-tr from-blue-200 via-pink-200 to-yellow-200 rounded-full text-accent-600 mr-4 animate-feature-glow">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-neutral-600">Razorpay Account Balance:</span>
              {isLoadingBalance ? (
                <span className="text-sm text-neutral-500">Loading...</span>
              ) : (
                <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 animate-gradient-x">
                  ₹{(razorpayBalance !== null ? razorpayBalance / 100 : 0).toLocaleString('en-IN')}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRazorpayBalance}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="animate-hover-glow"
              >
                Refresh
              </Button>
            </div>
          </div> */}

          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-neutral-600">Status:</label>
              <select
                value={filterStatus}
                onChange={handleStatusFilter}
                className="rounded-md border-neutral-300 text-sm bg-white/70 backdrop-blur-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 text-sm w-full bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Withdrawal Requests Table */}
      <Card title="Withdrawal Requests" className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-gradient-to-r from-pink-50 via-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">
                    No withdrawal requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gradient-to-r hover:from-pink-50 hover:via-blue-50 hover:to-purple-50 transition-colors duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-neutral-900 truncate max-w-[200px]">
                            {request.userName}
                          </div>
                          <div className="text-xs text-neutral-500 truncate max-w-[200px]">
                            ID: {request.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">₹{request.amount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{formatDate(request.requestDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                          leftIcon={<Eye className="h-4 w-4" />}
                          className="text-primary-600 hover:text-primary-700 animate-hover-glow"
                        >
                          View
                        </Button>

                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveRequest(request)}
                              leftIcon={<CheckCircle className="h-4 w-4" />}
                              className="animate-hover-glow bg-green-500 hover:bg-green-600 text-white"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRejectRequest(request)}
                              leftIcon={<XCircle className="h-4 w-4" />}
                              className="animate-hover-glow bg-red-500 hover:bg-red-600 text-white"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {request.status === 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleProcessPayment(request)}
                            leftIcon={<CreditCard className="h-4 w-4" />}
                            className="animate-hover-glow"
                          >
                            Process
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Withdrawal Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full bg-gradient-to-br from-white via-pink-50 to-blue-50 rainbow-border-glow animate-card-pop">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600" id="modal-title">
                      Withdrawal Request Details
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-sm font-medium text-neutral-500">User</p>
                          <p className="text-base font-semibold text-neutral-900">{selectedRequest.userName}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-sm font-medium text-neutral-500">User ID</p>
                          <p className="text-base font-semibold text-neutral-900">{selectedRequest.userId}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-sm font-medium text-neutral-500">Amount</p>
                          <p className="text-base font-semibold text-green-600">₹{selectedRequest.amount.toFixed(2)}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-sm font-medium text-neutral-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusIcon(selectedRequest.status)}
                            <span className="ml-1">{selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}</span>
                          </span>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-neutral-500">Request Date</p>
                          <p className="text-base font-semibold text-neutral-900">{formatDate(selectedRequest.requestDate)}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-neutral-500">Account Details</p>
                          <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg">
                            <p className="text-sm"><span className="font-medium">Account Holder:</span> {selectedRequest.accountDetails.accountHolderName}</p>
                            <p className="text-sm"><span className="font-medium">Account Number:</span> {selectedRequest.accountDetails.accountNumber}</p>
                            <p className="text-sm"><span className="font-medium">IFSC Code:</span> {selectedRequest.accountDetails.ifscCode}</p>
                            <p className="text-sm"><span className="font-medium">Bank Name:</span> {selectedRequest.accountDetails.bankName}</p>
                          </div>
                        </div>
                        {selectedRequest.remarks && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-neutral-500">Notes</p>
                            <p className="text-base text-neutral-900">{selectedRequest.remarks}</p>
                          </div>
                        )}
                        {selectedRequest.transactionId && (
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-neutral-500">Payment ID</p>
                            <p className="text-base font-mono text-neutral-900">{selectedRequest.transactionId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-pink-50 via-blue-50 to-purple-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full sm:w-auto sm:ml-3 animate-hover-glow"
                >
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleApproveRequest(selectedRequest);
                        setShowDetailsModal(false);
                      }}
                      className="w-full sm:w-auto sm:ml-3 mt-3 sm:mt-0 animate-hover-glow bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleRejectRequest(selectedRequest);
                        setShowDetailsModal(false);
                      }}
                      className="w-full sm:w-auto sm:ml-3 mt-3 sm:mt-0 animate-hover-glow bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <Button
                    variant="primary"
                    onClick={() => handleProcessPayment(selectedRequest)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto sm:ml-3 mt-3 sm:mt-0 animate-hover-glow"
                  >
                    {isProcessing ? 'Processing...' : 'Process Payment'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWithdrawals; 