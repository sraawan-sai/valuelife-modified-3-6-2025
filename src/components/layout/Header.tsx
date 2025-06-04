import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, User, ChevronDown, LogOut, Settings, Lock } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { getCurrentUser } from '../../utils/localStorageService';
import { User as UserType } from '../../types';

// Define navigation items with KYC requirement
interface NavItem {
  name: string;
  path: string;
  requiresKyc?: boolean;
}

const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();

  // Define navigation items
  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Network', path: '/network', requiresKyc: true },
    { name: 'Wallet', path: '/wallet', requiresKyc: true },
    { name: 'KYC', path: '/kyc' },
    { name: 'Products', path: '/products' }
  ];

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Remove the logged in user from localStorage
    localStorage.removeItem('logged_in_user');
    // Navigate to login page
    navigate('/login');
  };

  const isKycApproved = () => {
    return user?.kycStatus === 'approved';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-md bg-primary-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-neutral-900">VL Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.requiresKyc && !isKycApproved() ? '/kyc' : item.path} 
                className="text-neutral-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                {item.name}
                {item.requiresKyc && !isKycApproved() && (
                  <Lock className="ml-1 h-3.5 w-3.5 text-neutral-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center">
            {/* Notification Bell */}
            <button className="p-2 rounded-full text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 focus:outline-none">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="ml-4 relative">
              <div>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                >
                  <Avatar src={user?.profilePicture} name={user?.name || 'User'} size="sm" />
                  <span className="hidden md:block font-medium text-neutral-800">{user?.name || 'User'}</span>
                  <ChevronDown className="hidden md:block h-4 w-4 text-neutral-500" />
                </button>
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Profile</span>
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden ml-4">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-primary-600 hover:bg-neutral-100 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.requiresKyc && !isKycApproved() ? '/kyc' : item.path}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-primary-600 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
                {item.requiresKyc && !isKycApproved() && (
                  <Lock className="ml-1 h-3.5 w-3.5 text-neutral-400" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;