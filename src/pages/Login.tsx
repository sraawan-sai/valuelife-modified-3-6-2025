import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Award, Users, Target, Shield } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getAllUsers, setToStorage, updateCurrentUser } from '../utils/localStorageService';

// For demonstration purposes only - in a real app, use a proper secure verification method
const verifyPassword = (inputPassword: string, storedPassword: string) => {
  return inputPassword === storedPassword;
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgAnim, setBgAnim] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
    setTimeout(() => setBgAnim(true), 500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = await getAllUsers();
      const user = users.find(u => u.distributorId === email); //email is distributorId
      console.log(user);


      if (user && user.password && verifyPassword(password, user.password)) {
        setToStorage('logged_in_user', user.id);
        updateCurrentUser(user);
        navigate('/dashboard');
      } else {
        if (!user) {
          setError('No account found with this email address. Please register first.');
        } else if (user && (!user.password || !verifyPassword(password, user.password))) {
          setError('Incorrect password. Please try again.');
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Premium Quality",
      description: "Our products meet the highest standards of quality and effectiveness"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Support",
      description: "Join thousands of satisfied customers in our growing community"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Goal Achievement",
      description: "We help you reach your health and wealth goals effectively"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Platform",
      description: "Your data and transactions are protected with top-tier security"
    }
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Colorful Background Blobs */}
      <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-pink-400 via-blue-400 to-purple-500 rounded-full filter blur-3xl opacity-30 z-0 transition-all duration-1000 ${bgAnim ? 'scale-110' : 'scale-100'}`}></div>
      <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-yellow-300 via-green-400 to-blue-400 rounded-full filter blur-2xl opacity-20 z-0 transition-all duration-1000 ${bgAnim ? 'scale-125' : 'scale-100'}`}></div>
      {/* Left Side - Company Info */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white relative overflow-hidden shadow-2xl rounded-r-3xl animate-fade-in">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col h-full p-12" data-aos="fade-right">
          <div className="flex items-center space-x-4 mb-12">
            <img src="/images/logo.jpg" alt="Value Life Logo" className="h-16 w-16 object-contain bg-white rounded-xl shadow-lg p-2" />
            <div>
              <h1 className="text-3xl font-bold">Value Life</h1>
              <p className="text-blue-200">Transform Your Life, Create Your Legacy</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="max-w-xl" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-4xl font-bold leading-tight mb-6">
                Welcome to the Future of Health & Wealth
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                At Value Life, we believe in empowering individuals to achieve their fullest potential through holistic well-being and financial growth.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12" data-aos="fade-up" data-aos-delay="400">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-gradient-to-br from-blue-500/30 via-purple-400/20 to-pink-400/20 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 hover:shadow-xl transition-all duration-300 border border-white/10 group animate-pop-in"
                  data-aos="fade-up"
                  data-aos-delay={200 + (index * 100)}
                >
                  <div className="bg-white/30 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-yellow-200 transition-colors duration-200">{feature.title}</h3>
                  <p className="text-blue-100 text-sm group-hover:text-white transition-colors duration-200">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-12" data-aos="fade-up" data-aos-delay="800">
              <div className="flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold">10k+</div>
                  <div className="text-blue-200">Active Users</div>
                </div>
                <div className="h-12 w-px bg-blue-400/30"></div>
                <div>
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-blue-200">Satisfaction Rate</div>
                </div>
                <div className="h-12 w-px bg-blue-400/30"></div>
                <div>
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-blue-200">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-4 sm:px-6 lg:px-12 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative z-10 animate-fade-in">
        <div className="max-w-md w-full mx-auto" data-aos="fade-left">
          <div className="lg:hidden flex items-center justify-center space-x-4 mb-8">
            <img src="/images/logo.jpg" alt="Value Life Logo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Value Life</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to continue your journey towards a better life
            </p>
          </div>

          <div className="bg-white shadow-2xl rounded-2xl p-8 border border-blue-100 animate-pop-in">
            {error && (
              <div className="mb-6 bg-gradient-to-r from-red-100 via-pink-100 to-yellow-100 border-l-4 border-red-400 p-4 rounded-md animate-shake shadow-md" data-aos="fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div data-aos="fade-up" data-aos-delay="200">
                <Input
                  id="distributorId"
                  type="text"
                  label="Distributor ID"
                  value={email} //distributorId
                  onChange={(e) => setEmail(e.target.value)} //distributorId
                  placeholder="Enter your Distributor ID"
                  leftIcon={<Mail className="h-5 w-5 text-blue-500 animate-bounce" />}
                  required
                  className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-blue-700 font-semibold"
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="400">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-5 w-5 text-purple-500 animate-pulse" />}
                    required
                    className="focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 text-purple-700 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-[34px] p-2 text-blue-400 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 animate-fade-in" />
                    ) : (
                      <Eye className="h-5 w-5 animate-fade-in" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between" data-aos="fade-up" data-aos-delay="600">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer accent-purple-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-700 cursor-pointer font-medium">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-purple-600 hover:text-blue-500 transition-colors underline underline-offset-2">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="800">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-pink-600 hover:to-blue-700 transform hover:scale-[1.04] transition-all duration-200 shadow-lg text-white font-bold text-lg border-0"
                >
                  Sign in
                </Button>
              </div>
            </form>

            <div className="mt-8" data-aos="fade-up" data-aos-delay="1000">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-blue-500 font-semibold">
                    New to Value Life?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/register">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    className="border-2 border-blue-400 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transform hover:scale-[1.04] transition-all duration-200 text-blue-700 font-bold"
                  >
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-blue-400 animate-fade-in">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-purple-600 hover:text-blue-500 underline underline-offset-2">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-purple-600 hover:text-blue-500 underline underline-offset-2">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;