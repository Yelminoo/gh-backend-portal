'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  isPrimary: boolean;
  maxCapacity?: number;
  notes?: string;
  shop: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    parcels: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function WarehousesPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('isActive', filter === 'active' ? 'true' : 'false');
      }
      
      const response = await api.get(`/warehouses?${params.toString()}`);
      const data = response.data.data || response.data;
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch warehouses');
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    fetchWarehouses();
  }, [accessToken, router, fetchWarehouses]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete warehouse "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/warehouses/${id}`);
      setWarehouses(warehouses.filter(w => w.id !== id));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete warehouse');
      console.error('Error deleting warehouse:', err);
    }
  };

  const toggleActive = async (warehouse: Warehouse) => {
    try {
      await api.patch(`/warehouses/${warehouse.id}`, {
        isActive: !warehouse.isActive,
      });
      fetchWarehouses();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update warehouse');
      console.error('Error updating warehouse:', err);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="text-gray-600 mt-1">Manage your inventory locations</p>
        </div>
        <Link
          href="/warehouses/new"
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + Add Warehouse
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({warehouses.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Warehouse Grid */}
      {warehouses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No warehouses found</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first warehouse location
          </p>
          <Link
            href="/warehouses/new"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Your First Warehouse
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {warehouse.name}
                    </h3>
                    {warehouse.isPrimary && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-mono">
                    Code: {warehouse.code}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(warehouse)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    warehouse.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {warehouse.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Location */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-gray-400">📍</span>
                  <span>
                    {warehouse.address}, {warehouse.city}
                    {warehouse.state && `, ${warehouse.state}`}
                    <br />
                    {warehouse.country} {warehouse.postalCode}
                  </span>
                </p>
                {warehouse.phone && (
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">📞</span>
                    {warehouse.phone}
                  </p>
                )}
                {warehouse.email && (
                  <p className="flex items-center gap-2">
                    <span className="text-gray-400">✉️</span>
                    {warehouse.email}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Parcels in stock</span>
                  <span className="font-semibold text-amber-600">
                    {warehouse._count.parcels}
                  </span>
                </div>
                {warehouse.maxCapacity && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Max Capacity</span>
                    <span className="font-semibold">
                      {warehouse.maxCapacity.toLocaleString()} sq ft
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/warehouses/${warehouse.id}`}
                  className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-medium text-center transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/warehouses/${warehouse.id}/edit`}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(warehouse.id, warehouse.name)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
