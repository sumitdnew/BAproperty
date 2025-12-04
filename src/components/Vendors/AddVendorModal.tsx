import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useBuildingContext } from '../../context/BuildingContext';
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

  const { buildings: contextBuildings } = useBuildingContext()

  const fetchBuildings = async () => {
    try {
      // Use buildings from context (respects user access permissions)
      setBuildings(contextBuildings || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  // Fetch buildings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBuildings();
    }
  }, [isOpen, contextBuildings]);

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
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="text-xl font-bold text-gray-900">{t('addNewVendor')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="name" className="form-label form-label-required">
                {t('vendorName')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-modern"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label form-label-required">
                {t('category')}
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="select-modern"
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contact_person" className="form-label form-label-required">
                {t('contactPerson')}
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                required
                value={formData.contact_person}
                onChange={handleChange}
                className="input-modern"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-modern"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                {t('phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-modern"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                {t('address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-modern"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('description')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="input-modern"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {t('assignedBuildings')}
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
              {buildings.map((building) => (
                <div key={building.id} className="flex items-center py-2">
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
                  <label htmlFor={`building-${building.id}`} className="ml-3 block text-sm text-gray-900 font-medium">
                    {building.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="form-hint">{t('selectBuildingsForVendor')}</p>
          </div>

          <div className="divider"></div>

          <div className="actions-row">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
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
