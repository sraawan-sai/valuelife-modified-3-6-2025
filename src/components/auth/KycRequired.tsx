import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface KycRequiredProps {
  featureName: string;
}

const KycRequired: React.FC<KycRequiredProps> = ({ featureName }) => {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="bg-warning-100 p-3 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-warning-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          KYC Verification Required
        </h2>
        
        <p className="text-neutral-600 mb-6 max-w-md">
          To access the <strong>{featureName}</strong> feature, you need to complete KYC verification
          and get approved by our team. This helps ensure platform security and comply with regulations.
        </p>
        
        <Link to="/kyc">
          <Button 
            variant="primary"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Complete KYC Verification
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default KycRequired; 