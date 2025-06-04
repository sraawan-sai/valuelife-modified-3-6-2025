import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { Product, getActiveProducts, getProductById } from '../utils/productService';
import { formatCurrency } from '../utils/currencyFormatter';
import { processPayment } from '../services/razorpayService';
import { getCurrentUser, markUserAsActiveAndCheckBonuses } from '../utils/localStorageService';
import { toast } from 'react-hot-toast';
import PaymentSuccess from '../components/PaymentSuccess';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    show: boolean;
    productName: string;
    transactionId: string;
    amount: number;
    date: string;
  }>({
    show: false,
    productName: '',
    transactionId: '',
    amount: 0,
    date: ''
  });

  useEffect(() => {
    // Fetch products from local storage using our service
    const fetchProducts = () => {
      setLoading(true);
      
      // Simulating API call with a slight delay
      setTimeout(() => {
        const activeProducts = getActiveProducts();
        setProducts(activeProducts);
        setLoading(false);
      }, 500);
    };

    fetchProducts();
    
    // Setup window event listener for payment success from Razorpay
    const handleRazorpayEvent = (event: any) => {
      if (event.detail && event.detail.productId) {
        handlePaymentSuccess(
          event.detail.paymentId,
          event.detail.productId
        );
      }
    };
    
    window.addEventListener('razorpay-payment-success', handleRazorpayEvent);
    
    return () => {
      window.removeEventListener('razorpay-payment-success', handleRazorpayEvent);
    };
  }, []);

  const handlePurchase = async (product: Product) => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('Please login to purchase products');
      return;
    }

    try {
      setProcessingPayment(true);
      setSelectedProductId(product.id);
      
      // Initialize Razorpay payment
      const paymentStarted = await processPayment(product);
      
      if (!paymentStarted) {
        toast.error('Failed to initialize payment. Please try again.');
        setProcessingPayment(false);
        setSelectedProductId(null);
      }
      
      // We don't reset processing state here because it will be handled by the
      // payment success/cancel callbacks in the Razorpay handler
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setProcessingPayment(false);
      setSelectedProductId(null);
    }
  };

  // Handle payment callback from Razorpay
  const handlePaymentSuccess = (
    paymentId: string,
    productId: string
  ) => {
    // Reset processing state
    setProcessingPayment(false);
    setSelectedProductId(null);
    
    if (paymentId && productId) {
      // Mark user as active and check for matching bonuses
      const currentUser = getCurrentUser();
      if (currentUser) {
        markUserAsActiveAndCheckBonuses(currentUser.id);
      }
      // Get the product details
      const product = getProductById(productId);
      if (product) {
        // Show payment success modal
        setPaymentSuccess({
          show: true,
          productName: product.name,
          transactionId: paymentId,
          amount: product.price,
          date: new Date().toISOString()
        });
      } else {
        toast.success('Payment successful! Your purchase is complete.');
      }
    }
  };
  
  const dismissPaymentSuccess = () => {
    setPaymentSuccess(prev => ({ ...prev, show: false }));
  };

  return (
    <MainLayout>
      {/* Animated Rainbow Blobs and Gradient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-pink-400 via-yellow-300 via-green-300 via-blue-300 to-purple-400 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-300 via-pink-300 via-blue-300 to-green-300 rounded-full filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 via-pink-300 to-yellow-300 rounded-full filter blur-2xl opacity-20 animate-blob-slow animate-spin"></div>
        <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-gradient-to-tr from-green-300 via-yellow-300 to-pink-300 rounded-full filter blur-2xl opacity-20 animate-blob-fast animate-spin-reverse"></div>
        <div className="absolute left-1/3 top-0 w-80 h-80 bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 rounded-full filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute right-1/4 bottom-10 w-56 h-56 bg-gradient-to-tr from-blue-200 via-green-200 to-pink-300 rounded-full filter blur-2xl opacity-30 animate-blob-fast animation-delay-3000"></div>
        <div className="absolute left-1/2 top-1/3 w-24 h-24 bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 rounded-full filter blur-lg opacity-40 animate-blob animation-delay-1000"></div>
        <div className="absolute right-1/3 bottom-1/4 w-16 h-16 bg-gradient-to-tr from-green-200 via-blue-200 to-purple-200 rounded-full filter blur-lg opacity-30 animate-blob animation-delay-2500"></div>
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))'}}></div>
      </div>
      <div className="mb-6 relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">Our Products</h1>
        <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x animate-pulse-rainbow">Explore our range of health and wellness products</p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64 relative z-10">
          <div className="text-neutral-600">Loading products...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {products.map((product) => (
            <Card key={product.id} className="h-full flex flex-col bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow animate-card-pop">
              <div className="flex-1">
                <div className="flex items-center justify-center h-48 bg-neutral-100 rounded-t-lg mb-4">
                  <Package className="h-24 w-24 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{product.name}</h3>
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  {formatCurrency(product.price)}
                </div>
                <p className="text-neutral-600 mb-4">
                  {product.description}
                </p>
                <div className="text-sm text-neutral-500 mb-2">
                  <span className="font-semibold">Affiliate Commission:</span> {product.commissionRate}%
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                leftIcon={processingPayment && selectedProductId === product.id ? 
                  <div className="animate-spin mr-2">⭘</div> : 
                  <ShoppingCart className="h-4 w-4" />
                }
                onClick={() => handlePurchase(product)}
                disabled={processingPayment}
                className="mt-4"
              >
                {processingPayment && selectedProductId === product.id ? 
                  'Processing...' : 'Purchase Now'}
              </Button>
            </Card>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-neutral-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
              <p>No products available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      )}
      {/* Payment Success Modal */}
      {paymentSuccess.show && (
        <PaymentSuccess
          productName={paymentSuccess.productName}
          transactionId={paymentSuccess.transactionId}
          amount={paymentSuccess.amount}
          date={paymentSuccess.date}
          onDismiss={dismissPaymentSuccess}
        />
      )}
      {/* Custom Animations and Effects */}
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating-card {
          animation: floating 4s ease-in-out infinite;
        }
        @keyframes rainbowGlow {
          0% { box-shadow: 0 0 16px 2px #ff00cc44, 0 0 32px 8px #3333ff22; }
          25% { box-shadow: 0 0 24px 4px #00eaff44, 0 0 40px 12px #fffb0044; }
          50% { box-shadow: 0 0 32px 8px #00ff9444, 0 0 48px 16px #ff00cc44; }
          75% { box-shadow: 0 0 24px 4px #fffb0044, 0 0 40px 12px #00eaff44; }
          100% { box-shadow: 0 0 16px 2px #ff00cc44, 0 0 32px 8px #3333ff22; }
        }
        .rainbow-border-glow {
          border-image: linear-gradient(90deg, #ff00cc, #3333ff, #00eaff, #fffb00, #00ff94, #ff00cc) 1;
          animation: rainbowGlow 6s linear infinite;
        }
        @keyframes pulseRainbow {
          0%, 100% { text-shadow: 0 0 8px #ff00cc, 0 0 16px #00eaff; }
          25% { text-shadow: 0 0 16px #fffb00, 0 0 32px #3333ff; }
          50% { text-shadow: 0 0 24px #00ff94, 0 0 48px #ff00cc; }
          75% { text-shadow: 0 0 16px #00eaff, 0 0 32px #fffb00; }
        }
        .animate-pulse-rainbow {
          animation: pulseRainbow 3s infinite;
        }
        @keyframes blobSlow {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(20deg); }
        }
        .animate-blob-slow {
          animation: blobSlow 18s ease-in-out infinite;
        }
        @keyframes blobFast {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(-15deg); }
        }
        .animate-blob-fast {
          animation: blobFast 8s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spinReverse 24s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          100% { transform: rotate(-360deg); }
        }
        @keyframes bgGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% 200%;
          animation: bgGradientMove 16s ease-in-out infinite;
        }
        .animate-blob {
          animation: blobFast 12s ease-in-out infinite;
        }
        @keyframes cardPop {
          0% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
          50% { transform: scale(1.02); box-shadow: 0 0 32px 8px #ff00cc44; }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 #ff00cc44; }
        }
        .animate-card-pop {
          animation: cardPop 6s ease-in-out infinite;
        }
        .rainbow-border-glow {
          box-shadow: 0 0 0 4px rgba(255,0,150,0.12), 0 0 32px 8px rgba(0,229,255,0.12), 0 0 32px 8px rgba(255,255,0,0.12), 0 0 32px 8px rgba(0,255,128,0.12);
        }
        @keyframes bgGradientMoveVivid {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 100%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient-vivid {
          background-size: 300% 300%;
          animation: bgGradientMoveVivid 24s ease-in-out infinite;
        }
        @keyframes gradientX {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 8s ease-in-out infinite;
        }
      `}</style>
    </MainLayout>
  );
};

export default Products; 