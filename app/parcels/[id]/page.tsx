'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

type StoneUnit = 'PIECE' | 'CARAT' | 'GRAM' | 'KILOGRAM' | 'SQFT' | 'SLAB' | 'TON' | 'LOT';
type ParcelStatus = 'IN_STOCK' | 'RESERVED' | 'SOLD' | 'IN_TRANSIT' | 'DAMAGED';
type TrackingMode = 'BULK' | 'SINGLE';

interface Stone {
  id: string;
  stoneCode: string;
  carat: number;
  status: string;
  certificateNumber?: string;
  retailPrice?: number;
}

interface StoneProfile {
  id: string;
  stoneType: string;
  shape?: string;
  finishType?: string;
  color?: string;
  clarity?: string;
  cut?: string;
  origin?: string;
}

interface ParcelData {
  id: string;
  shopId?: string;
  warehouseId: string;
  variantId?: string;
  parcelCode: string;
  supplierRef?: string;
  trackingMode?: TrackingMode;
  stoneType?: string;
  stoneProfileId?: string;
  parcelReportRef?: string;
  origin?: string;
  qualityGrade?: string;
  certification?: string;
  unit: StoneUnit;
  totalQuantity: number;
  available: number;
  reserved: number;
  minOrderQty?: number;
  costPrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  notes?: string;
  images: string[];
  receivedAt: string;
  status: ParcelStatus;
  sellable: boolean;
  createdAt: string;
  updatedAt: string;
  warehouse?: { name: string; code: string; type: string };
  variant?: { sku: string; product: { name: string } };
  stoneProfile?: StoneProfile;
  stones?: Stone[];
  _count?: {
    stones?: number;
    transactions?: number;
  };
}

interface FormData {
  warehouseId: string;
  variantId: string;
  shopId: string;
  parcelCode: string;
  supplierRef: string;
  trackingMode: string;
  stoneType: string;
  stoneProfileId: string;
  parcelReportRef: string;
  origin: string;
  qualityGrade: string;
  certification: string;
  unit: StoneUnit;
  totalQuantity: string;
  available: string;
  reserved: string;
  minOrderQty: string;
  costPrice: string;
  wholesalePrice: string;
  retailPrice: string;
  status: ParcelStatus;
  sellable: boolean;
  notes: string;
}

export default function ParcelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [variants, setVariants] = useState<Array<{ id: string; sku: string; product: { name: string } }>>([]);
  
  const [formData, setFormData] = useState<FormData>({
    warehouseId: '',
    variantId: '',
    shopId: '',
    parcelCode: '',
    supplierRef: '',
    trackingMode: 'BULK',
    stoneType: '',
    stoneProfileId: '',
    parcelReportRef: '',
    origin: '',
    qualityGrade: '',
    certification: '',
    unit: 'CARAT',
    totalQuantity: '',
    available: '',
    reserved: '',
    minOrderQty: '',
    costPrice: '',
    wholesalePrice: '',
    retailPrice: '',
    status: 'IN_STOCK',
    sellable: false,
    notes: '',
  });

  const fetchParcel = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/parcels/${params.id}`);
      const data = response.data.data || response.data;
      
      setParcelData(data);
      setFormData({
        warehouseId: data.warehouseId || '',
        variantId: data.variantId || '',
        shopId: data.shopId || '',
        parcelCode: data.parcelCode || '',
        supplierRef: data.supplierRef || '',
        trackingMode: data.trackingMode || 'BULK',
        stoneType: data.stoneType || '',
        stoneProfileId: data.stoneProfileId || '',
        parcelReportRef: data.parcelReportRef || '',
        origin: data.origin || '',
        qualityGrade: data.qualityGrade || '',
        certification: data.certification || '',
        unit: data.unit as StoneUnit || 'CARAT',
        totalQuantity: data.totalQuantity ? data.totalQuantity.toString() : '',
        available: data.available ? data.available.toString() : '',
        reserved: data.reserved ? data.reserved.toString() : '0',
        minOrderQty: data.minOrderQty ? data.minOrderQty.toString() : '',
        costPrice: data.costPrice ? data.costPrice.toString() : '',
        wholesalePrice: data.wholesalePrice ? data.wholesalePrice.toString() : '',
        retailPrice: data.retailPrice ? data.retailPrice.toString() : '',
        status: data.status as ParcelStatus || 'IN_STOCK',
        sellable: data.sellable || false,
        notes: data.notes || '',
      });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch parcel');
      console.error('Error fetching parcel:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses?type=PHYSICAL');
      const data = response.data.data || response.data;
      setWarehouses(data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        const allVariants: Array<{ id: string; sku: string; product: { name: string } }> = [];
        data.forEach((product: { name: string; variants?: Array<{ id: string; sku: string }> }) => {
          if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach((variant) => {
              allVariants.push({
                id: variant.id,
                sku: variant.sku,
                product: {
                  name: product.name,
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

  useEffect(() => {
    fetchParcel();
    fetchWarehouses();
    fetchVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        warehouseId: formData.warehouseId,
        variantId: formData.variantId || undefined,
        parcelCode: formData.parcelCode,
        supplierRef: formData.supplierRef || undefined,
        origin: formData.origin || undefined,
        qualityGrade: formData.qualityGrade || undefined,
        certification: formData.certification || undefined,
        unit: formData.unit,
        totalQuantity: parseFloat(formData.totalQuantity),
        available: parseFloat(formData.available),
        reserved: formData.reserved ? parseFloat(formData.reserved) : 0,
        minOrderQty: formData.minOrderQty ? parseFloat(formData.minOrderQty) : undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        retailPrice: formData.retailPrice ? parseFloat(formData.retailPrice) : undefined,
        status: formData.status,
        sellable: formData.sellable,
        notes: formData.notes || undefined,
      };

      if (formData.shopId && formData.shopId.trim() !== '') {
        payload.shopId = formData.shopId;
      }

      await api.patch(`/parcels/${params.id}`, payload);
      setIsEditing(false);
      fetchParcel();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update parcel');
      console.error('Error updating parcel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/parcels/${params.id}`);
      router.push('/parcels');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete parcel');
      console.error('Error deleting parcel:', err);
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusColor = (status: ParcelStatus) => {
    const colors: Record<ParcelStatus, string> = {
      IN_STOCK: 'bg-green-100 text-green-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      SOLD: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DAMAGED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !parcelData) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-12">Loading parcel details...</div>
      </div>
    );
  }

  if (!parcelData) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-12 text-red-600">Parcel not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/parcels"
            className="text-amber-600 hover:text-amber-700 font-medium mb-4 inline-block"
          >
            ← Back to Parcels
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Parcel' : 'Parcel Details'}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Variant
              </label>
              <select
                name="variantId"
                value={formData.variantId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select Variant (Optional)</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.product.name} - {v.sku}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcel Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parcelCode"
                value={formData.parcelCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Reference
              </label>
              <input
                type="text"
                name="supplierRef"
                value={formData.supplierRef}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Physical Properties */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="e.g., Mogok, Myanmar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade
                </label>
                <input
                  type="text"
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  placeholder="e.g., AAA, Premium"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification
                </label>
                <input
                  type="text"
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="e.g., GIA cert #"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Inventory Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                >
                  <option value="PIECE">Piece</option>
                  <option value="CARAT">Carat</option>
                  <option value="GRAM">Gram</option>
                  <option value="KILOGRAM">Kilogram</option>
                  <option value="SQFT">Square Feet</option>
                  <option value="SLAB">Slab</option>
                  <option value="TON">Ton</option>
                  <option value="LOT">Lot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="totalQuantity"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="available"
                  value={formData.available}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserved
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="reserved"
                  value={formData.reserved}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="minOrderQty"
                  value={formData.minOrderQty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing (per unit)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wholesale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="wholesalePrice"
                  value={formData.wholesalePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retail Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="retailPrice"
                  value={formData.retailPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Status & Metadata */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="sellable"
                  checked={formData.sellable}
                  onChange={handleChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Mark as sellable (display in shop frontend)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                placeholder="Internal notes about this parcel..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchParcel();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Identification Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Parcel ID</label>
                <p className="text-sm font-mono text-gray-900">{parcelData.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Parcel Code</label>
                <p className="text-lg font-semibold text-gray-900">{parcelData.parcelCode}</p>
              </div>
              {parcelData.supplierRef && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier Reference</label>
                  <p className="text-lg text-gray-900">{parcelData.supplierRef}</p>
                </div>
              )}
            </div>
          </div>

          {/* Warehouse & Variant Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Warehouse</label>
                <p className="text-lg text-gray-900">
                  {parcelData.warehouse?.name || 'N/A'} 
                  {parcelData.warehouse?.code && ` (${parcelData.warehouse.code})`}
                </p>
                {parcelData.warehouse?.type && (
                  <p className="text-sm text-gray-500">Type: {parcelData.warehouse.type}</p>
                )}
              </div>
              {parcelData.variant && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Variant</label>
                  <p className="text-lg text-gray-900">{parcelData.variant.sku}</p>
                  <p className="text-sm text-gray-500">{parcelData.variant.product.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Physical Properties */}
          {(parcelData.origin || parcelData.qualityGrade || parcelData.certification) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {parcelData.trackingMode === 'SINGLE' ? 'Parcel Information' : 'Physical Properties'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {parcelData.origin && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Origin</label>
                    <p className="text-lg text-gray-900">{parcelData.origin}</p>
                  </div>
                )}
                {/* Only show qualityGrade for BULK tracking */}
                {parcelData.qualityGrade && parcelData.trackingMode !== 'SINGLE' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quality Grade</label>
                    <p className="text-lg text-gray-900">{parcelData.qualityGrade}</p>
                  </div>
                )}
                {/* Only show certification for BULK tracking (parcel-level) */}
                {parcelData.certification && parcelData.trackingMode !== 'SINGLE' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Parcel Certification</label>
                    <p className="text-lg text-gray-900">{parcelData.certification}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking System Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking System</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Tracking Mode</label>
                <p className="text-lg text-gray-900">
                  {parcelData.trackingMode === 'SINGLE' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      🔍 Single Stone Tracking
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      📦 Bulk Tracking
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {parcelData.trackingMode === 'SINGLE'
                    ? 'Individual stones with unique IDs'
                    : 'Quantity-based inventory'}
                </p>
              </div>
              {parcelData.stoneType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Stone Type</label>
                  <p className="text-lg font-semibold text-amber-700">
                    {parcelData.stoneType.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
              {parcelData.parcelReportRef && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Parcel Report</label>
                  <p className="text-lg text-gray-900 font-mono">{parcelData.parcelReportRef}</p>
                </div>
              )}
            </div>

            {/* Stone Profile */}
            {parcelData.stoneProfile && (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Stone Profile</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {parcelData.stoneProfile.shape && (
                    <div>
                      <span className="text-gray-500">Shape:</span>
                      <span className="ml-2 font-medium text-gray-900">{parcelData.stoneProfile.shape}</span>
                    </div>
                  )}
                  {parcelData.stoneProfile.finishType && (
                    <div>
                      <span className="text-gray-500">Finish:</span>
                      <span className="ml-2 font-medium text-gray-900">{parcelData.stoneProfile.finishType}</span>
                    </div>
                  )}
                  {parcelData.stoneProfile.color && (
                    <div>
                      <span className="text-gray-500">Color:</span>
                      <span className="ml-2 font-medium text-gray-900">{parcelData.stoneProfile.color}</span>
                    </div>
                  )}
                  {parcelData.stoneProfile.clarity && (
                    <div>
                      <span className="text-gray-500">Clarity:</span>
                      <span className="ml-2 font-medium text-gray-900">{parcelData.stoneProfile.clarity}</span>
                    </div>
                  )}
                  {parcelData.stoneProfile.cut && (
                    <div>
                      <span className="text-gray-500">Cut:</span>
                      <span className="ml-2 font-medium text-gray-900">{parcelData.stoneProfile.cut}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Individual Stones */}
            {parcelData.trackingMode === 'SINGLE' && parcelData._count && parcelData._count.stones !== undefined && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-900">
                    Individual Stones ({parcelData._count.stones})
                  </h4>
                  {parcelData._count.stones > 0 && (
                    <Link
                      href={`/parcels/${parcelData.id}/stones`}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      View All Stones →
                    </Link>
                  )}
                </div>
                {parcelData.stones && parcelData.stones.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stone Code</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Carat</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parcelData.stones.slice(0, 10).map((stone) => (
                          <tr key={stone.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-gray-900">{stone.stoneCode}</td>
                            <td className="px-4 py-2 text-right text-gray-900">{Number(stone.carat).toFixed(2)}</td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                stone.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                stone.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-800' :
                                stone.status === 'SOLD' ? 'bg-gray-100 text-gray-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {stone.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600">{stone.certificateNumber || '-'}</td>
                            <td className="px-4 py-2 text-right font-medium text-gray-900">
                              {stone.retailPrice ? `$${Number(stone.retailPrice).toFixed(2)}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parcelData._count.stones > 10 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Showing 10 of {parcelData._count.stones} stones
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No individual stones added yet</p>
                    <button className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium">
                      + Add Stones
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inventory Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {parcelData.trackingMode === 'SINGLE' ? 'Stone Count Summary' : 'Inventory Details'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Unit</label>
                <p className="text-lg font-semibold text-gray-900">{parcelData.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {parcelData.trackingMode === 'SINGLE' ? 'Total Stones' : 'Total Quantity'}
                </label>
                <p className="text-lg font-semibold text-gray-900">{parcelData.totalQuantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {parcelData.trackingMode === 'SINGLE' ? 'Available Stones' : 'Available'}
                </label>
                <p className="text-lg font-semibold text-green-600">{parcelData.available}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {parcelData.trackingMode === 'SINGLE' ? 'Reserved Stones' : 'Reserved'}
                </label>
                <p className="text-lg font-semibold text-yellow-600">{parcelData.reserved}</p>
              </div>
            </div>
            {/* Only show minOrderQty for BULK tracking */}
            {parcelData.minOrderQty && parcelData.trackingMode !== 'SINGLE' && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Minimum Order Quantity</label>
                <p className="text-lg text-gray-900">{parcelData.minOrderQty} {parcelData.unit}</p>
              </div>
            )}
            {parcelData.trackingMode === 'SINGLE' && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>ℹ️ Single Tracking:</strong> Quantities represent number of individual stones. Each stone is tracked separately below.
                </p>
              </div>
            )}
          </div>

          {/* Pricing */}
          {(parcelData.costPrice || parcelData.wholesalePrice || parcelData.retailPrice) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {parcelData.trackingMode === 'SINGLE' ? 'Default Pricing' : `Pricing (per ${parcelData.unit})`}
              </h3>
              {parcelData.trackingMode === 'SINGLE' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Note:</strong> These are default prices. Individual stones may have their own specific prices.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {parcelData.costPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {parcelData.trackingMode === 'SINGLE' ? 'Default Cost Price' : 'Cost Price'}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">${Number(parcelData.costPrice).toFixed(2)}</p>
                  </div>
                )}
                {parcelData.wholesalePrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {parcelData.trackingMode === 'SINGLE' ? 'Default Wholesale Price' : 'Wholesale Price'}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">${Number(parcelData.wholesalePrice).toFixed(2)}</p>
                  </div>
                )}
                {parcelData.retailPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {parcelData.trackingMode === 'SINGLE' ? 'Default Retail Price' : 'Retail Price'}
                    </label>
                    <p className="text-lg font-semibold text-gray-900">${Number(parcelData.retailPrice).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status & Metadata */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(parcelData.status)}`}>
                    {parcelData.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sellable</label>
                <p className="text-lg text-gray-900">{parcelData.sellable ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Received At</label>
                <p className="text-lg text-gray-900">
                  {new Date(parcelData.receivedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-lg text-gray-900">
                  {new Date(parcelData.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-lg text-gray-900">
                  {new Date(parcelData.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {parcelData.notes && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{parcelData.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Parcel"
        message={`Are you sure you want to delete parcel "${parcelData.parcelCode}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
      />
    </div>
  );
}
