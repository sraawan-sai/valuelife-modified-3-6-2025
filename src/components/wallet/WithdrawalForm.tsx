import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Wallet as WalletIcon, AlertTriangle } from 'lucide-react';
import { formatCurrency, currencySymbol } from '../../utils/currencyFormatter';

interface WithdrawalFormProps {
  walletBalance: number;
  onSubmit: (amount: number) => void;
  minAmount?: number;
  maxAmount?: number;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  walletBalance,
  onSubmit,
  minAmount = 50,
  maxAmount,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    const max = maxAmount || walletBalance;
    
    if (isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount < minAmount) {
      setError(`Minimum withdrawal amount is ${formatCurrency(minAmount)}`);
      return;
    }
    
    if (numAmount > max) {
      setError(`Maximum withdrawal amount is ${formatCurrency(max)}`);
      return;
    }
    
    if (numAmount > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }
    
    onSubmit(numAmount);
    setAmount('');
  };
  
  return (
    <Card
      title="Withdraw Funds"
      subtitle="Transfer funds to your registered bank account"
      icon={<WalletIcon className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="amount" className="block text-sm font-medium text-neutral-700">
              Withdrawal Amount
            </label>
            <span className="text-sm text-neutral-500">
              Available Balance: {formatCurrency(walletBalance)}
            </span>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-500">{currencySymbol}</span>
            </div>
            <input
              id="amount"
              type="number"
              step="0.01"
              min={minAmount}
              max={walletBalance}
              value={amount}
              onChange={handleAmountChange}
              className={`
                pl-8 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
                placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500
                ${error ? 'border-error-500' : 'border-neutral-300'}
              `}
              placeholder="0.00"
            />
          </div>
          
          {error && (
            <p className="mt-1 text-sm text-error-600">{error}</p>
          )}
        </div>
        
        <div className="mb-6 p-3 bg-neutral-50 rounded-md border border-neutral-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-600">
                Withdrawals are processed within 2-3 business days. A minimum withdrawal amount of {formatCurrency(minAmount)} is required.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Transaction Fee: <span className="font-medium">{formatCurrency(0)}</span></p>
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={amount === '' || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance}
          >
            Request Withdrawal
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WithdrawalForm;