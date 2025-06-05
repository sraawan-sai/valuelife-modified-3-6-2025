import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { getCurrentUser, getFromStorage } from '../../utils/localStorageService';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const loggedInUserId = getFromStorage<string>('logged_in_user');
    const currentUser = getCurrentUser();
    
    if (!loggedInUserId || !currentUser) {
      // If no logged in user, redirect to login
      navigate('/login');
      return;
    }
    
    setIsLoading(false);
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0">
            <Sidebar />
          </div>
          <main className="flex-1 py-6 px-2 md:px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;