import React from 'react';
import { Transaction } from '../../types';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { ArrowUpRight, ArrowDownLeft, Award, CreditCard, RefreshCcw, DollarSign, BarChart3, Percent, Gift, Repeat } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';

interface TransactionListProps {
  transactions: Transaction[];
  showTitle?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  showTitle = true 
}) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'retail_profit':
        return <DollarSign className="h-4 w-4" />;
      case 'referral_bonus':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'team_matching':
        return <BarChart3 className="h-4 w-4" />;
      case 'royalty_bonus':
        return <Percent className="h-4 w-4" />;
      case 'repurchase_bonus':
        return <Repeat className="h-4 w-4" />;
      case 'award_reward':
        return <Gift className="h-4 w-4" />;
      case 'withdrawal':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'withdrawal_reversal':
        return <RefreshCcw className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTransactionBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'retail_profit':
        return <Badge variant="purple" size="sm">Retail Profit</Badge>;
      case 'referral_bonus':
        return <Badge variant="success" size="sm">Referral Bonus</Badge>;
      case 'team_matching':
        return <Badge variant="primary" size="sm">Team Matching</Badge>;
      case 'royalty_bonus':
        return <Badge variant="secondary" size="sm">Royalty Bonus</Badge>;
      case 'repurchase_bonus':
        return <Badge variant="accent" size="sm">Repurchase Bonus</Badge>;
      case 'award_reward':
        return <Badge variant="indigo" size="sm">Award/Reward</Badge>;
      case 'withdrawal':
        return <Badge variant="warning" size="sm">Withdrawal</Badge>;
      case 'withdrawal_reversal':
        return <Badge variant="neutral" size="sm">Reversal</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Transaction</Badge>;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error" size="sm">Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getIconBackgroundColor = (type: Transaction['type']) => {
    switch (type) {
      case 'retail_profit':
        return 'bg-purple-100 text-purple-700';
      case 'referral_bonus':
        return 'bg-primary-100 text-primary-700';
      case 'team_matching':
        return 'bg-accent-100 text-accent-700';
      case 'royalty_bonus':
        return 'bg-secondary-100 text-secondary-700';
      case 'repurchase_bonus':
        return 'bg-green-100 text-green-700';
      case 'award_reward':
        return 'bg-indigo-100 text-indigo-700';
      case 'withdrawal':
        return 'bg-warning-100 text-warning-700';
      case 'withdrawal_reversal':
        return 'bg-neutral-100 text-neutral-700';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };

  return (
    <Card title={showTitle ? "Recent Transactions" : undefined}>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-neutral-500">No transactions found</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-150"
            >
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4
                ${getIconBackgroundColor(transaction.type)}
              `}>
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-neutral-900 truncate">
                    {transaction.description}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-neutral-500 mr-2">
                    {formatDate(transaction.date)}
                  </span>
                  {getTransactionBadge(transaction.type)}
                </div>
              </div>
              
              <div className="flex flex-col items-end ml-4">
                <span className={`text-sm font-semibold ${
                  transaction.type === 'withdrawal' ? 'text-error-600' : 'text-success-600'
                }`}>
                  {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount, true)}
                </span>
                <div className="mt-1">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TransactionList;