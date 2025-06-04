import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Package, FileCheck, LayoutDashboard, Settings, DollarSign } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/admin/kyc', label: 'KYC Approvals', icon: <FileCheck className="h-5 w-5" /> },
    { path: '/admin/products', label: 'Products', icon: <Package className="h-5 w-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Admin Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">VL Portal</span>
                <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-md">
                  Admin
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          {/* Admin Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 pt-6">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-md
                    ${location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100'
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 py-6 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 