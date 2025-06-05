import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Users, Share2, Copy, Download, Globe, Facebook, Twitter, Instagram, Check, Edit, X, Image } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getCurrentUser } from '../utils/localStorageService';
import { User } from '../types';
import KycRequired from '../components/auth/KycRequired';

const Referrals: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [customSuffix, setCustomSuffix] = useState('');
  const [showCustomizeError, setShowCustomizeError] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // useEffect(() => {
  //   // Get current user from local storage
  //   const user = getCurrentUser();
  //   setCurrentUser(user);
  // }, []);
  
  // Get user from local storage (in a real app this would be more robust)
  // const user = currentUser ;
  // console.log(user?.referralCode,"referalUSer")
  
  // Sample referral data
  const baseUrl = `${window.location.origin}/register/`
  const [referralCode, setReferralCode] =  useState<string | undefined>();
  const [referralLink, setReferralLink] = useState('');
    const [socialTemplates, setSocialTemplates] = useState([
    { id: 1, platform: 'Facebook', icon: <Facebook className="h-4 w-4 text-[#1877F2]" />, message: '', selected: true },
    { id: 2, platform: 'Twitter', icon: <Twitter className="h-4 w-4 text-[#1DA1F2]" />, message: '', selected: false },
    { id: 3, platform: 'Instagram', icon: <Instagram className="h-4 w-4 text-[#E4405F]" />, message: '', selected: false },
    { id: 4, platform: 'WhatsApp', icon: <Share2 className="h-4 w-4 text-[#25D366]" />, message: '', selected: false }
  ]);
  useEffect(() => {
    const runSetup = async () => {
      // Step 1: Load user
      const user = getCurrentUser();
      setCurrentUser(user);

      // Step 2: If user has a referral code
      if (user?.referralCode) {
        const code = user.referralCode;
        const link = `${baseUrl}${code.toLowerCase()}`;
        setReferralCode(code);
        setReferralLink(link);

        // Step 3: Update socialTemplates
        const updatedTemplates = socialTemplates.map(template => ({
          ...template,
          message: getMessageTemplate(template.platform, code)
        }));
        setSocialTemplates(updatedTemplates);
      }
    };

    runSetup();
  }, []); // ✅ Only runs once on mount
  
  // Marketing materials (sample data)
  const marketingMaterials = [
    { id: 1, name: 'Product Brochure.pdf', type: 'PDF', size: '2.4 MB', url: '#' },
    { id: 2, name: 'Compensation Plan.pdf', type: 'PDF', size: '1.8 MB', url: '#' },
    { id: 3, name: 'Company Presentation.pptx', type: 'PPTX', size: '5.6 MB', url: '#' },
    { id: 4, name: 'Product Images.zip', type: 'ZIP', size: '8.2 MB', url: '#' },
    { id: 5, name: 'Video Introduction.mp4', type: 'MP4', size: '12.5 MB', url: '#' },
  ];
  
  // Sample social media templates
  // const [socialTemplates, setSocialTemplates] = useState([
  //   { 
  //     id: 1, 
  //     platform: 'Facebook',
  //     icon: <Facebook className="h-4 w-4 text-[#1877F2]" />,
  //     message: `I've joined Value Life and I'm loving the products and opportunity! Join me using my referral link: ${referralLink}`,
  //     selected: true
  //   },
  //   { 
  //     id: 2, 
  //     platform: 'Twitter',
  //     icon: <Twitter className="h-4 w-4 text-[#1DA1F2]" />,
  //     message: `Check out these amazing health products from Value Life! Use my referral link to join: ${referralLink}`,
  //     selected: false
  //   },
  //   { 
  //     id: 3, 
  //     platform: 'Instagram',
  //     icon: <Instagram className="h-4 w-4 text-[#E4405F]" />,
  //     message: `Transform your health and wealth with Value Life! Click the link in my bio or use code ${referralCode}`,
  //     selected: false
  //   },
  //   { 
  //     id: 4, 
  //     platform: 'WhatsApp',
  //     icon: <Share2 className="h-4 w-4 text-[#25D366]" />,
  //     message: `Hey! I've discovered Value Life's amazing products and business opportunity. Join using my referral link: ${referralLink}`,
  //     selected: false
  //   }
  // ]);
  const getMessageTemplate = (platform: string, code: string) => {
    if (!code) return '';
    const link = `${baseUrl}${code.toLowerCase()}`;
    switch (platform) {
      case 'Facebook':
        return `I've joined Value Life and I'm loving the products and opportunity! Join me using my referral link: ${link}`;
      case 'Twitter':
        return `Check out these amazing health products from Value Life! Use my referral link to join: ${link}`;
      case 'Instagram':
        return `Transform your health and wealth with Value Life! Click the link in my bio or use code ${code}`;
      case 'WhatsApp':
        return `Hey! I've discovered Value Life's amazing products and business opportunity. Join using my referral link: ${link}`;
      default:
        return '';
    }
  };

  // Update social templates when referral code changes
  useEffect(() => {
    if (referralCode) {
      const newLink = `${baseUrl}${referralCode.toLowerCase()}`;
      setReferralLink(newLink);
      setSocialTemplates(prev => prev.map(template => ({
        ...template,
        message: template.message.replace(/https:\/\/valuelife\.in\/register\?ref=[a-zA-Z0-9]+/, newLink)
      })));
    }
  }, [referralCode]);
  
  // Check KYC status
  if (currentUser && currentUser.kycStatus !== 'approved') {
    return (
      <MainLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Referral Tools</h1>
          <p className="text-neutral-600">Share your referral link and access marketing materials</p>
        </div>
        
        <KycRequired featureName="Referral Tools" />
      </MainLayout>
    );
  }
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleCustomizeSave = () => {
    if (customSuffix.trim() === '') {
      setShowCustomizeError(true);
      return;
    }
    
    // Simple validation
    if (/^[a-zA-Z0-9]{3,10}$/.test(customSuffix)) {
      // Format: First 4 chars of name + custom suffix (or default numeric)
      const prefix = Users.name.substring(0, 4).toUpperCase();
      const newReferralCode = `${prefix}${customSuffix.toUpperCase()}`;
      setReferralCode(newReferralCode);
      setCustomizing(false);
      setShowCustomizeError(false);
      
      // In a real app, you would save this to the user profile
      console.log('Saving new referral code:', newReferralCode);
    } else {
      setShowCustomizeError(true);
    }
  };

  const handleSelectTemplate = (id: number) => {
    setSocialTemplates(socialTemplates.map(t => ({
      ...t,
      selected: t.id === id
    })));
  };

  const handleShareSocial = (platform: string) => {
    const template = socialTemplates.find(t => t.platform === platform);
    if (!template) return;
    
    let url = '';
    switch (platform) {
      case 'Facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(template.message)}`;
        break;
      case 'Twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(template.message)}`;
        break;
      case 'WhatsApp':
        url = `https://wa.me/?text=${encodeURIComponent(template.message)}`;
        break;
      default:
        // For Instagram, just copy the message to clipboard
        copyToClipboard(template.message, 'message');
        alert('Caption copied to clipboard! Open Instagram and paste this as your caption.');
        return;
    }
    
    window.open(url, '_blank');
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Referral Tools</h1>
        <p className="text-neutral-600">Share your referral link and access marketing materials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Link */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
          <div className="bg-neutral-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <p className="text-neutral-800 break-all">{referralLink}</p>
              <Button 
                variant="ghost"
                size="sm"
                leftIcon={copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                onClick={() => copyToClipboard(referralLink, 'link')}
              >
                {copied === 'link' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Referral Code</h3>
            {!customizing && (
              <Button 
                variant="ghost"
                size="sm"
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={() => setCustomizing(true)}
              >
                Customize
              </Button>
            )}
          </div>
          
          {customizing ? (
            <div className="mb-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="customSuffix" className="block text-sm font-medium text-neutral-700">
                      Customize your referral code
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="bg-neutral-200 px-3 py-2 rounded-l-md text-neutral-700 font-mono">
                        {Users.name.substring(0, 4).toUpperCase()}
                      </span>
                      <input
                        type="text"
                        id="customSuffix"
                        maxLength={10}
                        value={customSuffix}
                        onChange={(e) => {
                          setCustomSuffix(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                          if (showCustomizeError) setShowCustomizeError(false);
                        }}
                        className="flex-1 min-w-0 block w-full px-3 py-2 border border-neutral-300 rounded-r-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
                        placeholder="Custom suffix"
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      Letters and numbers only. 3-10 characters.
                    </p>
                    {showCustomizeError && (
                      <p className="mt-1 text-xs text-error-600">
                        Please enter a valid suffix (3-10 alphanumeric characters).
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline"
                      size="sm"
                      leftIcon={<X className="h-4 w-4" />}
                      onClick={() => {
                        setCustomizing(false);
                        setShowCustomizeError(false);
                        setCustomSuffix('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary"
                      size="sm"
                      leftIcon={<Check className="h-4 w-4" />}
                      onClick={handleCustomizeSave}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <p className="text-neutral-800 font-bold">{referralCode}</p>
                <Button 
                  variant="ghost"
                  size="sm"
                  leftIcon={copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  onClick={() => copyToClipboard(referralCode, 'code')}
                >
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-semibold mb-4">Social Media Sharing</h3>
          <div className="space-y-4 mb-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {socialTemplates.map(template => (
                  <div 
                    key={template.id}
                    className={`border rounded-md p-2 text-center cursor-pointer transition-colors ${
                      template.selected 
                        ? 'border-primary-500 bg-primary-50 text-primary-700' 
                        : 'border-neutral-300 hover:border-primary-300'
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className="flex justify-center mb-1">
                      {template.icon}
                    </div>
                    <div className="text-xs font-medium">
                      {template.platform}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    Message Template
                  </label>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-800 h-24"
                  value={socialTemplates.find(t => t.selected)?.message || ''}
                  onChange={(e) => {
                    const selectedId = socialTemplates.find(t => t.selected)?.id;
                    if (selectedId) {
                      setSocialTemplates(socialTemplates.map(t => 
                        t.id === selectedId ? {...t, message: e.target.value} : t
                      ));
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  size="sm"
                  leftIcon={<Copy className="h-4 w-4" />}
                  onClick={() => {
                    const selectedTemplate = socialTemplates.find(t => t.selected);
                    if (selectedTemplate) {
                      copyToClipboard(selectedTemplate.message, 'message');
                    }
                  }}
                >
                  {copied === 'message' ? 'Copied!' : 'Copy Message'}
                </Button>
                <Button 
                  variant="primary"
                  size="sm"
                  leftIcon={<Share2 className="h-4 w-4" />}
                  onClick={() => {
                    const selectedTemplate = socialTemplates.find(t => t.selected);
                    if (selectedTemplate) {
                      handleShareSocial(selectedTemplate.platform);
                    }
                  }}
                >
                  Share on {socialTemplates.find(t => t.selected)?.platform}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral Stats */}
        {/* <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Referral Statistics</h3>
          <div className="space-y-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                  <p className="text-sm text-neutral-600">Direct Referrals</p>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Share2 className="h-8 w-8 text-secondary-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-neutral-900">12</p>
                  <p className="text-sm text-neutral-600">Link Clicks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Link className="h-8 w-8 text-success-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-neutral-900">25%</p>
                  <p className="text-sm text-neutral-600">Conversion Rate</p>
                </div>
              </div>
            </div>
          </div>
        </Card> */}

        {/* Marketing Materials */}
        <Card className="lg:col-span-3">
          <h3 className="text-lg font-semibold mb-4">Marketing Materials</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {marketingMaterials.map((material) => (
                  <tr key={material.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900">{material.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                        {material.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {material.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Download className="h-4 w-4" />}
                        onClick={() => window.open(material.url, '_blank')}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Referrals; 