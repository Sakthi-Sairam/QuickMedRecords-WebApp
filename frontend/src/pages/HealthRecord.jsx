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

const HealthRecord = () => {
    const { token, backendUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [healthRecord, setHealthRecord] = useState(null);
    const [isEdit, setIsEdit] = useState(false);;

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
        return <div>Loading health record...</div>;
    }

    const renderViewMode = () => (<>
        <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-2xl">
            {/* Demographics Section */}
            <DemographicsSection healthRecord={healthRecord} />
            {/* Insurance Details Section */}
            <InsuranceSection healthRecord={healthRecord} />

            {/* Emergency Contact Section */}
            <EmergencyContactSection healthRecord={healthRecord} />

            {/* Notes Section */}
            <NotesSection healthRecord={healthRecord} />

            {/* <hr className="my-8 border-gray-300" /> */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Allergies</h3>
                {Array.isArray(healthRecord?.allergies) && healthRecord.allergies.length > 0 ? (
                    <ul className="list-inside flex flex-row gap-5">
                        {healthRecord.allergies.map((allergy, index) => (
                            <li key={index}>
                                <strong>{allergy}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No notes recorded</p>
                )}
            </div>
            <button
                onClick={() => setIsEdit(true)}
                className='flex items-center gap-2 bg-primary px-8 py-3 rounded-full text-white text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300 mb-6'
            >
                Edit Record
            </button>
        </div>

        {/* Doctor Visits Section */}
        <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Medical Visit Records</h2>
            <Swiper
                spaceBetween={50}
                effect="coverflow"
                pagination={{ clickable: true }}
                modules={[Pagination, EffectCoverflow]}
                className="doctor-visits-swiper"
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
                        <SwiperSlide key={index}>
                            <SwiperSlideContent visit={visit} downloadPDF={() => downloadPDF(visit)} index={index} formattedDate={formattedDate} />
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    </>
    );

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
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Health Record Dashboard</h2>
            {isEdit || !healthRecord ? renderEditMode() : renderViewMode()}
        </div>
    );
};

{/* Add custom styles */ }
<style jsx>{`
    .doctor-visits-swiper {
        padding: 2rem 0 4rem 0;
    }
    
    .swiper-slide {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 297mm;
    }

    .swiper-pagination {
        bottom: 0 !important;
    }

    @media print {
        .doctor-visits-swiper {
            padding: 0;
        }
        
        button {
            display: none;
        }
    }
`}</style>

export default HealthRecord;