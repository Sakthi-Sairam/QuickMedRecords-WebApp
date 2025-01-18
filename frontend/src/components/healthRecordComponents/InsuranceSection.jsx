import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const InsuranceSection = ({ healthRecord }) => {
    const isExpiringSoon = () => {
        if (!healthRecord?.insurance_details?.valid_until) return false;
        const validUntil = new Date(healthRecord.insurance_details.valid_until);
        const today = new Date();
        const diffTime = validUntil - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    };

    function isExpired() {
        if (!healthRecord?.insurance_details?.valid_until) return false;
        const validUntil = new Date(healthRecord.insurance_details.valid_until);
        const today = new Date();
        return validUntil < today;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-green-500 text-xl" />
                    <h3 className="text-xl font-semibold text-gray-800">Insurance Details</h3>
                </div>
                {isExpired() ? (
                    <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Avail Insurance
                    </button>
                ) : isExpiringSoon() && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Expiring Soon
                    </span>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Provider</label>
                    <p className="text-lg font-semibold text-gray-900">{healthRecord?.insurance_details?.provider || 'Not specified'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Policy Number</label>
                    <p className="text-lg font-semibold font-mono text-gray-900">{healthRecord?.insurance_details?.policy_number || 'Not specified'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Valid Until</label>
                    <p className="text-lg font-semibold text-gray-900">
                        {healthRecord?.insurance_details?.valid_until 
                            ? new Date(healthRecord.insurance_details.valid_until).toLocaleDateString() 
                            : 'Not specified'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsuranceSection;