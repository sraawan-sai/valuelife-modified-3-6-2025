/**
 * Helper script to handle Razorpay integration and suppress CORS warnings
 * This script runs before the main application
 */

(function() {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console.error to filter out Razorpay-related CORS warnings
  console.error = function() {
    if (arguments.length > 0 && 
        typeof arguments[0] === 'string' && 
        (arguments[0].includes('unsafe header') || 
         arguments[0].includes('x-rtb-fingerprint-id') ||
         arguments[0].includes('Refused to get') ||
         arguments[0].includes('CORS'))) {
      // Suppress these specific errors
      return;
    }
    
    // Log withdrawal-related errors more clearly
    if (arguments.length > 0 && 
        typeof arguments[0] === 'string' && 
        arguments[0] === 'Insufficient balance') {
      // We'll let this error through but also set a flag that the UI can check
      window.RazorpayErrors = window.RazorpayErrors || {};
      window.RazorpayErrors.insufficientBalance = true;
    }
    
    // Pass other errors to the original method
    return originalConsoleError.apply(console, arguments);
  };
  
  // Override console.warn to filter out non-critical warnings
  console.warn = function() {
    if (arguments.length > 0 && 
        typeof arguments[0] === 'string' && 
        (arguments[0].includes('React Router Future Flag Warning') ||
         arguments[0].includes('cookies') ||
         arguments[0].includes('Canvas2D'))) {
      // Suppress these warnings
      return;
    }
    
    // Pass other warnings to the original method
    return originalConsoleWarn.apply(console, arguments);
  };
  
  // Create a global object to store Razorpay-related utilities
  window.RazorpayUtils = {
    // Restore console methods to their original state
    restoreConsole: function() {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    },
    
    // Helper function to safely load the Razorpay script
    loadScript: function() {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(window.Razorpay);
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.body.appendChild(script);
      });
    },
    
    // Check if there's an insufficient balance error
    hasInsufficientBalanceError: function() {
      return window.RazorpayErrors && window.RazorpayErrors.insufficientBalance;
    },
    
    // Clear errors
    clearErrors: function() {
      window.RazorpayErrors = {};
    }
  };
})(); 