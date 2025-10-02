import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Building {
  id: string;
  name: string;
}

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddVendorModal: React.FC<AddVendorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    is_active: true
  });

  const categories = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Cleaning',
    'Security',
    'Landscaping',
    'Painting',
    'Carpentry',
    'General Maintenance',
    'Other'
  ];

  // Fetch buildings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBuildings();
    }
  }, [isOpen]);

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert([formData])
        .select()
        .single();

      if (vendorError) throw vendorError;

      // Create vendor-building relationships if buildings are selected
      if (selectedBuildings.length > 0) {
        const vendorBuildings = selectedBuildings.map(buildingId => ({
          vendor_id: vendorData.id,
          building_id: buildingId
        }));

        const { error: relationshipError } = await supabase
          .from('vendor_buildings')
          .insert(vendorBuildings);

        if (relationshipError) throw relationshipError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating vendor:', error);
      alert(t('errorCreatingVendor'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('addNewVendor')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('vendorName')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')} *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                {t('contactPerson')} *
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                required
                value={formData.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('phone')} *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                {t('address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('assignedBuildings')}
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {buildings.map((building) => (
                <div key={building.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`building-${building.id}`}
                    checked={selectedBuildings.includes(building.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBuildings([...selectedBuildings, building.id]);
                      } else {
                        setSelectedBuildings(selectedBuildings.filter(id => id !== building.id));
                      }
                    }}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`building-${building.id}`} className="ml-2 block text-sm text-gray-900">
                    {building.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('selectBuildingsForVendor')}</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              {t('activeVendor')}
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? t('creating') : t('createVendor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;
