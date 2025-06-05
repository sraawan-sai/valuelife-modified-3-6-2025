import axios from 'axios';
import { 
  Transaction, 
  User, 
  NetworkMember,
  CommissionStructure
} from '../types';
import { 
  getCurrentUser, 
  getAllUsers, 
  getUserNetworkMembers,
  getCommissionStructure,
  addTransaction, 
  getUserWallet, 
  updateWallet,
  getFromStorage, 
  setToStorage,
  addReferralBonusTransaction,
  addTeamMatchingBonus,
  addRoyaltyBonus,
  addRepurchaseBonus
} from './localStorageService';
import { Product } from './productService';
import { v4 as uuidv4 } from 'uuid';

const serverUrl = import.meta.env.VITE_SERVER_URL;

// Define an extended transaction interface for purchases
interface PurchaseTransaction extends Transaction {
  paymentId?: string;
}

// Records a product purchase and distributes commissions
export const recordProductPurchase = async (
  productId: string, 
  paymentId: string,
  orderId?: string // Made optional since we're using paymentId
): Promise<boolean> => {
  try {
    // Get current user and commission structure
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return false;
    }
    
    // Find sponsor (if any)
    const allUsers = await getAllUsers();
    let sponsor: User | undefined;
    
    if (currentUser.sponsorId) {
      sponsor = allUsers.find(user => 
        user.id === currentUser.sponsorId || 
        user.referralCode.toUpperCase() === currentUser.sponsorId?.toUpperCase()
      );
    }
    
    // Get product details
      const response = await axios.get(`${serverUrl}/api/db/products`);
const products: Product[] = response.data;
    //const products:Product[] =  await axios.get(`${serverUrl}/api/db/products`)//JSON.parse(localStorage.getItem('value_life_products') || '[]');
    const product = products.find((p: Product) => p.id === productId);
  
    
    if (!product) {
      console.error('Product not found');
      return false;
    }
    
    // Get commission structure
    const commissionStructure = getCommissionStructure();
    
    // Record the purchase
    await recordPurchase(currentUser.id, product, paymentId);
    
    // Distribute commissions if sponsor exists
    if (sponsor) {
      await distributeCommissions(sponsor, product, commissionStructure);
    }
    
    return true;
  } catch (error) {
    console.error('Error processing product purchase:', error);
    return false;
  }
};

// Record the purchase transaction
const recordPurchase = async (
  userId: string, 
  product: Product, 
  paymentId: string
): Promise<void> => {
  const purchaseTransaction: PurchaseTransaction = {
    id: uuidv4(),
    userId,
    amount: product.price,
    type: 'retail_profit',
    description: `Purchase of ${product.name}`,
    date: new Date().toISOString(),
    status: 'completed',
    // Payment details stored as additional properties
    paymentId
  };
  
  // Add purchase transaction (casting to Transaction as addTransaction expects this type)
 await addTransaction(purchaseTransaction as Transaction);
  
  console.log(`Recorded purchase for user ${userId}: ${product.name}`);
};

// Utility: Traverse the binary tree and count left/right subtree members for a user
function countSubtreeMembers(tree: NetworkMember | undefined): number {
  if (!tree) return 0;
  let count = 1; // count self
  if (tree.children && tree.children.length > 0) {
    for (const child of tree.children) {
      count += countSubtreeMembers(child);
    }
  }
  return count;
}

// Distribute commissions to sponsors and upline
const distributeCommissions = async (
  sponsor: User,
  product: Product,
  commissionStructure: CommissionStructure
): Promise<void> => {
  try {
    // Calculate direct retail profit commission
    const commissionRate = product.commissionRate / 100;
    const commissionAmount = product.price * commissionRate;
    
    // Apply TDS, admin fee, and repurchase allocation
    const tdsAmount = commissionAmount * commissionStructure.tdsPercentage;
    const adminFeeAmount = commissionAmount * commissionStructure.adminFeePercentage;
    const repurchaseAmount = commissionAmount * commissionStructure.repurchasePercentage;
    
    // Calculate net commission after deductions
    const netCommissionAmount = commissionAmount - tdsAmount - adminFeeAmount - repurchaseAmount;
    
    // Create retail profit commission transaction
    const retailProfitTransaction: Transaction = {
      id: uuidv4(),
      userId: sponsor.id,
      amount: netCommissionAmount,
      type: 'retail_profit',
      description: `Retail profit commission for ${product.name} purchase (${product.commissionRate}%)`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    // Add the commission transaction
    await addTransaction(retailProfitTransaction);
    
    // Create TDS deduction transaction (for record-keeping)
    const tdsTransaction: Transaction = {
      id: uuidv4(),
      userId: sponsor.id,
      amount: -tdsAmount,
      type: 'retail_profit',
      description: `TDS deduction for ${product.name} commission`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    await addTransaction(tdsTransaction);
    
    // Create admin fee transaction (for record-keeping)
    const adminFeeTransaction: Transaction = {
      id: uuidv4(),
      userId: sponsor.id,
      amount: -adminFeeAmount,
      type: 'retail_profit',
      description: `Admin fee for ${product.name} commission`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    await addTransaction(adminFeeTransaction);
    
    // Create repurchase allocation transaction (for record-keeping)
    const repurchaseTransaction: Transaction = {
      id: uuidv4(),
      userId: sponsor.id,
      amount: -repurchaseAmount,
      type: 'repurchase_bonus',
      description: `Repurchase allocation from ${product.name} commission`,
      date: new Date().toISOString(),
      status: 'completed'
    };
    await addTransaction(repurchaseTransaction);
    
    console.log(`Distributed retail profit commission to ${sponsor.name}: ${netCommissionAmount}`);
    
    // Process level commissions for upline members if level commission rates are defined
    if (commissionStructure.levelCommissions && Object.keys(commissionStructure.levelCommissions).length > 0) {
      await processLevelCommissions(sponsor, product, commissionStructure);
    }
    
    // Check if this is a repurchase and distribute repurchase bonus
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Check if user has previous purchases of this product
      const userPurchases = getFromStorage<any[]>(`purchases_${currentUser.id}`) || [];
      const hasPreviousPurchase = userPurchases.some((p) => p.productId === product.id);
      
      if (hasPreviousPurchase) {
        console.log(`This is a repurchase of ${product.name} by ${currentUser.name}`);
        
        // Add repurchase bonus to sponsor
        await addRepurchaseBonus(sponsor.id, product.price, product.name);
      }
    }
    
    // Check if any pair should be credited and add team matching bonus
    if (sponsor && sponsor.id) {
      // Get the sponsor's network tree
      const sponsorNetwork: NetworkMember = await getUserNetworkMembers(sponsor.id);
      // In a binary tree, left = children[0], right = children[1]
      const leftSubtree = sponsorNetwork.children && sponsorNetwork.children[0];
      const rightSubtree = sponsorNetwork.children && sponsorNetwork.children[1];
      // Subtract 1 to not count the root of each subtree as a pair
      const leftCount = leftSubtree ? countSubtreeMembers(leftSubtree) : 0;
      const rightCount = rightSubtree ? countSubtreeMembers(rightSubtree) : 0;
      // Number of pairs is the minimum of left and right subtree counts
      const pairsToCredit = Math.min(leftCount, rightCount);
      if (pairsToCredit > 0) {
        console.log(`Adding ${pairsToCredit} team matching pairs for ${sponsor.name} (tree-based)`);
        await addTeamMatchingBonus(sponsor.id, pairsToCredit);
      }
      
      // For top performers, add a royalty bonus (simplified approach)
      // In a real system, you would have more complex criteria
      if (leftCount > 10 && rightCount > 10) {
        // Assume company turnover is total product price from all users for this month
        const allTransactions = getFromStorage<Transaction[]>('mlm_transactions') || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Calculate company turnover for current month
        const currentMonthTransactions = allTransactions.filter((t: Transaction) => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear && 
                 (t.type === 'retail_profit' || t.type === 'repurchase_bonus');
        });
        
        // Sum up transaction amounts
        const turnover = currentMonthTransactions.reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);
        
        if (turnover > 0) {
          console.log(`Adding royalty bonus for ${sponsor.name} based on turnover: ${turnover}`);
          
          // Add royalty bonus
         await addRoyaltyBonus(sponsor.id, turnover);
        }
      }
    }
  } catch (error) {
    console.error('Error distributing commissions:', error);
  }
};

// Process level commissions for upline members
const processLevelCommissions = async(
  sponsor: User,
  product: Product,
  commissionStructure: CommissionStructure
): Promise<void> => {
  try {
    // Get all users to traverse upline
    const allUsers = await getAllUsers();
    
    let currentUserId = sponsor.id;
    let currentLevel = 1;
    const maxLevel = Math.max(...Object.keys(commissionStructure.levelCommissions).map(Number));
    
    // Traverse upline up to max level defined in commission structure
    while (currentLevel <= maxLevel) {
      // Find current user's sponsor
      const currentUser = allUsers.find(user => user.id === currentUserId);
      if (!currentUser || !currentUser.sponsorId) {
        break; // No sponsor, end of upline
      }
      
      // Find sponsor user
      const uplineSponsor = allUsers.find(user => 
        user.id === currentUser.sponsorId || 
        user.referralCode.toUpperCase() === currentUser.sponsorId?.toUpperCase()
      );
      
      if (!uplineSponsor) {
        break; // Sponsor not found
      }
      
      // Check if level commission exists for this level
      const levelRate = commissionStructure.levelCommissions[currentLevel];
      if (levelRate) {
        // Calculate commission amount
        const levelCommissionAmount = product.price * levelRate;
        
        // Apply TDS, admin fee, and repurchase allocation
        const tdsAmount = levelCommissionAmount * commissionStructure.tdsPercentage;
        const adminFeeAmount = levelCommissionAmount * commissionStructure.adminFeePercentage;
        const repurchaseAmount = levelCommissionAmount * commissionStructure.repurchasePercentage;
        
        // Calculate net commission after deductions
        const netLevelCommissionAmount = levelCommissionAmount - tdsAmount - adminFeeAmount - repurchaseAmount;
        
        // Create level commission transaction
        const levelCommissionTransaction: Transaction = {
          id: uuidv4(),
          userId: uplineSponsor.id,
          amount: netLevelCommissionAmount,
          type: 'retail_profit',
          description: `Level ${currentLevel} commission for product purchase (${levelRate * 100}%)`,
          date: new Date().toISOString(),
          status: 'completed',
          level: currentLevel
        };
        
        // Add the level commission transaction
        await addTransaction(levelCommissionTransaction);
        
        console.log(`Distributed level ${currentLevel} commission to ${uplineSponsor.name}: ${netLevelCommissionAmount}`);
      }
      
      // Move up to next level
      currentUserId = uplineSponsor.id;
      currentLevel++;
    }
  } catch (error) {
    console.error('Error processing level commissions:', error);
  }
}; 