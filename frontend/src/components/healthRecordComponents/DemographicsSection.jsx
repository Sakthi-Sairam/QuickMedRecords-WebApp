import React from 'react';
import { FaUser } from 'react-icons/fa';

const DemographicsSection = ({ healthRecord }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <FaUser className="text-blue-500 text-xl" />
            <h3 className="text-xl font-semibold text-gray-800">Demographics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">Blood Group</label>
                <p className="text-lg font-semibold text-gray-900">{healthRecord?.demographics?.blood_group || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">Marital Status</label>
                <p className="text-lg font-semibold text-gray-900">{healthRecord?.demographics?.marital_status || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-1">Occupation</label>
                <p className="text-lg font-semibold text-gray-900">{healthRecord?.demographics?.occupation || 'Not specified'}</p>
            </div>
        </div>
    </div>
);

export default DemographicsSection;