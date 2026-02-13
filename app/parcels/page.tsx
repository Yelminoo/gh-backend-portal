'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Parcel {
  id: string;
  parcelCode: string;
  supplierRef?: string;
  trackingMode?: string;
  stoneType?: string;
  origin?: string;
  qualityGrade?: string;
  certification?: string;
  unit: string;
  totalQuantity: number;
  available: number;
  reserved: number;
  minOrderQty?: number;
  costPrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  status: string;
  notes?: string;
  images: string[];
  receivedAt: string;
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
  variant?: {
    id: string;
    sku: string;
    product: {
      id: string;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

const UNIT_LABELS: Record<string, string> = {
  PIECE: 'Pieces',
  CARAT: 'Carats',
  GRAM: 'Grams',
  KILOGRAM: 'Kilograms',
  SQFT: 'Sq Ft',
  SLAB: 'Slabs',
  TON: 'Tons',
  LOT: 'Lots',
};

const STATUS_COLORS: Record<string, string> = {
  IN_STOCK: 'bg-green-100 text-green-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  SOLD: 'bg-gray-100 text-gray-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DAMAGED: 'bg-red-100 text-red-800',
};

export default function ParcelsPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [trackingModeFilter, setTrackingModeFilter] = useState<string>('all');
  const [stoneTypeFilter, setStoneTypeFilter] = useState<string>('all');
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    fetchWarehouses();
    fetchParcels();
  }, [accessToken, router]);

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses?isActive=true');
      const data = response.data.data || response.data;
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parcels');
      const data = response.data.data || response.data;
      setParcels(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch parcels');
      console.error('Error fetching parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    const matchesSearch =
      parcel.parcelCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.supplierRef?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || parcel.status === statusFilter;
    const matchesWarehouse =
      warehouseFilter === 'all' || parcel.warehouse.id === warehouseFilter;
    const matchesTrackingMode =
      trackingModeFilter === 'all' || parcel.trackingMode === trackingModeFilter;
    const matchesStoneType =
      stoneTypeFilter === 'all' || parcel.stoneType === stoneTypeFilter;

    return matchesSearch && matchesStatus && matchesWarehouse && matchesTrackingMode && matchesStoneType;
  });

  const totalValue = filteredParcels.reduce(
    (sum, p) => sum + (Number(p.retailPrice) || 0) * Number(p.available),
    0
  );

  const totalAvailable = filteredParcels.reduce((sum, p) => sum + Number(p.available), 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gemstone Inventory</h1>
          <p className="text-gray-600 mt-1">Manage parcels and bulk inventory</p>
        </div>
        <Link
          href="/parcels/new"
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + Add Parcel
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm mb-1">Total Parcels</div>
          <div className="text-3xl font-bold text-gray-900">{filteredParcels.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm mb-1">Total Available</div>
          <div className="text-3xl font-bold text-amber-600">
            {totalAvailable.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm mb-1">Total Value</div>
          <div className="text-3xl font-bold text-green-600">
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-gray-600 text-sm mb-1">Warehouses</div>
          <div className="text-3xl font-bold text-blue-600">{warehouses.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Parcel code, origin, supplier ref..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse
            </label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Mode
            </label>
            <select
              value={trackingModeFilter}
              onChange={(e) => setTrackingModeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Modes</option>
              <option value="BULK">Bulk</option>
              <option value="SINGLE">Single</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stone Type
            </label>
            <select
              value={stoneTypeFilter}
              onChange={(e) => setStoneTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="DIAMOND">Diamond</option>
              <option value="RUBY">Ruby</option>
              <option value="SAPPHIRE">Sapphire</option>
              <option value="EMERALD">Emerald</option>
              <option value="AMETHYST">Amethyst</option>
              <option value="TOPAZ">Topaz</option>
              <option value="GARNET">Garnet</option>
              <option value="PEARL">Pearl</option>
              <option value="OPAL">Opal</option>
              <option value="JADE">Jade</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parcels Table */}
      {filteredParcels.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">💎</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No parcels found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || warehouseFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first gemstone parcel'}
          </p>
          {!searchTerm && statusFilter === 'all' && warehouseFilter === 'all' && (
            <Link
              href="/parcels/new"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Parcel
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcel Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin / Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retail Price
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParcels.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 font-mono">
                        {parcel.parcelCode}
                      </div>
                      {parcel.supplierRef && (
                        <div className="text-sm text-gray-500">
                          Ref: {parcel.supplierRef}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {parcel.stoneType && (
                        <div className="text-sm font-medium text-amber-700">
                          {parcel.stoneType.replace('_', ' ')}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {parcel.trackingMode === 'SINGLE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            🔍 Single
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            📦 Bulk
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{parcel.origin || '-'}</div>
                      {parcel.qualityGrade && (
                        <div className="text-xs text-gray-500">
                          Grade: {parcel.qualityGrade}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {parcel.warehouse.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {parcel.warehouse.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {parcel.totalQuantity.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {UNIT_LABELS[parcel.unit] || parcel.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {parcel.available.toLocaleString()}
                      </div>
                      {Number(parcel.reserved) > 0 && (
                        <div className="text-xs text-gray-500">
                          Reserved: {Number(parcel.reserved).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {parcel.retailPrice
                          ? `$${Number(parcel.retailPrice).toLocaleString()}`
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          STATUS_COLORS[parcel.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {parcel.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/parcels/${parcel.id}`}
                        className="text-amber-600 hover:text-amber-900 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        href={`/parcels/${parcel.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
