import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from './ui/Button';

interface PaymentSuccessProps {
  productName: string;
  transactionId: string;
  amount: number;
  date: string;
  onDismiss: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  productName,
  transactionId,
  amount,
  date,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Payment Successful!</h2>
          <p className="text-neutral-600 mb-6">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          
          <div className="bg-neutral-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-neutral-500">Product:</span>
              <span className="font-semibold text-neutral-900">{productName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neutral-500">Transaction ID:</span>
              <span className="font-semibold text-neutral-900 text-sm">{transactionId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neutral-500">Amount:</span>
              <span className="font-semibold text-neutral-900">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Date:</span>
              <span className="font-semibold text-neutral-900">{new Date(date).toLocaleString()}</span>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500 mb-6">
            A commission has been credited to your sponsor's account according to the affiliate program structure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" fullWidth onClick={onDismiss}>
              Continue Shopping
            </Button>
            <Link to="/wallet" className="w-full">
              <Button variant="secondary" fullWidth>
                View Wallet
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 