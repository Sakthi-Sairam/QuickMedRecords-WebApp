import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import DemographicsSection from '../components/healthRecordComponents/DemographicsSection';
import InsuranceSection from '../components/healthRecordComponents/InsuranceSection';
import EmergencyContactSection from '../components/healthRecordComponents/EmergencyContactSection';
import NotesSection from '../components/healthRecordComponents/NotesSection';
import SwiperSlideContent from '../components/healthRecordComponents/SwiperSlideContent';
import ShareHealthRecord from '../components/healthRecordComponents/ShareHealthRecord';

const HealthRecord = () => {
    const { token, backendUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [healthRecord, setHealthRecord] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState('overview');
    const [newAllergy, setNewAllergy] = useState('');


    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const maritalStatuses = ['Single', 'Married', 'Widowed', 'Divorced'];

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

const handleAddAllergy = () => {
    if (newAllergy.trim()) {
        setFormData(prev => ({
            ...prev,
            allergies: [...prev.allergies, newAllergy.trim()]
        }));
        setNewAllergy('');
    }
};

const handleRemoveAllergy = (indexToRemove) => {
    setFormData(prev => ({
        ...prev,
        allergies: prev.allergies.filter((_, index) => index !== indexToRemove)
    }));
};

    const downloadPDF = async (visit) => {
        try {
            // Force mobile view for better PDF output
            const slideElement = document.querySelector('.swiper-slide-active');
            if (!slideElement) return;
    
            const visitContent = slideElement.querySelector('.bg-white');
            if (!visitContent) return;
    
            // Temporarily modify styles for better capture
            const originalWidth = visitContent.style.width;
            visitContent.style.width = '757px'; // mobile width
            
            // Create canvas from the element
            const canvas = await html2canvas(visitContent, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                windowWidth: 375, // Force mobile viewport width
            });
    
            // Reset styles
            visitContent.style.width = originalWidth;
    
            // Convert to PDF
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
    
            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            
            const visitDate = new Date(visit.created_at).toLocaleDateString();
            pdf.save(`medical_visit_${visitDate.replace(/\//g, '-')}.pdf`);
    
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading your health record...</p>
                </div>
            </div>
        );
    }

    const renderViewMode = () => (<>
        <div className="max-w-7xl mx-auto">
            {/* Header Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">Total Visits</h3>
                    <p className="text-3xl font-bold mt-2">{healthRecord?.doctor_visits?.length || 0}</p>
                    <p className="text-sm mt-2 opacity-75">Lifetime medical consultations</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">Active Prescriptions</h3>
                    <p className="text-3xl font-bold mt-2">
                        {healthRecord?.doctor_visits?.reduce((acc, visit) => acc + (visit.prescriptions?.length || 0), 0) || 0}
                    </p>
                    <p className="text-sm mt-2 opacity-75">Current medications</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">Medical Reports</h3>
                    <p className="text-3xl font-bold mt-2">
                        {healthRecord?.doctor_visits?.reduce((acc, visit) => acc + (visit.reports?.length || 0), 0) || 0}
                    </p>
                    <p className="text-sm mt-2 opacity-75">Total test reports</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">Allergies</h3>
                    <p className="text-3xl font-bold mt-2">{healthRecord?.allergies?.length || 0}</p>
                    <p className="text-sm mt-2 opacity-75">Known allergies</p>
                </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="mb-8 border-b border-gray-200">
                <nav className="flex space-x-8">
                    {['overview', 'medical records', 'reports','share'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveMainTab(tab)}
                            className={`py-4 px-6 font-medium text-sm capitalize border-b-2 transition-colors ${
                                activeMainTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeMainTab === 'overview' && (
                <div className="space-y-8">
                    {/* Personal Info and Insurance Section - Full Width */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Personal Info Card */}
                        <div className="bg-white rounded-xl shadow-xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                                <button
                                    onClick={() => setIsEdit(true)}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    Edit
                                </button>
                            </div>
                            <DemographicsSection healthRecord={healthRecord} />
                        </div>

                        {/* Insurance Card */}
                        <div className="bg-white rounded-xl shadow-xl p-8">
                            <InsuranceSection healthRecord={healthRecord} />
                        </div>
                    </div>

                    {/* Medical Summary Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Emergency Contact */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-xl shadow-xl p-8">
                                <EmergencyContactSection healthRecord={healthRecord} />
                            </div>
                        </div>

                        {/* Right Column - Medical Summary */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical Summary</h2>
                                <div className="space-y-6">
                                    <NotesSection healthRecord={healthRecord} />
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Known Allergies</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {healthRecord?.allergies?.map((allergy, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                                                >
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Visits Preview */}
                            <div className="bg-white rounded-xl shadow-xl p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Recent Visits</h2>
                                    <button
                                        onClick={() => setActiveMainTab('medical records')}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        View All Records
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {healthRecord?.doctor_visits?.slice(0, 3).map((visit, index) => (
                                        <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            {/* Preview of visit details */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Visit with Dr. {visit.doctor_id.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{new Date(visit.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    {visit.doctor_id.speciality}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeMainTab === 'medical records' && (
                <div className="bg-white rounded-xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Medical Visit Records</h2>
                    <div className="relative"> {/* Removed fixed height */}
                        <Swiper
                            spaceBetween={50}
                            effect="coverflow"
                            pagination={{ clickable: true }}
                            modules={[Pagination, EffectCoverflow]}
                            className="medical-records-swiper"
                            coverflowEffect={{
                                rotate: 50,
                                stretch: 0,
                                depth: 100,
                                modifier: 1,
                                slideShadows: true,
                            }}
                        >
                            {healthRecord?.doctor_visits?.map((visit, index) => {
                                const visitDate = new Date(Date.parse(visit.created_at));
                                const formattedDate = isNaN(visitDate) ? 'Invalid Date' : visitDate.toLocaleDateString();
                                return (
                                    <SwiperSlide key={index} className="swiper-slide-container py-8"> {/* Added padding */}
                                        <div className="flex items-center justify-center"> {/* Removed scroll container */}
                                            <SwiperSlideContent 
                                                visit={visit} 
                                                downloadPDF={() => downloadPDF(visit)} 
                                                index={index} 
                                                formattedDate={formattedDate}
                                            />
                                        </div>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                </div>
            )}

            {activeMainTab === 'reports' && (
                <div className="bg-white rounded-xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8">Medical Reports</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {healthRecord?.doctor_visits?.flatMap(visit =>
                            visit.reports.map((report, index) => (
                                <div key={`${visit._id}-${index}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{report.title}</h3>
                                    <p className="text-gray-500 mb-4">{report.remarks}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            {new Date(report.uploaded_at).toLocaleDateString()}
                                        </span>
                                        <a
                                            href={report.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            View Report
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeMainTab === 'share' && (
                <div className="bg-white rounded-xl shadow-xl p-6">
                    <ShareHealthRecord backendUrl={backendUrl} token={token} />
                </div>
            )}
        </div>
    </>);

    const renderEditMode = () => (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-lg">
            {/* Demographics Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                        <select
                            value={formData.demographics.blood_group}
                            onChange={(e) => handleNestedChange(e, 'demographics', 'blood_group')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Blood Group</option>
                            {bloodGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                        <select
                            value={formData.demographics.marital_status}
                            onChange={(e) => handleNestedChange(e, 'demographics', 'marital_status')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Status</option>
                            {maritalStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                        <input
                            type="text"
                            value={formData.demographics.occupation}
                            onChange={(e) => handleNestedChange(e, 'demographics', 'occupation')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter occupation"
                        />
                    </div>
                </div>
            </div>

            {/* Insurance Details Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Insurance Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                        <input
                            type="text"
                            value={formData.insurance_details.provider}
                            onChange={(e) => handleNestedChange(e, 'insurance_details', 'provider')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter provider"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                        <input
                            type="text"
                            value={formData.insurance_details.policy_number}
                            onChange={(e) => handleNestedChange(e, 'insurance_details', 'policy_number')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter policy number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                        <input
                            type="date"
                            value={formData.insurance_details.valid_until}
                            onChange={(e) => handleNestedChange(e, 'insurance_details', 'valid_until')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.emergency_contact.name}
                            onChange={(e) => handleNestedChange(e, 'emergency_contact', 'name')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={formData.emergency_contact.phone}
                            onChange={(e) => handleNestedChange(e, 'emergency_contact', 'phone')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter phone number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                        <input
                            type="text"
                            value={formData.emergency_contact.relationship}
                            onChange={(e) => handleNestedChange(e, 'emergency_contact', 'relationship')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter relationship"
                        />
                    </div>
                </div>
            </div>
            {/* Allergies Section */}
<div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Allergies</h3>
    <div className="space-y-4">
        <div className="flex gap-4">
            <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter allergy"
            />
            <button
                type="button"
                onClick={handleAddAllergy}
                className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
                Add Allergy
            </button>
        </div>
        <div className="flex flex-wrap gap-3">
            {formData.allergies.map((allergy, index) => (
                <span
                    key={index}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-2"
                >
                    {allergy}
                    <button
                        type="button"
                        onClick={() => handleRemoveAllergy(index)}
                        className="hover:text-red-900"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </span>
            ))}
        </div>
    </div>
</div>

            <div className="flex gap-4 justify-end pt-6">
                <button
                    type="button"
                    onClick={() => setIsEdit(false)}
                    className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    {loading ? 'Saving...' : (healthRecord ? 'Update Record' : 'Create Record')}
                </button>
            </div>
        </form>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Health Record Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage and view your complete medical history</p>
            </div>
            {isEdit || !healthRecord ? renderEditMode() : renderViewMode()}
        </div>
    );
};

{/* Add custom styles */ }
<style jsx>{`
    .medical-records-swiper {
        padding: 2rem 0 4rem 0;
    }
    
    :global(.swiper-slide) {
        height: auto !important;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :global(.swiper-slide-container) {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .swiper-pagination {
        bottom: 0 !important;
    }

    @media print {
        .medical-records-swiper {
            padding: 0;
        }
        
        button {
            display: none;
        }
    }
`}</style>

export default HealthRecord;