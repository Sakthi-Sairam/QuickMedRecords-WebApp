import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const HealthRecord = () => {
    const { token, backendUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [healthRecord, setHealthRecord] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        demographics: {
            blood_group: '',
            marital_status: '',
            occupation: ''
        },
        allergies: [],
        insurance_details: {
            provider: '',
            policy_number: '',
            valid_until: ''
        },
        emergency_contact: {
            name: '',
            phone: '',
            relationship: ''
        }
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchHealthRecord = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/health-record/get-record`, {
                headers: { token }
            });

            if (response.data.success) {
                const record = response.data.healthRecord;
                setHealthRecord(record);
                if (record) {
                    // Transform record data to match form structure
                    setFormData({
                        demographics: {
                            blood_group: record.demographics?.blood_group || '',
                            marital_status: record.demographics?.marital_status || '',
                            occupation: record.demographics?.occupation || ''
                        },
                        allergies: Array.isArray(record.allergies) ? record.allergies : [],
                        insurance_details: {
                            provider: record.insurance_details?.provider || '',
                            policy_number: record.insurance_details?.policy_number || '',
                            valid_until: record.insurance_details?.valid_until || ''
                        },
                        emergency_contact: {
                            name: record.emergency_contact?.name || '',
                            phone: record.emergency_contact?.phone || '',
                            relationship: record.emergency_contact?.relationship || ''
                        }
                    });
                }
            }
        } catch (error) {
            toast.error('Failed to fetch health record');
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthRecord();
    }, []);

    const handleNestedChange = (e, section, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const endpoint = healthRecord 
                ? `${backendUrl}/api/health-record/update`
                : `${backendUrl}/api/health-record/create`;
            
            const response = await axios({
                method: healthRecord ? 'put' : 'post',
                url: endpoint,
                data: formData,
                headers: { token }
            });

            if (response.data.success) {
                toast.success(healthRecord ? 'Record updated successfully' : 'Record created successfully');
                await fetchHealthRecord();
                setIsEdit(false);
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Failed to save health record');
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading health record...</div>;
    }

    const renderViewMode = () => (
        <div className="space-y-6">
            <div>
                <h3>Demographics</h3>
                <div>
                    <strong>Blood Group: </strong>
                    {healthRecord?.demographics?.blood_group || 'Not specified'}
                </div>
                <div>
                    <strong>Marital Status: </strong>
                    {healthRecord?.demographics?.marital_status || 'Not specified'}
                </div>
                <div>
                    <strong>Occupation: </strong>
                    {healthRecord?.demographics?.occupation || 'Not specified'}
                </div>
            </div>

            <div>
                <h3>Allergies</h3>
                {Array.isArray(healthRecord?.allergies) && healthRecord.allergies.length > 0 ? (
                    <ul>
                        {healthRecord.allergies.map((allergy, index) => (
                            <li key={index}>{allergy}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No allergies recorded</p>
                )}
            </div>

            <div>
                <h3>Insurance Details</h3>
                <div>
                    <strong>Provider: </strong>
                    {healthRecord?.insurance_details?.provider || 'Not specified'}
                </div>
                <div>
                    <strong>Policy Number: </strong>
                    {healthRecord?.insurance_details?.policy_number || 'Not specified'}
                </div>
                <div>
                    <strong>Valid Until: </strong>
                    {healthRecord?.insurance_details?.valid_until || 'Not specified'}
                </div>
            </div>

            <div>
                <h3>Emergency Contact</h3>
                <div>
                    <strong>Name: </strong>
                    {healthRecord?.emergency_contact?.name || 'Not specified'}
                </div>
                <div>
                    <strong>Phone: </strong>
                    {healthRecord?.emergency_contact?.phone || 'Not specified'}
                </div>
                <div>
                    <strong>Relationship: </strong>
                    {healthRecord?.emergency_contact?.relationship || 'Not specified'}
                </div>
            </div>

            {healthRecord?.doctor_visits?.length > 0 && (
                <div>
                    <h3>Doctor Visits</h3>
                    {healthRecord.doctor_visits.map((visit, index) => {
                        const visitDate = new Date(Date.parse(visit.created_at));
                        const formattedDate = isNaN(visitDate) ? 'Invalid Date' : visitDate.toLocaleDateString();
                        return (
                            <div key={index} className="border p-4 my-2">
                                <div><strong>Date: </strong>{formattedDate}</div>
                                <div><strong>Diagnosis: </strong>{visit.diagnosis || 'Not specified'}</div>
                                <div>
                                    <strong>Prescriptions: </strong>
                                    {Array.isArray(visit.prescriptions) ? (
                                        <ul>
                                            {visit.prescriptions.map((prescription, idx) => (
                                                <li key={idx}>
                                                    {prescription.medication} - {prescription.dosage}
                                                    {prescription.frequency && ` - ${prescription.frequency}`}
                                                    {prescription.duration && ` - ${prescription.duration}`}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No prescriptions'
                                    )}
                                </div>
                                <div><strong>Remarks: </strong>{visit.remarks || 'None'}</div>
                            </div>
                        );
                    })}
                </div>
            )}

            <button 
                onClick={() => setIsEdit(true)}
                className='flex items-center gap-2 bg-primary px-8 py-3 rounded-full text-white text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'
            >
                Edit Record
            </button>
        </div>
    );

    const renderEditMode = () => (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div>
                <h3 className="text-lg font-semibold mb-4">Demographics</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Blood Group:</label>
                    <input
                        type="text"
                        value={formData.demographics.blood_group}
                        onChange={(e) => handleNestedChange(e, 'demographics', 'blood_group')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Marital Status:</label>
                    <input
                        type="text"
                        value={formData.demographics.marital_status}
                        onChange={(e) => handleNestedChange(e, 'demographics', 'marital_status')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Occupation:</label>
                    <input
                        type="text"
                        value={formData.demographics.occupation}
                        onChange={(e) => handleNestedChange(e, 'demographics', 'occupation')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Insurance Details</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Provider:</label>
                    <input
                        type="text"
                        value={formData.insurance_details.provider}
                        onChange={(e) => handleNestedChange(e, 'insurance_details', 'provider')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Policy Number:</label>
                    <input
                        type="text"
                        value={formData.insurance_details.policy_number}
                        onChange={(e) => handleNestedChange(e, 'insurance_details', 'policy_number')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Valid Until:</label>
                    <input
                        type="date"
                        value={formData.insurance_details.valid_until}
                        onChange={(e) => handleNestedChange(e, 'insurance_details', 'valid_until')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Name:</label>
                    <input
                        type="text"
                        value={formData.emergency_contact.name}
                        onChange={(e) => handleNestedChange(e, 'emergency_contact', 'name')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Phone:</label>
                    <input
                        type="tel"
                        value={formData.emergency_contact.phone}
                        onChange={(e) => handleNestedChange(e, 'emergency_contact', 'phone')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Relationship:</label>
                    <input
                        type="text"
                        value={formData.emergency_contact.relationship}
                        onChange={(e) => handleNestedChange(e, 'emergency_contact', 'relationship')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    type="submit"
                    className='flex items-center gap-2 bg-indigo-600 px-8 py-3 rounded-full text-white text-sm m-auto md:m-0 hover:bg-indigo-700 transition-all duration-300'
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (healthRecord ? 'Update Record' : 'Create Record')}
                </button>
                <button 
                    type="button"
                    onClick={() => setIsEdit(false)}
                    className='flex items-center gap-2 bg-gray-500 px-8 py-3 rounded-full text-white text-sm m-auto md:m-0 hover:bg-gray-600 transition-all duration-300'
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6">Health Record</h2>
            {isEdit || !healthRecord ? renderEditMode() : renderViewMode()}
        </div>
    );
};

export default HealthRecord;