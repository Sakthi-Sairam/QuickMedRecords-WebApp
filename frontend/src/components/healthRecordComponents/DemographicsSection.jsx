import React from 'react';

const DemographicsSection = ({ healthRecord }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <p className="text-gray-900">{healthRecord?.demographics?.blood_group || 'Not specified'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <p className="text-gray-900">{healthRecord?.demographics?.marital_status || 'Not specified'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <p className="text-gray-900">{healthRecord?.demographics?.occupation || 'Not specified'}</p>
            </div>
        </div>
    </div>
);

export default DemographicsSection;