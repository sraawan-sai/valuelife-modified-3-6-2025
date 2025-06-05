import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeDatabase, getCurrentUser, updateCurrentUser } from './utils/jsonDbService';

// Log the start of initialization
console.log("🚀 Starting JSON database initialization...");

// Initialize database with mock data on app launch
try {
  initializeDatabase();
  console.log("✅ JSON database initialization called successfully");
} catch (error) {
  console.error("❌ Error during database initialization:", error);
}

// Add a default password to the default user for demonstration purposes
const setupDefaultUser = () => {
  try {
    const currentUser = getCurrentUser();
    console.log("👤 Current user check result:", currentUser ? "Found user" : "No user found");
    if (currentUser && !currentUser.password) {
      updateCurrentUser({
        ...currentUser,
        password: 'password' // In a real app, this would be hashed
      });
      console.log("✅ Default user password has been set");
    }
  } catch (error) {
    console.error("❌ Error setting up default user:", error);
  }
};

// Setup the default user
setupDefaultUser();

// Log React Router version
console.log("Using React Router version from package.json");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
