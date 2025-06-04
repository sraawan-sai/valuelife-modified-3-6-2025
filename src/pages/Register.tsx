import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, Users, Award, Target, Shield, BarChart } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { v4 as uuidv4 } from 'uuid';
import { addNewUserWithData, setToStorage, updateCurrentUser, getAllUsers, getFromStorage, isNetworkPositionAvailable } from '../utils/localStorageService';
import { KYCStatus, User as UserType } from '../types';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';

const serverUrl = import.meta.env.VITE_SERVER_URL;

// For demonstration purposes only - in a real app, use a proper secure hashing library
// In a production app, never store passwords in plain text!
const mockHashPassword = (password: string) => {
  return password; // This is just for demonstration purposes
};

// Helper to send welcome SMS
const sendWelcomeSms = async (phone: string, customerId: string, password: string) => {
  // Use the local proxy endpoint to avoid CORS issues
  const url = `${serverUrl}/api/send-sms?phone=${encodeURIComponent(phone)}&customerId=${encodeURIComponent(customerId)}&password=${encodeURIComponent(password)}`;
  try {
    await fetch(url);
  } catch (e) {
    // Optionally log or ignore
    console.error('Failed to send welcome SMS', e);
  }
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    sponsorId: '',
    manualReferralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useManualReferral, setUseManualReferral] = useState(false);
  const [referrer, setReferrer] = useState<UserType | null>(null);
  const [sponsorPosition, setSponsorPosition] = useState<'left' | 'right' | null>(null);
  const [referralPosition, setReferralPosition] = useState<'left' | 'right' | null>(null);
  const [sponsorInfo, setSponsorInfo] = useState<{name: string}|null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref') || '';

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  useEffect(() => {
    const findReferrer = async () => {
      if (referralCode) {
        const users = await getAllUsers();
        const foundReferrer = users.find(user => user.distributorId.toUpperCase() === referralCode.toUpperCase() || user.referralCode.toUpperCase() === referralCode.toUpperCase());
        if (foundReferrer) setReferrer(foundReferrer);
        else setReferrer(null);
      }
    };
    findReferrer();
  }, [referralCode]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (formData.manualReferralCode && formData.manualReferralCode.length >= 3) {
        const users = await getAllUsers();
        const foundReferrer = users.find(user => user.referralCode.toUpperCase() === formData.manualReferralCode.toUpperCase());
        if (foundReferrer) {
          setReferrer(foundReferrer);
          setErrors(prev => { const newErrors = { ...prev }; delete newErrors.manualReferralCode; return newErrors; });
        } else {
          setReferrer(null);
        }
      } else {
        setReferrer(null);
      }
    };
    fetchUsers();
  }, [formData.manualReferralCode]);

  useEffect(() => {
    const fetchSponsor = async () => {
      if (formData.sponsorId && formData.sponsorId.length >= 3) {
        const users = await getAllUsers();
        const foundSponsor = users.find(user => user.distributorId === formData.sponsorId || user.referralCode === formData.sponsorId);
        if (foundSponsor) {
          setSponsorInfo({ name: foundSponsor.name });
          setErrors(prev => { const newErrors = { ...prev }; delete newErrors.sponsorId; return newErrors; });
        } else {
          setSponsorInfo(null);
          setErrors(prev => ({ ...prev, sponsorId: 'Sponsor not found.' }));
        }
      } else {
        setSponsorInfo(null);
      }
    };
    fetchSponsor();
  }, [formData.sponsorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.sponsorId && !sponsorPosition) {
      newErrors.sponsorPosition = 'Please select a position (Left or Right) for Sponsor ID';
    }
    if (!formData.sponsorId && (referralCode || formData.manualReferralCode) && !referralPosition) {
      newErrors.referralPosition = 'Please select a position (Left or Right) for Referral Code';
    }
    if (useManualReferral && formData.manualReferralCode && !referrer) {
      newErrors.manualReferralCode = 'Invalid referral code. No matching user found.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      const hashedPassword = mockHashPassword(formData.password);
      const users = await getAllUsers();
      let sponsor = null;
      let usedReferralCode = '';
      let position: 'left' | 'right' | null = null;
      if (formData.sponsorId) {
        sponsor = users.find(user => user.distributorId === formData.sponsorId || user.referralCode === formData.sponsorId);
        position = sponsorPosition;
        if (sponsor && position) {
          // Check if position is available using the new utility
          const available = await isNetworkPositionAvailable(sponsor.distributorId, position, false);
          if (!available) {
            setPopupMessage(`The ${position} position under sponsor ${sponsor.name} is already occupied. Please choose another position or sponsor.`);
            setIsLoading(false);
            return;
          }
        }
      } else if (useManualReferral && formData.manualReferralCode) {
        sponsor = users.find(user => user.referralCode.toUpperCase() === formData.manualReferralCode.toUpperCase());
        usedReferralCode = formData.manualReferralCode.toUpperCase();
        position = referralPosition;
        if (sponsor && position) {
          const available = await isNetworkPositionAvailable(sponsor.distributorId, position, true);
          if (!available) {
            setPopupMessage(`The ${position} position under referrer ${sponsor.name} is already occupied. Please choose another position or referrer.`);
            setIsLoading(false);
            return;
          }
        }
      } else if (referralCode) {
        sponsor = users.find(user => user.referralCode.toUpperCase() === referralCode.toUpperCase() || user.distributorId.toUpperCase() === referralCode.toUpperCase());
        usedReferralCode = referralCode.toUpperCase();
        position = referralPosition;
        if (sponsor && position) {
          const available = await isNetworkPositionAvailable(sponsor.distributorId, position, true);
          if (!available) {
            setPopupMessage(`The ${position} position under referrer ${sponsor.name} is already occupied. Please choose another position or referrer.`);
            setIsLoading(false);
            return;
          }
        }
      }
      const distributorId = "VL" + Math.floor(100 + Math.random() * 900);
      const newUser = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        distributorId: distributorId,
        profilePicture: '',
        sponsorId: sponsor ? sponsor.distributorId : null,
        referralCode: distributorId,
        registrationDate: new Date().toISOString(),
        kycStatus: 'pending' as KYCStatus,
        kycDocuments: { idProof: '', addressProof: '', bankDetails: '' },
        bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' },
        password: hashedPassword,
        position: position,
      };
      const response = await axios.post(`${serverUrl}/api/db/users`, {
        newUser,
        sponsorId: sponsor ? sponsor.distributorId : null,
        position,
        referralCode: usedReferralCode || undefined
      });
      const createdUser = response.data;
      await sendWelcomeSms(createdUser.phone, createdUser.distributorId, formData.password);
      navigate('/kyc');
    } catch (err) {
      setErrors({ form: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Exclusive Benefits",
      description: "Access premium health products and wealth-building opportunities"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Growing Network",
      description: "Join a community of successful entrepreneurs and health enthusiasts"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Personal Growth",
      description: "Develop skills and knowledge for sustainable success"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Financial Freedom",
      description: "Create multiple streams of income with our proven system"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Company Info */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col h-full p-12" data-aos="fade-right">
          <div className="flex items-center space-x-4 mb-12">
            <img src="/images/logo.jpg" alt="Value Life Logo" className="h-16 w-16 object-contain bg-white rounded-xl shadow-lg p-2" />
            <div>
              <h1 className="text-3xl font-bold">Value Life</h1>
              <p className="text-blue-200">Your Journey to Success Starts Here</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="max-w-xl" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-4xl font-bold leading-tight mb-6">
                Join Our Growing Community of Success
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Discover a world of opportunities where health meets wealth. Start your journey with Value Life today.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                  data-aos="fade-up"
                  data-aos-delay={200 + (index * 100)}
                >
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-blue-100 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-12" data-aos="fade-up" data-aos-delay="800">
              <div className="flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold">50k+</div>
                  <div className="text-blue-200">Products Sold</div>
                </div>
                <div className="h-12 w-px bg-blue-400/30"></div>
                <div>
                  <div className="text-3xl font-bold">₹10Cr+</div>
                  <div className="text-blue-200">Commissions Paid</div>
                </div>
                <div className="h-12 w-px bg-blue-400/30"></div>
                <div>
                  <div className="text-3xl font-bold">15k+</div>
                  <div className="text-blue-200">Active Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-4 sm:px-6 lg:px-12 bg-gray-50">
        <div className="max-w-2xl w-full mx-auto py-8" data-aos="fade-left">
          <div className="lg:hidden flex items-center justify-center space-x-4 mb-8">
            <img src="/images/logo.jpg" alt="Value Life Logo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Value Life</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join Value Life and start your journey to success
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            {errors.form && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-shake">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errors.form}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-aos="fade-up" data-aos-delay="200">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    leftIcon={<User className="h-5 w-5" />}
                    required
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="300">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email"
                    leftIcon={<Mail className="h-5 w-5" />}
                    required
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="400">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="Enter your phone number"
                    leftIcon={<Phone className="h-5 w-5" />}
                    required
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="500">
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    label="Address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="Enter your address"
                    leftIcon={<MapPin className="h-5 w-5" />}
                    required
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="600">
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="Create a password"
                      leftIcon={<Lock className="h-5 w-5" />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-[34px] p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div data-aos="fade-up" data-aos-delay="700">
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      placeholder="Confirm your password"
                      leftIcon={<Lock className="h-5 w-5" />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-[34px] p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sponsor ID Section */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="font-semibold text-gray-800 mb-2">Register with Referral Code</div>
                  <Input
                    id="sponsorId"
                    name="sponsorId"
                    type="text"
                    label="referral code"
                    value={formData.sponsorId}
                    onChange={handleChange}
                    error={errors.sponsorId}
                    placeholder="Enter your Referral Code or Position ID"
                    leftIcon={<Users className="h-5 w-5" />}
                  />
                  {sponsorInfo && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 mt-2">
                      <p className="text-sm text-green-700">
                        Sponsor: <span className="font-medium">{sponsorInfo.name}</span>
                      </p>
                    </div>
                  )}
                  {errors.sponsorId && formData.sponsorId && !sponsorInfo && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-2">
                      <p className="text-sm text-red-700">{errors.sponsorId}</p>
                    </div>
                  )}
                  {formData.sponsorId && (
                    <>
                      <div className="mb-1 mt-4 text-sm text-gray-700 font-medium">
                        Select position for Sponsor ID (Left or Right):
                      </div>
                      <div className="flex space-x-4 mt-2">
                        <Button
                          type="button"
                          variant={sponsorPosition === 'left' ? 'primary' : 'secondary'}
                          className={`flex-1 ${sponsorPosition === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                          onClick={() => setSponsorPosition('left')}
                        >
                          Left
                        </Button>
                        <Button
                          type="button"
                          variant={sponsorPosition === 'right' ? 'primary' : 'secondary'}
                          className={`flex-1 ${sponsorPosition === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                          onClick={() => setSponsorPosition('right')}
                        >
                          Right
                        </Button>
                      </div>
                      {errors.sponsorPosition && (
                        <div className="text-red-600 text-sm mt-1">{errors.sponsorPosition}</div>
                      )}
                    </>
                  )}
                </div>
                {/* Referral Code Section */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="font-semibold text-gray-800 mb-2">Register with Position ID</div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Position ID</label>
                    <button
                      type="button"
                      onClick={() => setUseManualReferral(!useManualReferral)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {useManualReferral ? 'Use URL Code' : 'Enter Manual Code'}
                    </button>
                  </div>
                  {useManualReferral ? (
                    <Input
                      id="manualReferralCode"
                      name="manualReferralCode"
                      type="text"
                      value={formData.manualReferralCode}
                      onChange={handleChange}
                      error={errors.manualReferralCode}
                      placeholder="Enter Position ID"
                      leftIcon={<Users className="h-5 w-5" />}
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        {referralCode ? (
                          <>Using referral code: <span className="font-medium text-blue-600">{referralCode}</span></>
                        ) : (
                          'No referral code provided in URL'
                        )}
                      </p>
                    </div>
                  )}
                  {referrer && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 mt-2">
                      <p className="text-sm text-green-700">
                        Referred by: <span className="font-medium">{referrer.name}</span>
                      </p>
                    </div>
                  )}
                  {(referralCode || formData.manualReferralCode) && (
                    <>
                      <div className="mb-1 mt-4 text-sm text-gray-700 font-medium">
                        Select your position in the network (Left or Right) for your referrer:
                      </div>
                      <div className="flex space-x-4 mt-2">
                        <Button
                          type="button"
                          variant={referralPosition === 'left' ? 'primary' : 'secondary'}
                          className={`flex-1 ${referralPosition === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                          onClick={() => setReferralPosition('left')}
                        >
                          Left
                        </Button>
                        <Button
                          type="button"
                          variant={referralPosition === 'right' ? 'primary' : 'secondary'}
                          className={`flex-1 ${referralPosition === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border border-gray-300'}`}
                          onClick={() => setReferralPosition('right')}
                        >
                          Right
                        </Button>
                      </div>
                      {errors.referralPosition && (
                        <div className="text-red-600 text-sm mt-1">{errors.referralPosition}</div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div data-aos="fade-up" data-aos-delay="900">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200"
                >
                  Create Account
                </Button>
              </div>
            </form>

            {/* Popup Modal for position taken */}
            {popupMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                  <div className="mb-4 text-lg font-semibold text-red-600">Position Unavailable</div>
                  <div className="mb-6 text-gray-700">{popupMessage}</div>
                  <Button variant="primary" onClick={() => setPopupMessage(null)}>
                    OK
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center" data-aos="fade-up" data-aos-delay="1000">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;