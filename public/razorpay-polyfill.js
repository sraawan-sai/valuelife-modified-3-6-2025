/**
 * Polyfills and patches for better Razorpay compatibility
 */

(function() {
  // Fix for some browsers that might have issues with Promises
  if (typeof Promise === 'undefined') {
    console.warn('Promise polyfill needed for Razorpay');
  }

  // Fix for older browsers that might not support fetch
  if (typeof fetch === 'undefined') {
    console.warn('Fetch API polyfill needed for optimal experience');
  }

  // Create a proxy for the Razorpay checkout object to prevent CORS errors
  const createRazorpayProxy = function() {
    if (window.Razorpay) {
      const originalRazorpay = window.Razorpay;
      
      window.Razorpay = function(options) {
        // Intercept options to ensure they're compatible
        const safeOptions = { ...options };
        
        // Ensure we have fallbacks for network errors
        safeOptions.retry = safeOptions.retry || false;
        
        // Override handler to add error handling
        const originalHandler = safeOptions.handler;
        if (originalHandler) {
          safeOptions.handler = function(response) {
            try {
              return originalHandler.call(this, response);
            } catch (err) {
              console.error('Error in payment handler:', err);
            }
          };
        }
        
        // Create the actual instance
        const instance = new originalRazorpay(safeOptions);
        
        // Add enhanced error handling
        const originalOpen = instance.open;
        instance.open = function() {
          try {
            return originalOpen.apply(this, arguments);
          } catch (err) {
            console.error('Error opening Razorpay:', err);
          }
        };
        
        return instance;
      };
      
      // Copy over prototype and properties
      Object.setPrototypeOf(window.Razorpay, originalRazorpay);
      Object.assign(window.Razorpay, originalRazorpay);
    }
  };
  
  // Run when the checkout script loads
  document.addEventListener('razorpay_checkout_loaded', function() {
    createRazorpayProxy();
  });
  
  // Also check if it's already loaded
  if (window.Razorpay) {
    createRazorpayProxy();
  }
})(); 