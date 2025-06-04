import React, { useEffect, useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { NetworkMember } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { X, ArrowLeft, Search } from 'lucide-react';
import Input from '../ui/Input';

interface NetworkTreeViewProps {
  data: NetworkMember;
}

const CustomNode: React.FC<{ member: NetworkMember; onNodeClick: (member: NetworkMember) => void; onInfoClick: (member: NetworkMember) => void }> = ({ member, onNodeClick, onInfoClick }) => {
  console.log("Member:", member);
  return (
    <div className="relative inline-block">
      <div
        className="bg-white rounded-lg border border-neutral-200 p-2 shadow-sm hover:shadow-md transition-shadow duration-200 min-w-52 cursor-pointer"
        onClick={() => onNodeClick(member)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the div click from triggering
            onInfoClick(member);
          }}
          className="absolute top-1 right-1 p-1 text-neutral-500 hover:text-neutral-700 transition-colors rounded-full hover:bg-neutral-100"
          title="View Details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
        <div className="flex items-center space-x-3">
          <Avatar
            src={member.profilePicture}
            name={member.name}
            size="md"
            status={member.active ? 'online' : 'offline'}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{member.name}</p>
            <p className="text-xs text-neutral-500 truncate">ID: {member.distributorId}...</p>
            <p className="text-xs text-neutral-500 truncate">Code: {member.referralCode}</p>
            <div className="mt-1">
              <Badge
                variant={member.active ? 'success' : 'neutral'}
                size="sm"
                rounded
              >
                {member.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberDetailsModal: React.FC<{ member: NetworkMember; onClose: () => void }> = ({ member, onClose }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Member Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar
              src={member.profilePicture}
              name={member.name}
              size="lg"
              status={member.active ? 'online' : 'offline'}
            />
            <div>
              <h3 className="text-lg font-medium text-neutral-900">{member.name}</h3>
              <p className="text-sm text-neutral-500">ID: {member.distributorId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Referral Code</p>
                  <p className="text-sm text-neutral-900 mt-1">{member.referralCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">Status</p>
                  <div className="mt-1">
                    <Badge
                      variant={member.active ? 'success' : 'neutral'}
                      size="sm"
                      rounded
                    >
                      {member.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-neutral-700">Join Date</p>
              <p className="text-sm text-neutral-900 mt-1">{formatDate(member.joinDate)}</p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-neutral-700">Direct Referrals</p>
              <p className="text-sm text-neutral-900 mt-1">
                {member.children?.length || 0} members
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

const NetworkTreeView: React.FC<NetworkTreeViewProps> = ({ data }) => {
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const [currentRoot, setCurrentRoot] = useState<NetworkMember>(data);
  const [previousRoots, setPreviousRoots] = useState<NetworkMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    console.log("NetworkTreeView received data:", data);

    if (!data || !data.id) {
      console.log("Warning: Invalid network data provided to NetworkTreeView");
      return;
    }
  }, [data]);

  const findMemberInTree = (tree: NetworkMember, searchTerm: string): NetworkMember | null => {
    // Case-insensitive search
    const searchLower = searchTerm.toLowerCase();

    // Check if current member matches
    if (tree.name.toLowerCase().includes(searchLower) ||
      tree.referralCode.toLowerCase().includes(searchLower)) {
      return tree;
    }

    // Search in children
    if (tree.children) {
      for (const child of tree.children) {
        const found = findMemberInTree(child, searchTerm);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  const handleSearch = () => {
    setSearchError(null);
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    // Search by name or referral code
    const foundMember = findMemberInTree(data, searchTerm);

    if (foundMember) {
      setPreviousRoots(prev => [...prev, currentRoot]);
      setCurrentRoot(foundMember);
      setSearchTerm('');
    } else {
      setSearchError('No member found with that referral code');
    }
  };

  const handleNodeClick = (member: NetworkMember) => {
    // Update the tree view
    if (member.children && member.children.length > 0) {
      setPreviousRoots(prev => [...prev, currentRoot]);
      setCurrentRoot(member);
    }
  };

  const handleInfoClick = (member: NetworkMember) => {
    // Show the member details modal
    setSelectedMember(member);
  };

  const handleBackToPrevious = () => {
    if (previousRoots.length > 0) {
      const previousRoot = previousRoots[previousRoots.length - 1];
      setCurrentRoot(previousRoot);
      setPreviousRoots(prev => prev.slice(0, -1));
    }
  };

  // Recursive function to render tree nodes
  const renderTreeNodes = (member: NetworkMember) => {
    if (!member) {
      console.log("Attempted to render undefined member");
      return null;
    }

    if (!member.children || member.children.length === 0) {
      return (
        <TreeNode
          key={member.id}
          label={
            <CustomNode
              member={member}
              onNodeClick={handleNodeClick}
              onInfoClick={handleInfoClick}
            />
          }
        />
      );
    }

    return (
      <TreeNode
        key={member.id}
        label={
          <CustomNode
            member={member}
            onNodeClick={handleNodeClick}
            onInfoClick={handleInfoClick}
          />
        }
      >
        {member.children && member.children.length > 0 && member.children.map((child, index) => {
          if (!child || !child.id) {
            console.log("Warning: Invalid child at index", index);
            return null;
          }
          return (
            <React.Fragment key={child.id || `child-${index}`}>
              <div style={{ textAlign: 'center', color: '#0F52BA', fontWeight: 500, fontSize: '12px', marginBottom: '2px' }}>
                {index === 0 ? 'Left' : index === 1 ? 'Right' : ''}
              </div>
              {renderTreeNodes(child)}
            </React.Fragment>
          );
        })}
      </TreeNode>
    );
  };

  if (!currentRoot || !currentRoot.id) {
    return <div className="p-4 text-center text-neutral-500">No network data available</div>;
  }

  return (
    <div className="px-4 ">
      <div className="flex gap-2 w-full mb-4">
        <input
          type="text"
          placeholder="Search by name or referral code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full border-2 border-gray-300 rounded-md px-4 py-2"
        />
        <Button
          variant="primary"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {searchError && (
        <div className="mb-4 p-2 bg-error-50 text-error-700 rounded-md text-sm">
          {searchError}
        </div>
      )}

      {previousRoots.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToPrevious}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="mb-4"
        >
          Back to Previous Level
        </Button>
      )}

      <div className="pb-10" style={{ overflowX: 'auto', overflowY: 'auto', minWidth: 800, minHeight: 500, maxWidth: '100vw', maxHeight: '70vh' }}>
        <Tree
          lineWidth="2px"
          lineColor="#0F52BA"
          lineBorderRadius="10px"
          label={
            <CustomNode
              member={currentRoot}
              onNodeClick={handleNodeClick}
              onInfoClick={handleInfoClick}
            />
          }
        >
          {currentRoot.children && currentRoot.children.length > 0 ? (
            currentRoot.children.map((child, index) => {
              if (!child || !child.id) {
                console.log("Warning: Invalid root child at index", index);
                return null;
              }
              return (
                <React.Fragment key={child.id || `root-child-${index}`}>
                  {renderTreeNodes(child)}
                </React.Fragment>
              );
            })
          ) : (
            <TreeNode label={<div className="text-neutral-500 text-sm p-2">No referrals yet</div>} />
          )}
        </Tree>
      </div>

      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default NetworkTreeView;