import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus, X, Save } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import {
  Product,
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct
} from '../utils/productService';
import { formatCurrency } from '../utils/currencyFormatter';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdDate'>>({
    name: '',
    price: 0,
    description: '',
    commissionRate: 10,
    active: true,
  });

  // Check for admin authentication
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const allProducts = await getAllProducts();
    setProducts(allProducts);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct);
      if (updated) {
        loadProducts();
        setEditingProduct(null);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const isDeleted = await deleteProduct(productId);
      if (isDeleted) {
        loadProducts();
      }
    }
  };

  const handleAddProduct = async () => {
    const addedProduct = await addProduct(newProduct);
    if (addedProduct) {
      loadProducts();
      setShowAddForm(false);
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        commissionRate: 10,
        active: true,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
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
        <div className="fixed inset-0 animate-bg-gradient-vivid" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.18), rgba(0,229,255,0.15), rgba(255,255,0,0.13), rgba(0,255,128,0.12))' }}></div>
      </div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">Product Management</h1>
          <p className="text-neutral-600 font-semibold animate-fade-in">Manage products and their commission rates</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddForm(true)}
        >
          Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <Card className="mb-6 bg-gradient-to-br from-pink-100 via-yellow-100 via-green-100 via-blue-100 to-purple-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Add New Product</h2>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-4 w-4" />}
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Enter product name"
              required
            />

            <Input
              label="Price ($)"
              type="number"
              min="0"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              placeholder="Enter price"
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>

            <Input
              label="Commission Rate (%)"
              type="number"
              min="0"
              max="100"
              value={newProduct.commissionRate}
              onChange={(e) => setNewProduct({ ...newProduct, commissionRate: parseFloat(e.target.value) })}
              placeholder="Enter commission rate"
              required
            />

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="active"
                checked={newProduct.active}
                onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="active" className="ml-2 text-sm font-medium text-neutral-700">
                Active Product
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </div>
        </Card>
      )}

      {/* Products List */}
      <Card className="bg-gradient-to-br from-yellow-100 via-pink-100 via-blue-100 to-green-100 backdrop-blur-xl rounded-2xl shadow-2xl rainbow-border-glow animate-card-pop">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {products.map((product) => (
                <tr key={product.id}>
                  {editingProduct && editingProduct.id === product.id ? (
                    // Editing mode
                    <>
                      <td className="px-6 py-4">
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="mb-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          className="mb-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editingProduct.commissionRate}
                          onChange={(e) => setEditingProduct({ ...editingProduct, commissionRate: parseFloat(e.target.value) })}
                          className="mb-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingProduct.active}
                            onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label className="ml-2 text-sm font-medium text-neutral-700">
                            Active
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(editingProduct.createdDate)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Save className="h-4 w-4" />}
                            onClick={handleUpdateProduct}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<X className="h-4 w-4" />}
                            onClick={() => setEditingProduct(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{product.name}</div>
                        <div className="text-xs text-neutral-500 max-w-xs truncate">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {product.commissionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${product.active ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'}`}
                        >
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(product.createdDate)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit className="h-4 w-4" />}
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash className="h-4 w-4" />}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <style>{`
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
        @keyframes gradientX {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 8s ease-in-out infinite;
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
      `}</style>
    </AdminLayout>
  );
};

export default AdminProducts; 