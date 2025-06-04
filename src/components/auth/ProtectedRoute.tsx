import React, { ReactElement, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/localStorageService';
import { User } from '../../types';

interface ProtectedRouteProps {
  element: ReactElement;
  requiresKyc?: boolean;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    <span className="ml-3 text-neutral-600">Loading...</span>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  element, 
  requiresKyc = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Add a small delay to show loading state (simulates network request)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires KYC verification but user is not approved
  if (requiresKyc && user.kycStatus !== 'approved') {
    return <Navigate to="/kyc" replace />;
  }

  // Return the component if all conditions pass
  return element;
};

export default ProtectedRoute; 