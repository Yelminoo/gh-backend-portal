'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const UNITS = [
  { value: 'PIECE', label: 'Pieces' },
  { value: 'CARAT', label: 'Carats' },
  { value: 'GRAM', label: 'Grams' },
  { value: 'KILOGRAM', label: 'Kilograms' },
  { value: 'SQFT', label: 'Square Feet' },
  { value: 'SLAB', label: 'Slabs' },
  { value: 'TON', label: 'Tons' },
  { value: 'LOT', label: 'Lots' },
];

const STATUS_OPTIONS = [
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DAMAGED', label: 'Damaged' },
];

const TRACKING_MODES = [
  { value: 'BULK', label: 'Bulk (Quantity-based)' },
  { value: 'SINGLE', label: 'Single (Individual Stone Tracking)' },
];

const STONE_TYPES = [
  { value: 'DIAMOND', label: 'Diamond' },
  { value: 'RUBY', label: 'Ruby' },
  { value: 'SAPPHIRE', label: 'Sapphire' },
  { value: 'EMERALD', label: 'Emerald' },
  { value: 'AMETHYST', label: 'Amethyst' },
  { value: 'TOPAZ', label: 'Topaz' },
  { value: 'GARNET', label: 'Garnet' },
  { value: 'PEARL', label: 'Pearl' },
  { value: 'OPAL', label: 'Opal' },
  { value: 'JADE', label: 'Jade' },
  { value: 'TOURMALINE', label: 'Tourmaline' },
  { value: 'PERIDOT', label: 'Peridot' },
  { value: 'AQUAMARINE', label: 'Aquamarine' },
  { value: 'TANZANITE', label: 'Tanzanite' },
  { value: 'CITRINE', label: 'Citrine' },
  { value: 'ONYX', label: 'Onyx' },
  { value: 'TURQUOISE', label: 'Turquoise' },
  { value: 'LAPIS_LAZULI', label: 'Lapis Lazuli' },
  { value: 'MOONSTONE', label: 'Moonstone' },
  { value: 'ALEXANDRITE', label: 'Alexandrite' },
  { value: 'SPINEL', label: 'Spinel' },
  { value: 'ZIRCON', label: 'Zircon' },
  { value: 'OTHER', label: 'Other' },
];

interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  product: {
    name: string;
  };
}

export default function NewParcelPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  const [formData, setFormData] = useState({
    shopId: '',
    warehouseId: '',
    variantId: '',
    parcelCode: '',
    supplierRef: '',
    trackingMode: 'BULK',
    stoneType: '',
    stoneProfileId: '',
    origin: '',
    qualityGrade: '',
    certification: '',
    parcelReportRef: '',
    unit: 'PIECE',
    totalQuantity: '',
    available: '',
    reserved: '0',
    minOrderQty: '',
    costPrice: '',
    wholesalePrice: '',
    retailPrice: '',
    status: 'IN_STOCK',
    sellable: false,
    notes: '',
  });

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    fetchWarehouses();
    fetchVariants();
  }, [accessToken, router]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses?type=PHYSICAL');
      const data = response.data.data || response.data;
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        const allVariants: ProductVariant[] = [];
        data.forEach((product) => {
          const prod = product as { 
            name: string; 
            variants?: Array<{ id: string; sku: string }> 
          };
          if (prod.variants && Array.isArray(prod.variants)) {
            prod.variants.forEach((variant) => {
              allVariants.push({
                id: variant.id,
                sku: variant.sku,
                product: {
                  name: prod.name,
                },
              });
            });
          }
        });
        setVariants(allVariants);
      }
    } catch (err) {
      console.error('Error fetching variants:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build payload without shopId if it's empty
      const payload: Record<string, unknown> = {
        warehouseId: formData.warehouseId,
        parcelCode: formData.parcelCode,
        trackingMode: formData.trackingMode,
        unit: formData.unit,
        status: formData.status,
        sellable: formData.sellable,
        totalQuantity: parseFloat(formData.totalQuantity),
        available: parseFloat(formData.available),
        reserved: parseFloat(formData.reserved),
        minOrderQty: formData.minOrderQty ? parseFloat(formData.minOrderQty) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        variantId: formData.variantId || undefined,
        supplierRef: formData.supplierRef || undefined,
        stoneType: formData.stoneType || undefined,
        stoneProfileId: formData.stoneProfileId || undefined,
        origin: formData.origin || undefined,
        qualityGrade: formData.qualityGrade || undefined,
        certification: formData.certification || undefined,
        parcelReportRef: formData.parcelReportRef || undefined,
        notes: formData.notes || undefined,
      };

      // Only add shopId if it's provided and not empty
      if (formData.shopId && formData.shopId.trim() !== '') {
        payload.shopId = formData.shopId;
      }

      await api.post('/parcels', payload);
      router.push('/parcels');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create parcel');
      console.error('Error creating parcel:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/parcels"
          className="text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block"
        >
          ← Back to Parcels
        </Link>
        <h1 className="text-3xl font-bold text-amber-900 mt-2">Add New Parcel</h1>
        <p className="text-gray-600 mt-2">Track bulk inventory with parcel/batch system</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Warehouse Selection */}
        <div>
          <label htmlFor="warehouseId" className="block text-sm font-medium text-gray-700 mb-2">
            Warehouse <span className="text-red-500">*</span>
          </label>
          <select
            id="warehouseId"
            name="warehouseId"
            value={formData.warehouseId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="" className="text-gray-400">Select Warehouse</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id} className="text-gray-900">
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        {/* Product Variant (Optional) */}
        <div>
          <label htmlFor="variantId" className="block text-sm font-medium text-gray-700 mb-2">
            Product Variant (Optional)
          </label>
          <select
            id="variantId"
            name="variantId"
            value={formData.variantId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="" className="text-gray-400">None - Track parcel separately</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id} className="text-gray-900">
                {variant.product.name} - {variant.sku}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Link to a product variant or track independently
          </p>
        </div>

        {/* Identification Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="parcelCode" className="block text-sm font-medium text-gray-700 mb-2">
                Parcel Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="parcelCode"
                name="parcelCode"
                value={formData.parcelCode}
                onChange={handleChange}
                required
                placeholder="e.g., RUBY-2024-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="supplierRef" className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Reference
              </label>
              <input
                type="text"
                id="supplierRef"
                name="supplierRef"
                value={formData.supplierRef}
                onChange={handleChange}
                placeholder="Supplier's reference number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Tracking System Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trackingMode" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Mode <span className="text-red-500">*</span>
              </label>
              <select
                id="trackingMode"
                name="trackingMode"
                value={formData.trackingMode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
              >
                {TRACKING_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value} className="text-gray-900">
                    {mode.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {formData.trackingMode === 'BULK' 
                  ? 'Track total quantities (e.g., 500 carats of rubies)'
                  : 'Track individual stones with unique IDs and certificates'}
              </p>
            </div>

            <div>
              <label htmlFor="stoneType" className="block text-sm font-medium text-gray-700 mb-2">
                Stone Type
              </label>
              <select
                id="stoneType"
                name="stoneType"
                value={formData.stoneType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="" className="text-gray-400">Select Stone Type</option>
                {STONE_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Specify the type of gemstone in this parcel
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="parcelReportRef" className="block text-sm font-medium text-gray-700 mb-2">
                Parcel Report Reference
              </label>
              <input
                type="text"
                id="parcelReportRef"
                name="parcelReportRef"
                value={formData.parcelReportRef}
                onChange={handleChange}
                placeholder="e.g., GIA Parcel Report #123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
              <p className="mt-1 text-sm text-gray-500">
                Reference to parcel-level certification or grading report
              </p>
            </div>
          </div>
        </div>

        {/* Physical Properties */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {formData.trackingMode === 'SINGLE' ? 'Parcel Information (Optional - Use Stone Profile for details)' : 'Physical Properties'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                Origin
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="e.g., Mogok, Myanmar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Quality Grade - Only show for BULK tracking */}
            {formData.trackingMode === 'BULK' && (
              <div>
                <label htmlFor="qualityGrade" className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade
                </label>
                <input
                  type="text"
                  id="qualityGrade"
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  placeholder="A, AA, AAA, Premium"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500">Bulk grade for entire parcel</p>
              </div>
            )}

            {/* Certification - Only show for BULK tracking (parcel-level) */}
            {formData.trackingMode === 'BULK' && (
              <div>
                <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">
                  Certification
                </label>
                <input
                  type="text"
                  id="certification"
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="GIA, IGI certificate #"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500">Parcel-level certification</p>
              </div>
            )}
          </div>

          {/* SINGLE tracking note */}
          {formData.trackingMode === 'SINGLE' && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>ℹ️ Single Tracking Mode:</strong> Individual stone details (certificates, grades, dimensions) 
                will be managed per stone. Use the Stone Profile to define shared characteristics like color, clarity, and cut grade.
              </p>
            </div>
          )}
        </div>

        {/* Inventory Details */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {formData.trackingMode === 'SINGLE' ? 'Initial Inventory (Will be updated as stones are added)' : 'Inventory Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
              >
                {UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value} className="text-gray-900">
                    {unit.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.trackingMode === 'SINGLE' ? 'Unit for individual stones (usually PIECE or CARAT)' : 'Measurement unit for this parcel'}
              </p>
            </div>

            {/* Total Quantity - Different meaning for SINGLE vs BULK */}
            <div>
              <label htmlFor="totalQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.trackingMode === 'SINGLE' ? 'Expected Stone Count' : 'Total Quantity'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="totalQuantity"
                name="totalQuantity"
                value={formData.totalQuantity}
                onChange={handleChange}
                required
                placeholder={formData.trackingMode === 'SINGLE' ? '10' : '500'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.trackingMode === 'SINGLE' ? 'Number of individual stones expected' : 'Total amount in this parcel'}
              </p>
            </div>

            <div>
              <label htmlFor="available" className="block text-sm font-medium text-gray-700 mb-2">
                Available <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                id="available"
                name="available"
                value={formData.available}
                onChange={handleChange}
                required
                placeholder={formData.trackingMode === 'SINGLE' ? '10' : '500'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.trackingMode === 'SINGLE' ? 'Currently available stones' : 'Currently available quantity'}
              </p>
            </div>

            {/* Min Order Qty - Only for BULK */}
            {formData.trackingMode === 'BULK' && (
              <div>
                <label htmlFor="minOrderQty" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="minOrderQty"
                  name="minOrderQty"
                  value={formData.minOrderQty}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum order for bulk purchase</p>
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 bg-white"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value} className="text-gray-900">
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="sellable"
                  checked={formData.sellable}
                  onChange={(e) => setFormData({ ...formData, sellable: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mark as Sellable in Shop Frontend
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-2">
                (Only sellable parcels in warehouses linked to shops will appear in e-commerce)
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {formData.trackingMode === 'SINGLE' ? 'Default Pricing (Optional - Can be set per stone)' : 'Pricing (per unit)'}
          </h3>
          {formData.trackingMode === 'SINGLE' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Note:</strong> These prices are defaults for the parcel. Individual stones can have their own prices when added.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.trackingMode === 'SINGLE' ? 'Default Cost Price' : 'Cost Price (per unit)'}
              </label>
              <input
                type="number"
                step="0.01"
                id="costPrice"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="10.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.trackingMode === 'SINGLE' ? 'Default Wholesale Price' : 'Wholesale Price'}
              </label>
              <input
                type="number"
                step="0.01"
                id="wholesalePrice"
                name="wholesalePrice"
                value={formData.wholesalePrice}
                onChange={handleChange}
                placeholder="15.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.trackingMode === 'SINGLE' ? 'Default Retail Price' : 'Retail Price'}
              </label>
              <input
                type="number"
                step="0.01"
                id="retailPrice"
                name="retailPrice"
                value={formData.retailPrice}
                onChange={handleChange}
                placeholder="25.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Internal notes about this parcel..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Parcel'}
          </button>
          <Link
            href="/parcels"
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
