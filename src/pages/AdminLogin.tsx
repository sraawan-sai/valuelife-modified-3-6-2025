import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
// import { validateAdminCredentials } from '../utils/localStorageService';
import axios from "axios"

const serverUrl = import.meta.env.VITE_SERVER_URL

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${serverUrl}/api/db/admin/admin/login`, {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.success) {
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError(response.data.error || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const parallaxEffect = () => {
    const handleMouseMove = (e: MouseEvent) => {
      const blobs = document.querySelectorAll('.parallax-blob');
      const w = window.innerWidth, h = window.innerHeight;
      const x = (e.clientX - w / 2) / w * 2;
      const y = (e.clientY - h / 2) / h * 2;
      blobs.forEach((blob) => {
        const parallax = blob.getAttribute('data-parallax');
        if (parallax) {
          const [dx, dy] = parallax.split(',').map(Number);
          (blob as HTMLElement).style.transform = `translate(${x * dx}px, ${y * dy}px)`;
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  };

  useEffect(() => {
    return parallaxEffect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 relative overflow-hidden">
      {/* Animated Colorful Blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300 via-yellow-200 via-green-200 via-blue-200 to-purple-300 rounded-full filter blur-3xl opacity-30 z-0 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200 via-pink-200 via-blue-200 to-green-200 rounded-full filter blur-2xl opacity-20 z-0 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-200 via-pink-200 to-yellow-200 rounded-full filter blur-2xl opacity-10 z-0 animate-blob-slow animate-spin"></div>
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-green-200 via-yellow-200 to-pink-200 rounded-full filter blur-2xl opacity-10 z-0 animate-blob-fast animate-spin-reverse"></div>
      {/* Subtle animated gradient overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 animate-bg-gradient" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.07), rgba(0,229,255,0.07), rgba(255,255,0,0.07))' }}></div>
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 z-10">
        {/* Left: Login Section */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">VL Portal Admin</h1>
            <p className="text-lg font-medium text-neutral-500 mt-2">Admin Panel Access</p>
          </div>
          <Card className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl w-full border border-blue-100 floating-card rainbow-border-glow animate-card-pop">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6 text-center">Admin Login</h2>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm mb-4 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Input
                      name="username"
                      label="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter admin username"
                      leftIcon={<User className="h-5 w-5 text-neutral-400" />}
                    />
                    <Input
                      name="password"
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter admin password"
                      leftIcon={<Lock className="h-5 w-5 text-neutral-400" />}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                  className="transition-transform duration-300 hover:scale-105 hover:shadow-xl animate-glow-btn"
                >
                  Login to Admin Panel
                </Button>
              </div>
            </form>
          </Card>
        </div>
        {/* Divider for desktop */}
        <div className="hidden md:block h-96 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-40 mx-2"></div>
        {/* Right: Admin Features Section */}
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center tracking-tight">What Can Admins Do?</h2>
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Manage Users */}
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow feature-card min-h-[120px] min-w-[120px] border border-blue-100">
              <span className="bg-blue-100 p-3 rounded-full shadow mb-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="font-medium text-neutral-800 text-sm mt-1 text-center">Manage Users</span>
            </div>
            {/* Approve KYC */}
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow feature-card min-h-[120px] min-w-[120px] border border-blue-100">
              <span className="bg-purple-100 p-3 rounded-full shadow mb-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="font-medium text-neutral-800 text-sm mt-1 text-center">Approve KYC</span>
            </div>
            {/* View Transactions */}
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow feature-card min-h-[120px] min-w-[120px] border border-blue-100">
              <span className="bg-blue-100 p-3 rounded-full shadow mb-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 8v4l3 3" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2" /></svg>
              </span>
              <span className="font-medium text-neutral-800 text-sm mt-1 text-center">View Transactions</span>
            </div>
            {/* Manage Products */}
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow feature-card min-h-[120px] min-w-[120px] border border-blue-100">
              <span className="bg-purple-100 p-3 rounded-full shadow mb-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#8b5cf6" strokeWidth="2" /><path d="M16 3v4M8 3v4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
              <span className="font-medium text-neutral-800 text-sm mt-1 text-center">Manage Products</span>
            </div>
          </div>
        </div>
      </div>
      {/* Custom Animations and Effects */}
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating-card {
          animation: floating 4s ease-in-out infinite;
        }
        @keyframes rainbowGlow {
          0% { box-shadow: 0 0 16px 2px #ff00cc44, 0 0 32px 8px #3333ff22; }
          25% { box-shadow: 0 0 24px 4px #00eaff44, 0 0 40px 12px #fffb0044; }
          50% { box-shadow: 0 0 32px 8px #00ff9444, 0 0 48px 16px #ff00cc44; }
          75% { box-shadow: 0 0 24px 4px #fffb0044, 0 0 40px 12px #00eaff44; }
          100% { box-shadow: 0 0 16px 2px #ff00cc44, 0 0 32px 8px #3333ff22; }
        }
        .rainbow-border-glow {
          border-image: linear-gradient(90deg, #ff00cc, #3333ff, #00eaff, #fffb00, #00ff94, #ff00cc) 1;
          animation: rainbowGlow 6s linear infinite;
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
        /* Animated background gradient */
        @keyframes bgGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% 200%;
          animation: bgGradientMove 16s ease-in-out infinite;
        }
        /* Card pop and glow */
        @keyframes cardPop {
          0% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
          50% { transform: scale(1.02); box-shadow: 0 0 32px 8px #ff00cc44; }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
        }
        .animate-card-pop {
          animation: cardPop 6s ease-in-out infinite;
        }
        /* Button glow */
        @keyframes glowBtn {
          0%, 100% { box-shadow: 0 0 0 0 #a259f7; }
          50% { box-shadow: 0 0 16px 4px #a259f7; }
        }
        .animate-glow-btn {
          animation: glowBtn 2.5s infinite;
        }
        /* Gradient heading animation */
        @keyframes gradientX {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin; 
