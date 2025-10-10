import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AddVendorModal from '../components/Vendors/AddVendorModal';
import EditVendorModal from '../components/Vendors/EditVendorModal';
import ViewVendorModal from '../components/Vendors/ViewVendorModal';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  buildings?: Array<{
    id: string;
    name: string;
  }>;
}

const Vendors: React.FC = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          vendor_buildings (
            buildings (
              id,
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;
      
      // Transform the data to flatten the buildings array
      const transformedData = data?.map(vendor => ({
        ...vendor,
        buildings: vendor.vendor_buildings?.map((vb: any) => vb.buildings) || []
      })) || [];
      
      setVendors(transformedData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(vendors.map(v => v.category))];

  // Handle vendor actions
  const handleAddVendor = () => {
    setSelectedVendor(null);
    setIsAddModalOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm(t('confirmDeleteVendor'))) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) throw error;
      
      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert(t('errorDeletingVendor'));
    }
  };

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: !vendor.is_active })
        .eq('id', vendor.id);

      if (error) throw error;
      
      setVendors(vendors.map(v => 
        v.id === vendor.id ? { ...v, is_active: !v.is_active } : v
      ));
    } catch (error) {
      console.error('Error updating vendor status:', error);
      alert(t('errorUpdatingVendor'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vendors')}</h1>
          <p className="text-gray-600 mt-1">{t('manageVendorsAndServiceProviders')}</p>
        </div>
        <button
          onClick={handleAddVendor}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>{t('addVendor')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">{t('totalVendors')}</p>
          <p className="text-3xl font-bold text-gray-900">{vendors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">{t('activeVendors')}</p>
          <p className="text-3xl font-bold text-green-600">
            {vendors.filter(v => v.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">{t('categories')}</p>
          <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">{t('inactiveVendors')}</p>
          <p className="text-3xl font-bold text-gray-500">
            {vendors.filter(v => !v.is_active).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('searchVendors')}
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchVendors')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('category')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('vendorsList')} ({filteredVendors.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contactPerson')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('buildings')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                      <div className="text-sm text-gray-500">{vendor.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {vendor.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.contact_person}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vendor.buildings && vendor.buildings.length > 0 ? (
                        <div className="space-y-1">
                          {vendor.buildings.slice(0, 2).map((building) => (
                            <div key={building.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block mr-1">
                              {building.name}
                            </div>
                          ))}
                          {vendor.buildings.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{vendor.buildings.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">{t('noBuildingsAssigned')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vendor.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vendor.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewVendor(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('view')}
                      </button>
                      <button
                        onClick={() => handleEditVendor(vendor)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">{t('noVendorsFound')}</p>
            <p className="text-gray-400">{t('tryAdjustingFilters')}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchVendors();
          setIsAddModalOpen(false);
        }}
      />

      <EditVendorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vendor={selectedVendor}
        onSuccess={() => {
          fetchVendors();
          setIsEditModalOpen(false);
        }}
      />

      <ViewVendorModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        vendor={selectedVendor}
      />
    </div>
  );
};

export default Vendors;
