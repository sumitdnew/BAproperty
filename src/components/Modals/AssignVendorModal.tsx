import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  apartment: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimated_cost: string;
  created_at: string;
  tenant_name: string;
  building_name: string;
  apartment_number: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  is_active: boolean;
}

interface AssignVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest | null;
  onSuccess: () => void;
}

const AssignVendorModal: React.FC<AssignVendorModalProps> = ({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(t('errorFetchingVendors'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceRequest || !selectedVendorId) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ 
          vendor_id: selectedVendorId,
          status: 'in_progress' // Automatically set status to in_progress when vendor is assigned
        })
        .eq('id', maintenanceRequest.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning vendor:', error);
      setError(t('errorAssigningVendor'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedVendorId('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !maintenanceRequest) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('assignVendor')}
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Request Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{maintenanceRequest.title}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">{t('apartment')}:</span> {maintenanceRequest.apartment}</p>
              <p><span className="font-medium">{t('priority')}:</span> {t(maintenanceRequest.priority)}</p>
              <p><span className="font-medium">{t('status')}:</span> {t(maintenanceRequest.status)}</p>
              <p><span className="font-medium">{t('tenant')}:</span> {maintenanceRequest.tenant_name}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectVendor')} *
              </label>
              <select
                id="vendor"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
                required
              >
                <option value="">{t('selectVendor')}</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.category} ({vendor.contact_person})
                  </option>
                ))}
              </select>
            </div>

            {selectedVendorId && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h5 className="font-medium text-blue-900 mb-2">{t('vendorInformation')}</h5>
                {(() => {
                  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
                  return selectedVendor ? (
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><span className="font-medium">{t('contactPerson')}:</span> {selectedVendor.contact_person}</p>
                      <p><span className="font-medium">{t('email')}:</span> {selectedVendor.email}</p>
                      <p><span className="font-medium">{t('phone')}:</span> {selectedVendor.phone}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || !selectedVendorId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? t('assigning') : t('assignVendor')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignVendorModal;

