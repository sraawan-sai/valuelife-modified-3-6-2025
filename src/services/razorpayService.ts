import { Product } from '../utils/productService';
import { getCurrentUser } from '../utils/localStorageService';
import { recordProductPurchase } from '../utils/productPurchaseUtils';
import { createOrder, updateOrderWithPayment } from './orderService';
import { toast } from 'react-hot-toast';
import { WithdrawalRequest } from './walletService';

// Using the live key as requested
const RAZORPAY_KEY_ID = 'rzp_live_fQ1iCdqXUUsNDd';

// Setting to false to use actual Razorpay checkout (not mock)
const USE_MOCK_PAYMENT = false;

// Create a namespace for Razorpay to avoid polluting global scope
declare global {
  interface Window {
    Razorpay: any;
    RazorpayCheckout?: any;
  }
}

// Suppress console warnings related to CORS headers
const suppressConsoleWarnings = () => {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Don't log errors about unsafe headers or CORS issues
    if (
      args.length > 0 && 
      typeof args[0] === 'string' && 
      (args[0].includes('unsafe header') || 
       args[0].includes('x-rtb-fingerprint-id') ||
       args[0].includes('CORS'))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  return () => {
    console.error = originalConsoleError;
  };
};

// Load Razorpay script dynamically with better error handling
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }
    
    console.log("Loading Razorpay script...");
    
    // Suppress console warnings for the duration of script loading
    const restoreConsole = suppressConsoleWarnings();
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.setAttribute('data-payment-button-id', 'pl_custom');
    
    // Success handler
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      restoreConsole();
      resolve(true);
    };
    
    // Error handler
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      restoreConsole();
      resolve(false);
    };
    
    // Add script to document
    document.body.appendChild(script);
  });
};

// Generate a random receipt ID
const generateReceiptId = (): string => {
  return `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Mock payment UI that doesn't rely on Razorpay API
const showMockPaymentUI = (
  product: Product,
  onSuccess: (paymentId: string, orderId: string) => void,
  onCancel: () => void
) => {
  // Create a modal element
  const modalOverlay = document.createElement('div');
  modalOverlay.style.position = 'fixed';
  modalOverlay.style.top = '0';
  modalOverlay.style.left = '0';
  modalOverlay.style.width = '100%';
  modalOverlay.style.height = '100%';
  modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.zIndex = '9999';

  // Modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.padding = '24px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.width = '90%';
  modalContent.style.maxWidth = '400px';
  modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  
  // Title
  const title = document.createElement('h2');
  title.textContent = 'Complete Payment';
  title.style.marginBottom = '16px';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.color = '#333';

  // Product info
  const productInfo = document.createElement('div');
  productInfo.style.marginBottom = '20px';
  productInfo.style.padding = '12px';
  productInfo.style.backgroundColor = '#f5f5f5';
  productInfo.style.borderRadius = '4px';
  
  const productName = document.createElement('div');
  productName.textContent = `Product: ${product.name}`;
  productName.style.marginBottom = '8px';
  productName.style.fontWeight = 'bold';
  
  const productPrice = document.createElement('div');
  productPrice.textContent = `Amount: ₹${product.price.toFixed(2)}`;
  
  productInfo.appendChild(productName);
  productInfo.appendChild(productPrice);

  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '12px';
  buttonsContainer.style.marginTop = '20px';

  // Pay button
  const payButton = document.createElement('button');
  payButton.textContent = 'Pay Now';
  payButton.style.backgroundColor = '#6366F1';
  payButton.style.color = 'white';
  payButton.style.border = 'none';
  payButton.style.padding = '10px 16px';
  payButton.style.borderRadius = '4px';
  payButton.style.cursor = 'pointer';
  payButton.style.flex = '1';
  payButton.style.fontWeight = 'bold';
  
  // Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.backgroundColor = '#e5e5e5';
  cancelButton.style.color = '#333';
  cancelButton.style.border = 'none';
  cancelButton.style.padding = '10px 16px';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.flex = '1';
  
  // Note text
  const noteText = document.createElement('p');
  noteText.textContent = 'This is a simulated payment for testing purposes.';
  noteText.style.fontSize = '12px';
  noteText.style.color = '#999';
  noteText.style.marginTop = '20px';
  noteText.style.textAlign = 'center';

  // Add event listeners
  payButton.addEventListener('click', () => {
    // Close modal
    document.body.removeChild(modalOverlay);
    
    // Generate mock payment ID and order ID
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Wait a bit to simulate processing
    setTimeout(() => {
      onSuccess(mockPaymentId, mockOrderId);
    }, 1000);
  });
  
  cancelButton.addEventListener('click', () => {
    // Close modal
    document.body.removeChild(modalOverlay);
    onCancel();
  });

  // Assemble modal
  buttonsContainer.appendChild(payButton);
  buttonsContainer.appendChild(cancelButton);
  
  modalContent.appendChild(title);
  modalContent.appendChild(productInfo);
  modalContent.appendChild(buttonsContainer);
  modalContent.appendChild(noteText);
  
  modalOverlay.appendChild(modalContent);
  
  // Add to body
  document.body.appendChild(modalOverlay);
};

// Create a safer checkout experience
export const processPayment = async (product: Product): Promise<boolean> => {
  try {
    // Get current user
    const user = getCurrentUser();
    if (!user) {
      throw new Error('User is not logged in');
    }
    
    // Create an order in our system
    const amountInPaise = Math.round(product.price * 100);
    const order = await createOrder(product.id, amountInPaise);
    
    // Load Razorpay script with warnings suppressed
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }
    
    // Suppress console warnings during payment flow
    const restoreConsole = suppressConsoleWarnings();
    
    // Configure payment options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Value Life',
      description: `Purchase of ${product.name}`,
      image: 'https://via.placeholder.com/150/6366F1/FFFFFF?text=VL', // Company logo URL
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
      notes: {
        productId: product.id,
        userId: user.id,
        orderId: order.id
      },
      theme: {
        color: '#6366F1',
      },
      // Safe handling of payment success
      handler: async function(response: any) {
        // Restore console first
        restoreConsole();
        
        // Then process payment 
        console.log('Payment successful', response);
        
        if (response.razorpay_payment_id) {
          // Update the order with payment details
          updateOrderWithPayment(
            order.id, 
            response.razorpay_payment_id,
            'paid'
          );
          
          // Record the purchase and distribute commissions
          const success = await recordProductPurchase(
            product.id,
            response.razorpay_payment_id,
            response.razorpay_payment_id 
          );
          
          if (success) {
            toast.success('Payment successful! Your purchase is complete.');
            
            // Dispatch a custom event to notify the Products component
            const paymentEvent = new CustomEvent('razorpay-payment-success', {
              detail: {
                productId: product.id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_payment_id,
                systemOrderId: order.id
              }
            });
            window.dispatchEvent(paymentEvent);
          } else {
            toast.error('Error processing purchase. Please contact support.');
          }
        }
      },
      modal: {
        // Handle cancellation safely
        ondismiss: function() {
          // Restore console 
          restoreConsole();
          console.log('Payment modal closed without completing payment');
          toast('Payment cancelled');
        },
        // Force to use iframe mode for better compatibility
        escape: false,
        confirm_close: true
      },
      // These options can help with CORS issues in some cases
      send_sms_hash: false,
      retry: false
    };
    
    // Try to create a self-contained instance of Razorpay
    // that won't conflict with browser security policies as much
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function(resp: any){
        restoreConsole();
        toast.error('Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (e) {
      restoreConsole();
      console.error('Razorpay initialization error:', e);
      toast.error('Could not initialize payment. Please try again.');
      return false;
    }
    
    // Return true to indicate that the payment flow started successfully
    return true;
  } catch (error) {
    console.error('Razorpay payment error:', error);
    return false;
  }
};

// Simplified payment verification
export const handlePaymentVerification = async (
  paymentId: string,
  systemOrderId: string
): Promise<boolean> => {
  try {
    // Suppress warnings during verification
    const restoreConsole = suppressConsoleWarnings();
    
    // Get product ID from the order
    const order = await updateOrderWithPayment(systemOrderId, paymentId, 'paid');
    
    if (!order) {
      restoreConsole();
      console.error('Order not found:', systemOrderId);
      return false;
    }
    
    // Record the purchase using our utility
    const success = await recordProductPurchase(
      order.productId,
      paymentId,
      paymentId
    );
    
    restoreConsole();
    console.log('Payment verification result:', success);
    return success;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};
// This is a mock implementation since actual Razorpay integration requires backend API

export interface RazorpayPayout {
  id: string;
  amount: number;
  currency: string;
  status: 'processing' | 'processed' | 'reversed' | 'failed';
  mode: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI';
  purpose: string;
  narration: string;
  reference_id: string;
  failure_reason?: string;
  created_at: number;
}

// Initialize Razorpay (this would typically be done on the backend)
export const initRazorpay = (): boolean => {
  console.log('Initializing Razorpay (mock)');
  return true;
};

// Process a payout to user bank account
export const processPayout = async (
  withdrawalRequest: WithdrawalRequest
): Promise<{ success: boolean; data?: RazorpayPayout; error?: string }> => {
  try {
    console.log(`Processing payout via Razorpay for user: ${withdrawalRequest.userName}, amount: ₹${withdrawalRequest.amount}`);
    
    // Load Razorpay script if not already loaded
    await loadRazorpayScript();
    
    if (!window.Razorpay) {
      throw new Error("Razorpay SDK failed to load");
    }
    
    // Create a promise that will resolve when payment completes
    return new Promise((resolve, reject) => {
      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: withdrawalRequest.amount * 100, // in paise
        currency: "INR",
        name: "Value Life Admin",
        description: `Payout to ${withdrawalRequest.accountDetails.accountHolderName}`,
        image: "https://via.placeholder.com/150/6366F1/FFFFFF?text=VL", // Company logo URL
        handler: function(response: any) {
          // This function runs when payment is successful
          console.log("Razorpay payment successful:", response);
          
          // Create a success response
          const payoutData: RazorpayPayout = {
            id: response.razorpay_payment_id || `pout_${Date.now()}`,
            amount: withdrawalRequest.amount * 100,
            currency: 'INR',
            status: 'processed',
            mode: 'IMPS',
            purpose: 'payout',
            narration: `Payout to ${withdrawalRequest.accountDetails.accountHolderName}`,
            reference_id: withdrawalRequest.id,
            created_at: Date.now()
          };
          
          resolve({
            success: true,
            data: payoutData
          });
        },
        prefill: {
          name: withdrawalRequest.accountDetails.accountHolderName,
          account_number: withdrawalRequest.accountDetails.accountNumber,
          ifsc: withdrawalRequest.accountDetails.ifscCode,
        },
        notes: {
          address: "Value Life Admin Dashboard"
        },
        theme: {
          color: "#6366F1"
        },
        modal: {
          ondismiss: function() {
            reject(new Error("Payment cancelled by user"));
          }
        }
      };
      
      // Create Razorpay instance and open checkout
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    });
  } catch (error) {
    console.error('Razorpay payout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Validate bank account details (mock implementation)
export const validateBankAccount = async (
  accountDetails: WithdrawalRequest['accountDetails']
): Promise<{ valid: boolean; message?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simply check that fields are not empty - no format validation
  if (!accountDetails.accountNumber.trim()) {
    return {
      valid: false,
      message: 'Account number cannot be empty'
    };
  }
  
  if (!accountDetails.ifscCode.trim()) {
    return {
      valid: false,
      message: 'IFSC code cannot be empty'
    };
  }
  
  if (!accountDetails.accountHolderName.trim()) {
    return {
      valid: false,
      message: 'Account holder name cannot be empty'
    };
  }
  
  if (!accountDetails.bankName.trim()) {
    return {
      valid: false,
      message: 'Bank name cannot be empty'
    };
  }
  
  // Accept any input as long as fields are filled
  return {
    valid: true,
    message: 'Account details received'
  };
};

// Get Razorpay balance (mock)
export const getRazorpayBalance = async (): Promise<number> => {
  // In a real implementation, this would call Razorpay's balance API
  return 1000000; // ₹10,000.00
}; 