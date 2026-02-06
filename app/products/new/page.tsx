'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export default function NewProductPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [variants, setVariants] = useState<Array<{
    sku: string;
    price: string;
    stock: string;
    attributes: Array<{ key: string; value: string }>;
  }>>([
    { sku: '', price: '', stock: '', attributes: [{ key: '', value: '' }] }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isActive: true,
    shopId: '', // This should be fetched from the logged-in user's shop
  });

  const fetchCategories = async (page = 1, search = '') => {
    try {
      setCategoryLoading(true);
      // Add pagination and search parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20'); // 20 items per page
      if (search) {
        params.append('search', search);
      }
      
      const response = await api.get(`/categories?${params.toString()}`);
      // The API returns { success, timestamp, data: [...] }
      // Extract the actual array from response.data.data
      const responseData = response.data.data || response.data;
      
      // Handle both paginated and non-paginated responses
      let categoriesData: Category[];
      let totalPages = 1;
      
      if (responseData.items && Array.isArray(responseData.items)) {
        // Paginated response: { items: [...], totalPages: N, currentPage: N }
        categoriesData = responseData.items;
        totalPages = responseData.totalPages || 1;
      } else if (Array.isArray(responseData)) {
        // Simple array response
        categoriesData = responseData;
      } else {
        console.error('Unexpected categories response format:', responseData);
        categoriesData = [];
      }
      
      console.log('Categories fetched:', categoriesData);
      console.log('Is array?', Array.isArray(categoriesData));
      console.log('Length:', categoriesData?.length);
      console.log('Total pages:', totalPages);
      
      // If pagination and not first page, append to existing categories
      if (page > 1) {
        setCategories(prev => [...prev, ...categoriesData]);
      } else {
        setCategories(categoriesData);
      }
      
      setCategoryTotalPages(totalPages);
      setCategoryPage(page);
      setCategoriesLoaded(true);
      setCategoryLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
      setCategoriesLoaded(true);
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const token = accessToken || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCategories();
  }, [isMounted, accessToken, router]);

  useEffect(() => {
    console.log('State check - isMounted:', isMounted, 'categoriesLoaded:', categoriesLoaded, 'categories length:', categories.length);
  }, [isMounted, categoriesLoaded, categories]);

  // Debounced search for categories
  useEffect(() => {
    if (!isMounted || !categoriesLoaded) return;

    // Debounce search: wait 500ms after user stops typing
    const timeoutId = setTimeout(() => {
      if (categorySearch) {
        // Fetch filtered categories from server
        setCategoryPage(1);
        fetchCategories(1, categorySearch);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [categorySearch, isMounted, categoriesLoaded]);

  // Client-side filter for immediate feedback (optional - shows results while debouncing)
  const filteredCategories = categorySearch 
    ? categories.filter(category =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : categories;

  // Load more categories (pagination)
  const loadMoreCategories = () => {
    if (categoryPage < categoryTotalPages && !categoryLoading) {
      fetchCategories(categoryPage + 1, categorySearch);
    }
  };

  // Get selected category name
  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter((file) =>
      file.type.startsWith('image/')
    );

    if (validFiles.length !== files.length) {
      alert('Please select only image files');
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant management functions
  const addVariant = () => {
    setVariants([...variants, { sku: '', price: '', stock: '', attributes: [{ key: '', value: '' }] }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const addAttribute = (variantIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].attributes.push({ key: '', value: '' });
    setVariants(updatedVariants);
  };

  const removeAttribute = (variantIndex: number, attrIndex: number) => {
    const updatedVariants = [...variants];
    if (updatedVariants[variantIndex].attributes.length > 1) {
      updatedVariants[variantIndex].attributes = updatedVariants[variantIndex].attributes.filter((_, i) => i !== attrIndex);
      setVariants(updatedVariants);
    }
  };

  const updateAttribute = (variantIndex: number, attrIndex: number, field: 'key' | 'value', value: string) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].attributes[attrIndex][field] = value;
    setVariants(updatedVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Upload images
      const uploadedImagePaths: string[] = [];

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await api.post('/products/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        uploadedImagePaths.push(uploadResponse.data.path);
      }

      // Step 2: Create product with image paths and variants
      const productData = {
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.categoryId || null,
        isActive: formData.isActive,
        images: uploadedImagePaths,
        shopId: formData.shopId || '1', // TODO: Get from authenticated user's shop
        variants: variants.map(v => ({
          sku: v.sku,
          price: parseFloat(v.price),
          stock: parseInt(v.stock, 10),
          attributes: v.attributes.reduce((acc, attr) => {
            if (attr.key && attr.value) {
              acc[attr.key] = attr.value;
            }
            return acc;
          }, {} as Record<string, string>)
        }))
      };

      await api.post('/products', productData);

      alert('Product created successfully!');
      router.push('/products');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create product'
        : 'Failed to create product';
      setError(errorMessage);
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;
  return (
    <div className="min-h-auto p-6 rounded-lg">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center font-medium"
            suppressHydrationWarning
          >
            ← Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-primary-100" suppressHydrationWarning>
          {/* Product Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
              placeholder="Enter product name"
              suppressHydrationWarning
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
              placeholder="Enter product description"
              suppressHydrationWarning
            />
          </div>

          {/* Category - Searchable Dropdown */}
          <div className="mb-6 relative">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-900 mb-2">
              Category *
            </label>
            {isMounted && categoriesLoaded ? (
              <div className="relative">
                {/* Search Input */}
                <input
                  type="text"
                  value={selectedCategory ? selectedCategory.name : categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                    if (!e.target.value) {
                      setFormData(prev => ({ ...prev, categoryId: '' }));
                    }
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="Search and select a category..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
                  suppressHydrationWarning
                  required
                />
                
                {/* Dropdown List */}
                {showCategoryDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowCategoryDropdown(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {categoryLoading && categoryPage === 1 ? (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          Loading categories...
                        </div>
                      ) : filteredCategories.length > 0 ? (
                        <>
                          {filteredCategories.map((category) => (
                            <div
                              key={category.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, categoryId: category.id }));
                                setCategorySearch('');
                                setShowCategoryDropdown(false);
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-primary-50 transition-colors ${
                                formData.categoryId === category.id ? 'bg-primary-100 text-primary-900 font-semibold' : 'text-gray-900'
                              }`}
                            >
                              {category.name}
                            </div>
                          ))}
                          
                          {/* Load More Button */}
                          {categoryPage < categoryTotalPages && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadMoreCategories();
                              }}
                              disabled={categoryLoading}
                              className="w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 border-t border-gray-200 font-medium disabled:opacity-50"
                              suppressHydrationWarning
                            >
                              {categoryLoading ? (
                                <>
                                  <span className="inline-block animate-spin mr-2">⏳</span>
                                  Loading more...
                                </>
                              ) : (
                                `Load More (${categoryPage}/${categoryTotalPages})`
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-center">
                          {categorySearch ? 'No categories found matching your search' : 'No categories available'}
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  name="categoryId"
                  value={formData.categoryId}
                  required
                />
              </div>
            ) : (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-48"></div>
              </div>
            )}
          </div>

          {/* Variants Section */}
          <div className="mb-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
                suppressHydrationWarning
              >
                + Add Variant
              </button>
            </div>

            {variants.map((variant, vIndex) => (
              <div key={vIndex} className="mb-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Variant {vIndex + 1}</h4>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      suppressHydrationWarning
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* SKU, Price, Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(vIndex, 'sku', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
                      placeholder="e.g., PROD-001-RED"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(vIndex, 'price', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
                      placeholder="0.00"
                      suppressHydrationWarning
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(vIndex, 'stock', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Attributes */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Attributes (e.g., Color, Size)
                    </label>
                    <button
                      type="button"
                      onClick={() => addAttribute(vIndex)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      suppressHydrationWarning
                    >
                      + Add Attribute
                    </button>
                  </div>

                  {variant.attributes.map((attr, aIndex) => (
                    <div key={aIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={attr.key}
                        onChange={(e) => updateAttribute(vIndex, aIndex, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
                        placeholder="Attribute name (e.g., Color)"
                        suppressHydrationWarning
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => updateAttribute(vIndex, aIndex, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white font-medium"
                        placeholder="Value (e.g., Red)"
                        suppressHydrationWarning
                      />
                      {variant.attributes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttribute(vIndex, aIndex)}
                          className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                          suppressHydrationWarning
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              suppressHydrationWarning
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-primary-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      suppressHydrationWarning
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                suppressHydrationWarning
              />
              <span className="ml-2 text-sm text-gray-700">Active (visible to customers)</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400 shadow-md hover:shadow-lg"
              suppressHydrationWarning
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              suppressHydrationWarning
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
