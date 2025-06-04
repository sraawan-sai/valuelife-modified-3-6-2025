import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const Users: React.FC = () => {
  return (
    <MainLayout>
      {/* Animated Rainbow Blobs and Gradient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300 via-yellow-200 via-green-200 via-blue-200 to-purple-300 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200 via-pink-200 via-blue-200 to-green-200 rounded-full filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-200 via-pink-200 to-yellow-200 rounded-full filter blur-2xl opacity-10 animate-blob-slow animate-spin"></div>
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-green-200 via-yellow-200 to-pink-200 rounded-full filter blur-2xl opacity-10 animate-blob-fast animate-spin-reverse"></div>
        <div className="absolute left-1/3 top-0 w-60 h-60 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 rounded-full filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute right-1/4 bottom-10 w-40 h-40 bg-gradient-to-tr from-blue-100 via-green-100 to-pink-200 rounded-full filter blur-2xl opacity-20 animate-blob-fast animation-delay-3000"></div>
        <div className="fixed inset-0 animate-bg-gradient" style={{background: 'linear-gradient(120deg, rgba(255,0,150,0.07), rgba(0,229,255,0.07), rgba(255,255,0,0.07))'}}></div>
      </div>
      {/* Custom Animations and Effects */}
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
        @keyframes bgGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% 200%;
          animation: bgGradientMove 16s ease-in-out infinite;
        }
        .animate-blob {
          animation: blobFast 12s ease-in-out infinite;
        }
      `}</style>
    </MainLayout>
  );
};

export default Users; 