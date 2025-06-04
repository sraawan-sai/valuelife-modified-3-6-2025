import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileCheck,
  User,
  Share2,
  Settings,
  HelpCircle,
  Package,
  Lock
} from 'lucide-react';
import { getCurrentUser } from '../../utils/localStorageService';
import { User as UserType } from '../../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  requiresKyc?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'My Network',
      path: '/network',
      icon: <Users className="h-5 w-5" />,
      requiresKyc: true
    },
    {
      name: 'Products',
      path: '/products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: 'Wallet',
      path: '/wallet',
      icon: <Wallet className="h-5 w-5" />,
      requiresKyc: true
    },
    {
      name: 'KYC Verification',
      path: '/kyc',
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      name: 'Referral Tools',
      path: '/referrals',
      icon: <Share2 className="h-5 w-5" />,
      requiresKyc: true
    },
  ];

  const bottomNavItems: NavItem[] = [
    // {
    //   name: 'Settings',
    //   path: '/settings',
    //   icon: <Settings className="h-5 w-5" />,
    // },
    {
      name: 'Help & Support',
      path: '/support',
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  const isKycApproved = () => {
    return user?.kycStatus === 'approved';
  };

  return (
    <div className="py-8 px-6 h-screen w-72 fixed top-0 left-0 flex flex-col bg-gradient-to-b from-[#2eb6ff] to-[#ff8214] shadow-xl border-r border-white/30 z-30">
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.requiresKyc && !isKycApproved() ? '/kyc' : item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 text-lg font-semibold rounded-xl transition-colors duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#2eb6ff] ${
                isActive ? 'bg-white/40 text-[#2eb6ff] font-bold shadow-lg' : 'text-white/90 hover:bg-white/20 hover:text-white'
              } ${item.requiresKyc && !isKycApproved() ? 'opacity-70' : ''}`
            }
            tabIndex={0}
          >
            <span className="mr-4">{React.cloneElement(item.icon as React.ReactElement, { className: 'h-7 w-7' })}</span>
            {item.name}
            {item.requiresKyc && !isKycApproved() && (
              <span className="ml-auto">
                <Lock className="h-4 w-4 text-white" />
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-8 mt-8 border-t border-neutral-200">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.requiresKyc && !isKycApproved() ? '/kyc' : item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 text-lg font-semibold rounded-xl transition-colors duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#2eb6ff] ${
                isActive ? 'bg-white/40 text-[#2eb6ff] font-bold shadow-lg' : 'text-white/90 hover:bg-white/20 hover:text-white'
              } ${item.requiresKyc && !isKycApproved() ? 'opacity-70' : ''}`
            }
            tabIndex={0}
          >
            <span className="mr-4">{React.cloneElement(item.icon as React.ReactElement, { className: 'h-7 w-7' })}</span>
            {item.name}
            {item.requiresKyc && !isKycApproved() && (
              <span className="ml-auto">
                <Lock className="h-4 w-4 text-neutral-400" />
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-8 mb-16 px-6 py-6 bg-primary-50 rounded-2xl">
        <h3 className="text-lg font-semibold text-primary-800">Referral Status</h3>
        <p className="mt-2 text-base text-primary-600">3 Direct Referrals</p>
        <div className="mt-3 relative pt-1">
          <div className="overflow-hidden h-3 text-xs flex rounded bg-primary-200">
            <div
              style={{ width: "30%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
            ></div>
          </div>
          <p className="mt-2 text-sm text-primary-600">3/10 to next milestone</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;