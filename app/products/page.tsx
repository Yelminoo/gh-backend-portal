'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Product {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: Variant[];
}

interface Variant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string | number>;
}

export default function ProductsPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = accessToken || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProducts();
  }, [accessToken, router]);

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      console.log('Products API response:', response.data);
      // Ensure we have an array
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('Processed products:', data);
      setProducts(data);
      setError('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch products'
        : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      alert('Product deleted successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete product'
        : 'Failed to delete product';
      alert(errorMessage);
      console.error('Error deleting product:', err);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/products/${id}/edit`);
  };

  const handleCreate = () => {
    router.push('/products/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-auto p-6 rounded-lg">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <button
            onClick={handleCreate}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            + Add Product
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Table */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-primary-100">
            <p className="text-gray-500 text-lg">No products found. Create your first product!</p>
            <button
              onClick={handleCreate}
              className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
            >
              Create Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-primary-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-50">
                <tr>
                  <th className="w-10 px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Variants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-primary-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <>
                    {/* Main Product Row */}
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.variants && product.variants.length > 0 && (
                          <button
                            onClick={() => toggleRow(product.id)}
                            className="text-primary-600 hover:text-primary-800 transition-transform duration-200"
                            style={{
                              transform: expandedRows.has(product.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          >
                            ▶
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-primary-200">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.category && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                            {product.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.variants?.length || 0} variant(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.isActive ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Variants Row */}
                    {expandedRows.has(product.id) && product.variants && product.variants.length > 0 && (
                      <tr className="bg-primary-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="bg-white rounded-lg p-4 shadow-inner">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Product Variants</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">SKU</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Stock</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Attributes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {product.variants.map((variant) => (
                                    <tr key={variant.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm text-gray-900 font-mono">{variant.sku}</td>
                                      <td className="px-4 py-2 text-sm text-primary-600 font-semibold">
                                        ${Number(variant.price).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{variant.stock}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {Object.entries(variant.attributes || {}).map(([key, value]) => (
                          <span key={key} className="inline-block mr-2 mb-1">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    )}
  </>
))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}