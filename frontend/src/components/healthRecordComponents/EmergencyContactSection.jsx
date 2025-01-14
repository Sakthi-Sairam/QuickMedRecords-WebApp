import React from 'react';

const EmergencyContactSection = ({ healthRecord }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{healthRecord?.emergency_contact?.name || 'Not specified'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{healthRecord?.emergency_contact?.phone || 'Not specified'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <p className="text-gray-900">{healthRecord?.emergency_contact?.relationship || 'Not specified'}</p>
            </div>
        </div>
    </div>
);

export default EmergencyContactSection;