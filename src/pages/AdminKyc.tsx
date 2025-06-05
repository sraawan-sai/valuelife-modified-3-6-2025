import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getAllKycRequests, updateUserKycStatus, KycRequest, getAllUsersForAdmin } from '../utils/localStorageService';
import { User } from '../types';

const AdminKyc: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
const serverUrl = import.meta.env.VITE_SERVER_URL
  // Load KYC requests and users
  const loadKycData = async () => {
    const requests = await getAllKycRequests();
    const allUsers = await getAllUsersForAdmin();
    setKycRequests(requests);
    setUsers(allUsers);
  };

  // Check for admin authentication and load data
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      loadKycData();
    }
  }, [navigate]);

  const handleApprove = (request: KycRequest) => {
    const success = updateUserKycStatus(request.id, request.userId, 'approved');
    if (success) {
      // Reload data to reflect changes
      loadKycData();
      setSelectedRequest(null);
    }
  };

  const handleReject = (request: KycRequest) => {
    if (showNoteInput) {
      const success = updateUserKycStatus(request.id, request.userId, 'rejected', rejectionNote);
      if (success) {
        // Reload data to reflect changes
        loadKycData();
        setSelectedRequest(null);
        setShowNoteInput(false);
        setRejectionNote('');
      }
    } else {
      setShowNoteInput(true);
    }
  };

  const handleDelete = async (request: KycRequest) => {
  if (window.confirm(`Are you sure you want to delete the KYC request from ${request.userName}?`)) {
    console.log(request.id)
    try {
      const response = await fetch(`${serverUrl}/api/db/kycRequests/${request.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete KYC request');
      }

      // Reload updated data
      await loadKycData();

      // Clear selection if the deleted one was selected
      if (selectedRequest && selectedRequest.id === request.id) {
        setSelectedRequest(null);
      }

      alert('KYC request deleted successfully');
    } catch (error) {
      console.error('Error deleting KYC request:', error);
      alert('Failed to delete KYC request');
    }
  }
};

  const cancelRejection = () => {
    setShowNoteInput(false);
    setRejectionNote('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get the pending KYC requests
  const pendingRequests = kycRequests.filter(req => req.status === 'pending');

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
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))' }}></div>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">KYC Approval Management</h1>
        <p className="text-neutral-600 font-semibold animate-fade-in">Review and manage KYC verification requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KYC Requests List */}
        <div className="lg:col-span-2">
          <Card title="Pending KYC Requests" className="bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {pendingRequests.map((request) => {
                    const user = users.find(u => u.id === request.userId);
                    return (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-neutral-900">
                            {user ? user.name : request.userName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            ID: {request.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {formatDate(request.submissionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            leftIcon={<Eye className="h-4 w-4" />}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request)}
                            leftIcon={<XCircle className="h-4 w-4" />}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-neutral-500">
                        No pending KYC requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* All KYC Requests */}
          <div className="mt-6">
            <Card title="All KYC Requests" className="bg-gradient-to-br from-yellow-100 via-pink-100 via-blue-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {kycRequests.map((request) => {
                      const user = users.find(u => u.id === request.userId);
                      return (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-neutral-900">
                              {user ? user.name : request.userName}
                            </div>
                            <div className="text-xs text-neutral-500">
                              ID: {request.userId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {formatDate(request.submissionDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${request.status === 'approved' ? 'bg-success-100 text-success-800' :
                                request.status === 'rejected' ? 'bg-error-100 text-error-800' :
                                  'bg-warning-100 text-warning-800'}`}
                            >
                              {request.status === 'approved' ? 'Approved' :
                                request.status === 'rejected' ? 'Rejected' :
                                  'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              leftIcon={<Eye className="h-4 w-4" />}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {kycRequests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-neutral-500">
                          No KYC requests
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* KYC Details Panel */}
        <div>
          <Card title="KYC Details" className="bg-gradient-to-br from-blue-100 via-pink-100 via-yellow-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
            {selectedRequest ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    {users.find(u => u.id === selectedRequest.userId)?.name || selectedRequest.userName}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    User ID: {selectedRequest.userId}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Document Type: {selectedRequest.documentType}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Id: {selectedRequest.inputValue}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Submitted: {formatDate(selectedRequest.submissionDate)}
                  </p>
                  {selectedRequest.reviewDate && (
                    <p className="text-sm text-neutral-500">
                      Reviewed: {formatDate(selectedRequest.reviewDate)}
                    </p>
                  )}
                  {selectedRequest.reviewNotes && (
                    <div className="mt-2 p-2 bg-neutral-50 rounded text-sm">
                      <p className="font-medium">Review Notes:</p>
                      <p>{selectedRequest.reviewNotes}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="pt-4">
                    {showNoteInput ? (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="rejectionNote" className="block text-sm font-medium text-neutral-700 mb-1">
                            Rejection Note
                          </label>
                          <textarea
                            id="rejectionNote"
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            placeholder="Explain why the KYC is being rejected..."
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                          ></textarea>
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            variant="primary"
                            onClick={() => handleReject(selectedRequest)}
                          >
                            Confirm Rejection
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancelRejection}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <Button
                          variant="primary"
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                          onClick={() => handleApprove(selectedRequest)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          leftIcon={<XCircle className="h-4 w-4" />}
                          onClick={() => handleReject(selectedRequest)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-neutral-500">
                  Select a KYC request to view details
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

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
          0%, 100% { filter: drop-shadow(0 0 0 #ff00cc); }
          50% { filter: drop-shadow(0 0 16px #ff00cc); }
        }
        .animate-pulse-rainbow {
          animation: pulseRainbow 2.5s infinite;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminKyc;
