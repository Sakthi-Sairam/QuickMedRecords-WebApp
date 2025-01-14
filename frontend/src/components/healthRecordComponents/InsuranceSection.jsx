import React from 'react';

const InsuranceSection = ({ healthRecord }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Insurance Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <p className="text-gray-900">{healthRecord?.insurance_details?.provider || 'Not specified'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                <p className="text-gray-900">{healthRecord?.insurance_details?.policy_number || 'Not specified'}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <p className="text-gray-900">{healthRecord?.insurance_details?.valid_until ? new Date(healthRecord.insurance_details.valid_until).toLocaleDateString() : 'Not specified'}</p>
            </div>
        </div>
    </div>
);

export default InsuranceSection;