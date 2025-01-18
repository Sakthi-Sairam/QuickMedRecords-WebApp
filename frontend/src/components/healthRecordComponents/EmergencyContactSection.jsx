import React from 'react';
import { FaPhoneAlt } from 'react-icons/fa';

const EmergencyContactSection = ({ healthRecord }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <FaPhoneAlt className="text-red-500 text-xl" />
            <h3 className="text-xl font-semibold text-gray-800">Emergency Contact</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <p className="text-lg font-semibold text-gray-900">{healthRecord?.emergency_contact?.name || 'Not specified'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-lg font-semibold text-gray-900">{healthRecord?.emergency_contact?.phone || 'Not specified'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">Relationship</label>
                <p className="text-lg font-semibold text-gray-900">{healthRecord?.emergency_contact?.relationship || 'Not specified'}</p>
            </div>
        </div>
    </div>
);

export default EmergencyContactSection;