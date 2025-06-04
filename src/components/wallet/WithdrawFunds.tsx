import React, { useState } from 'react';
import { DollarSign, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { createWithdrawalRequest } from '../../services/walletService';
import { getCurrentUser } from '../../utils/localStorageService';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/currencyFormatter';

interface WithdrawFundsProps {
  totalEarnings: number;
  onSuccess: () => void;
}

const WithdrawFunds: React.FC<WithdrawFundsProps> = ({ totalEarnings, onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountName: '',
    bankName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = getCurrentUser();
      if (!user?.id || !user?.name) {
        throw new Error('User not found');
      }

      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (withdrawalAmount > totalEarnings) {
        throw new Error('Amount exceeds total earnings');
      }

      // Validate bank details
      if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountName || !bankDetails.bankName) {
        throw new Error('Please fill in all bank details');
      }

      const success = await createWithdrawalRequest(user.id, withdrawalAmount, bankDetails, user.name);
      
      if (success) {
        toast.success('Withdrawal request submitted successfully');
        setAmount('');
        setBankDetails({
          accountNumber: '',
          ifscCode: '',
          accountName: '',
          bankName: ''
        });
        onSuccess();
      } else {
        throw new Error('Failed to submit withdrawal request');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Withdraw Funds</h2>
          <div className="text-sm text-neutral-600">
            Available Balance: {formatCurrency(totalEarnings)}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-error-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-error-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">
                Withdrawal Amount
              </label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min={0.01}
                step="0.01"
                required
                leftIcon={<DollarSign className="h-5 w-5 text-neutral-400" />}
              />
              <p className="mt-1 text-sm text-neutral-500">Your withdrawal request will be reviewed by admin</p>
            </div>

            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-neutral-700 mb-1">
                Account Holder Name
              </label>
              <Input
                id="accountName"
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                placeholder="Enter account holder name"
                required
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                Account Number
              </label>
              <Input
                id="accountNumber"
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter account number"
                required
              />
            </div>

            <div>
              <label htmlFor="ifscCode" className="block text-sm font-medium text-neutral-700 mb-1">
                IFSC Code
              </label>
              <Input
                id="ifscCode"
                type="text"
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                placeholder="Enter IFSC code"
                required
              />
            </div>

            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-neutral-700 mb-1">
                Bank Name
              </label>
              <Input
                id="bankName"
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="Enter bank name"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting}
              leftIcon={isSubmitting ? undefined : <CreditCard className="h-5 w-5" />}
            >
              {isSubmitting ? 'Processing...' : 'Submit Withdrawal Request'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default WithdrawFunds;
