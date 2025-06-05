import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Users, ChevronRight, X, CheckCircle, XCircle, Edit, Save, Trash, AlertTriangle } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import NetworkTreeView from '../components/network/NetworkTreeView';
import { getAllUsersForAdmin, updateUserProfile, updateUserKycStatus, getNetworkMembers, deleteUser, getUserNetworkMembers, setToStorage, getAllUsers } from '../utils/localStorageService';
import { User as UserType, KYCStatus } from '../types';
import { NetworkMember } from '../types';
import axios from 'axios';
import { log } from 'console';
interface UserData extends UserType {
  directReferrals: number;
  teamSize: number;
}

const serverUrl = import.meta.env.VITE_SERVER_URL;

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showNetwork, setShowNetwork] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [networkData, setNetworkData] = useState<NetworkMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    kycStatus: '' as KYCStatus
  });

  // Load user data
  const loadUserData = async () => {
    try {
      const allUsers = await getAllUsers();
      
      // Transform users with direct referrals and team size information
      const usersWithNetworkInfo = await Promise.all(allUsers.map(async user => {
        // Calculate direct referrals (users with this user as sponsor)
        // Check both sponsorId matching user.id and sponsorId matching user.referralCode
        const directReferrals = allUsers.filter(u =>
          (u.sponsorId === user.id) ||
          (u.sponsorId && user.referralCode && u.sponsorId.toUpperCase() === user.referralCode.toUpperCase())
        ).length;

        // Recursively find team members for accurate team size
        const findTeamSize = (userId: string, referralCode: string | undefined, visited = new Set<string>()): number => {
          // Prevent infinite recursion by tracking visited users
          if (!userId || !referralCode || visited.has(userId)) {
            return 0;
          }

          // Add current user to visited set
          visited.add(userId);

          // Find direct downline using both ID and referral code
          const directDownline = allUsers.filter(u =>
            (u.sponsorId === userId) ||
            (u.sponsorId && referralCode && u.sponsorId.toUpperCase() === referralCode.toUpperCase())
          );
          
          let downlineCount = directDownline.length;

          for (const member of directDownline) {
            if (!visited.has(member.id)) {
              downlineCount += findTeamSize(member.id, member.referralCode, visited);
            }
          }

          return downlineCount;
        };

        // Calculate team size excluding the user themselves
        const teamSize = findTeamSize(user.id, user.referralCode || '', new Set<string>());

        return {
          ...user,
          directReferrals,
          teamSize
        };
      }));

      setUsers(usersWithNetworkInfo);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // Check for admin authentication and load user data
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    } else {
      loadUserData();
    }
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowNetwork(false);
    setIsEditing(false);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      kycStatus: user.kycStatus
    });
  };

  // Helper: Build a binary tree from a flat user list (complete binary tree format)
  function buildBinaryTree(rootUser: UserType, allUsers: UserType[]): NetworkMember {
    // Map users by their sponsorId (use '' for null)
    const userMap = new Map<string, UserType[]>();
    allUsers.forEach((user: UserType) => {
      const sponsorKey = user.sponsorId ?? '';
      if (!userMap.has(sponsorKey)) userMap.set(sponsorKey, []);
      userMap.get(sponsorKey)!.push(user);
    });

    // Helper to build a complete binary tree from a list of users
    function buildCompleteBinaryTree(users: UserType[]): NetworkMember[] {
      if (!users.length) return [];
      const nodes = users.map(user => ({
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture || '',
        referralCode: user.referralCode,
        joinDate: user.registrationDate,
        active: true,
        children: [] as NetworkMember[],
      }));
      // Assign children in level order
      for (let i = 0; i < nodes.length; i++) {
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;
        if (leftIdx < nodes.length) nodes[i].children.push(nodes[leftIdx]);
        if (rightIdx < nodes.length) nodes[i].children.push(nodes[rightIdx]);
      }
      return [nodes[0]];
    }

    function buildNode(user: UserType): NetworkMember {
      const directReferrals = userMap.get(user.referralCode ?? '') || [];
      const children = buildCompleteBinaryTree(directReferrals);
      return {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture || '',
        referralCode: user.referralCode,
        joinDate: user.registrationDate,
        active: true,
        children,
      };
    }

    return buildNode(rootUser);
  }

  const handleViewNetwork = async (user: UserData) => {
    setSelectedUser(user);
    setShowNetwork(true);

    // Get all users to build the network structure
    const allUsers = await getAllUsers();
    const userNetworkData = buildBinaryTree(user, allUsers);

    // Save the generated network structure back to localStorage (optional, as before)
    if (userNetworkData) {
      const userNetworkKey = `mlm_network_members_${user.id}`;
      setToStorage(userNetworkKey, userNetworkData);
      console.log(`Created and saved network data for user ${user.name} at key: ${userNetworkKey}`);
    }

    setNetworkData(userNetworkData);
    console.log(`Loaded network for user: ${user.name}`, userNetworkData);
    console.log(`Direct children count: ${userNetworkData?.children?.length || 0}`);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    if (!selectedUser) return;

    const success = updateUserProfile(selectedUser.id, {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      address: editFormData.address,
      kycStatus: editFormData.kycStatus as KYCStatus
    });

    if (success) {
      loadUserData();
      setIsEditing(false);
    }
  };

  const handleUpdateKycStatus = async (userId: string, status: KYCStatus) => {
    // Generate a dummy KYC ID for the API call
    const kycId = `kyc-${userId}-${Date.now()}`;
    const success = await updateUserKycStatus(kycId, userId, status);
    if (success) {
      loadUserData();
      // If the current selected user is the one being updated, update their data
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, kycStatus: status } : null);
      }
    }
  };

  const handleConfirmDelete = (user: UserData) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await axios.delete(`${serverUrl}/api/db/users/${userToDelete.id}`);
      const success = response.data;

      if (success) {
        // If we're deleting the currently selected user, clear it
        if (selectedUser && selectedUser.id === userToDelete.id) {
          setSelectedUser(null);
        }

        setDeleteSuccess(`User ${userToDelete.name} has been deleted successfully`);
        setUserToDelete(null);
        setShowDeleteConfirm(false);
        loadUserData(); // Reload user data

        // Clear success message after 3 seconds
        setTimeout(() => {
          setDeleteSuccess(null);
        }, 3000);
      } else {
        setDeleteError("Failed to delete user. Please try again.");
      }
    } catch (error) {
      setDeleteError("An error occurred while deleting the user.");
      console.error("Delete user error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getUserSponsorName = (sponsorId: string | null) => {
    if (!sponsorId) return 'None (Root User)';

    const sponsor = users.find(user => 
      user.id === sponsorId || 
      (user.referralCode && sponsorId === user.referralCode)
    );
    return sponsor ? sponsor.name : 'Unknown';
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
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))' }}></div>
      </div>
      <div className="mb-6 relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">User Management</h1>
        <p className="text-neutral-600 font-semibold animate-fade-in">Manage users and view their referral networks</p>
      </div>

      {deleteSuccess && (
        <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md">
          {deleteSuccess}
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6 bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
        <div className="flex items-center mb-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500">
              <Search className="h-5 w-5" />
            </span>
            <Input
              placeholder="Search users by name, email, phone or referral code"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card title="Users" className="bg-gradient-to-br from-yellow-100 via-pink-100 via-blue-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-neutral-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(user.registrationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.kycStatus)}`}>
                          {user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div>Direct: {user.directReferrals}</div>
                        <div>Team: {user.teamSize}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewNetwork(user)}
                          >
                            Network
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error-600 hover:text-error-800 hover:bg-error-50"
                            onClick={() => handleConfirmDelete(user)}
                            leftIcon={<Trash className="h-4 w-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* User Details / Network View */}
        <div>
          {selectedUser && !showNetwork && (
            <Card
              title="User Details"
              headerAction={
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                    leftIcon={isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error-600 hover:text-error-800 hover:bg-error-50"
                    onClick={() => handleConfirmDelete(selectedUser)}
                    leftIcon={<Trash className="h-4 w-4" />}
                  >
                    Delete
                  </Button>
                </div>
              }
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Name
                    </label>
                    <Input
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email
                    </label>
                    <Input
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone
                    </label>
                    <Input
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Address
                    </label>
                    <Input
                      name="address"
                      value={editFormData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      KYC Status
                    </label>
                    <select
                      name="kycStatus"
                      value={editFormData.kycStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <Button
                      variant="primary"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Name</h3>
                      <p className="mt-1">{selectedUser.name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                      <p className="mt-1">{selectedUser.email}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Phone</h3>
                      <p className="mt-1">{selectedUser.phone}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Address</h3>
                      <p className="mt-1">{selectedUser.address}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Registration Date</h3>
                      <p className="mt-1">{formatDate(selectedUser.registrationDate)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Sponsor</h3>
                      <p className="mt-1">{getUserSponsorName(selectedUser.sponsorId)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Referral Code</h3>
                      <p className="mt-1">{selectedUser.referralCode}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">KYC Status</h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.kycStatus)}`}>
                          {selectedUser.kycStatus.charAt(0).toUpperCase() + selectedUser.kycStatus.slice(1)}
                        </span>

                        {selectedUser.kycStatus !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateKycStatus(selectedUser.id, 'approved')}
                            leftIcon={<CheckCircle className="h-4 w-4" />}
                          >
                            Approve
                          </Button>
                        )}

                        {selectedUser.kycStatus !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateKycStatus(selectedUser.id, 'rejected')}
                            leftIcon={<XCircle className="h-4 w-4" />}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Network</h3>
                      <div className="mt-1">
                        <div>Direct Referrals: {selectedUser.directReferrals}</div>
                        <div>Team Size: {selectedUser.teamSize}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Network Modal Popup */}
          {selectedUser && showNetwork && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 p-6 overflow-y-auto animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-neutral-900">{selectedUser.name}'s Network</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNetwork(false)}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Close
                  </Button>
                </div>
                <div className="text-sm text-neutral-500 mb-2">Team size: {selectedUser.teamSize} members</div>
                {/* Network Visualization Section */}
                {networkData && networkData.id ? (
                  <div className="overflow-auto py-4 max-h-[60vh]">
                    <NetworkTreeView key={`network-tree-${networkData.children?.length || 0}`} data={networkData} />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-500">No network data available for this user.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedUser && (
            <Card className="bg-gradient-to-br from-green-100 via-yellow-100 via-pink-100 to-blue-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
              <div className="text-center py-10">
                <User className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-2 text-sm font-medium text-neutral-900">No User Selected</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Select a user from the list to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-error-600 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-900">Confirm Delete</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-neutral-700 mb-4">
                Are you sure you want to delete user <strong>{userToDelete.name}</strong>? This action cannot be undone.
              </p>

              {userToDelete.directReferrals > 0 && (
                <div className="bg-warning-50 p-3 rounded-md mb-4">
                  <p className="text-warning-800 text-sm">
                    <strong>Warning:</strong> This user has {userToDelete.directReferrals} direct referrals in their downline.
                    Deleting this user will affect network structures.
                  </p>
                </div>
              )}

              {deleteError && (
                <div className="bg-error-50 p-3 rounded-md mb-4">
                  <p className="text-error-700 text-sm">{deleteError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={handleDeleteUser}
                  isLoading={deleteLoading}
                  leftIcon={<Trash className="h-4 w-4" />}
                  className="bg-error-600 hover:bg-error-700 focus:ring-error-500"
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default AdminUsers; 