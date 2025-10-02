import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
}

interface ViewVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

const ViewVendorModal: React.FC<ViewVendorModalProps> = ({ isOpen, onClose, vendor }) => {
  const { t } = useTranslation();

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('vendorDetails')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Vendor Header */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{vendor.name}</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {vendor.category}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    vendor.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {vendor.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
              </div>
            </div>
            {vendor.description && (
              <p className="mt-4 text-gray-600">{vendor.description}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('contactInformation')}</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {vendor.contact_person.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{vendor.contact_person}</p>
                    <p className="text-sm text-gray-500">{t('contactPerson')}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{vendor.email}</p>
                    <p className="text-sm text-gray-500">{t('email')}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{vendor.phone}</p>
                    <p className="text-sm text-gray-500">{t('phone')}</p>
                  </div>
                </div>

                {vendor.address && (
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{vendor.address}</p>
                      <p className="text-sm text-gray-500">{t('address')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('additionalInformation')}</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('vendorId')}</p>
                  <p className="text-sm text-gray-900 font-mono">{vendor.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('created')}</p>
                  <p className="text-sm text-gray-900">
                    {new Date(vendor.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('lastUpdated')}</p>
                  <p className="text-sm text-gray-900">
                    {new Date(vendor.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVendorModal;

