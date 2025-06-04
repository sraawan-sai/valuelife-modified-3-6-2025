import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ReferralLinkProps {
  referralCode: string;
}

const ReferralLink: React.FC<ReferralLinkProps> = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);
  
  const referralLink = `https://mlm-portal.com/join?ref=${referralCode}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my network',
          text: 'Join my MLM network using this referral link',
          url: referralLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };
  
  return (
    <Card
      title="Your Referral Link"
      subtitle="Share this link to grow your network"
      icon={<Share2 className="h-5 w-5" />}
    >
      <div className="mt-4">
        <div className="flex items-center">
          <div className="flex-grow p-3 bg-neutral-50 rounded-l-md border border-neutral-200 overflow-x-auto whitespace-nowrap text-sm">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className="p-3 bg-primary-50 text-primary-600 border border-l-0 border-primary-200 rounded-r-md hover:bg-primary-100 transition-colors"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm font-medium text-neutral-700 mb-1">Referral Code</p>
            <div className="flex items-center space-x-2">
              <span className="font-mono bg-neutral-100 px-3 py-1 rounded text-neutral-800 text-sm">
                {referralCode}
              </span>
            </div>
          </div>
          
          <div className="flex-grow flex justify-end">
            <Button
              onClick={handleShare}
              variant="primary"
              leftIcon={<Share2 className="h-4 w-4" />}
            >
              Share Link
            </Button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-neutral-500">
          <p>
            Earn rewards when people join using your referral link. Check the commission 
            structure for details on how much you can earn.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReferralLink;