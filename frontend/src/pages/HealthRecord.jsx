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

const HealthRecord = () => {
    const { token, backendUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [healthRecord, setHealthRecord] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const cardRef = useRef(null);

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

    const downloadPDF = (visit) => {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();

        // Add header
        pdf.setFontSize(20);
        pdf.text('Medical Visit Record', pageWidth / 2, 20, { align: 'center' });

        // Add visit details
        pdf.setFontSize(12);
        const visitDate = new Date(visit.created_at).toLocaleDateString();
        pdf.text(`Date: ${visitDate}`, 20, 40);
        pdf.text(`Doctor: ${visit.doctor_id.name} (${visit.doctor_id.speciality})`, 20, 50);
        pdf.text(`Diagnosis: ${visit.diagnosis || 'Not specified'}`, 20, 60);

        // Add prescriptions table
        if (Array.isArray(visit.prescriptions) && visit.prescriptions.length > 0) {
            pdf.text('Prescriptions:', 20, 80);
            const prescriptionData = visit.prescriptions.map(p => [
                p.medication,
                p.dosage,
                p.frequency,
                p.duration,
                p.instructions
            ]);

            pdf.autoTable({
                startY: 90,
                head: [['Medication', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
                body: prescriptionData,
                margin: { top: 90 },
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 'auto' }
                }
            });
        }

        // Add remarks
        const finalY = pdf.previousAutoTable ? pdf.previousAutoTable.finalY + 20 : 150;
        pdf.text('Remarks:', 20, finalY);
        pdf.setFontSize(10);
        const remarksSplit = pdf.splitTextToSize(visit.remarks || 'None', pageWidth - 40);
        pdf.text(remarksSplit, 20, finalY + 10);

        // Add reports if any
        if (Array.isArray(visit.reports) && visit.reports.length > 0) {
            const reportsY = finalY + remarksSplit.length * 7 + 20;
            pdf.setFontSize(12);
            pdf.text('Reports:', 20, reportsY);
            visit.reports.forEach((report, index) => {
                pdf.setFontSize(10);
                pdf.text(`${index + 1}. ${report.title} - ${report.remarks}`, 30, reportsY + (index + 1) * 10);
            });
        }

        pdf.save(`medical_visit_${visitDate}.pdf`);
    };

    if (loading) {
        return <div>Loading health record...</div>;
    }

    const renderViewMode = () => (<>
        <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-2xl">
            {/* Demographics Section */}
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

            {/* Insurance Details Section */}
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

            {/* Emergency Contact Section */}
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

            {/* Notes Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Notes</h3>
                {Array.isArray(healthRecord?.notes) && healthRecord.notes.length > 0 ? (
                    <ul>
                        {healthRecord.notes.map((note, index) => (
                            <li key={index}>
                                <strong>{note.created_by.name} ({note.created_by.speciality}): </strong>
                                {note.note}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No notes recorded</p>
                )}
            </div>

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
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-[210mm] mx-auto p-4 md:p-8 lg:p-12">
                                {/* Header Section */}
                                <div className="border-b-2 border-gray-200 pb-4 md:pb-6 mb-4 md:mb-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 md:mb-6">
                                        <div>
                                            <h3 className="text-xl md:text-3xl font-bold text-gray-900">Electronic Health Record</h3>
                                            <p className="text-gray-500 mt-1 md:mt-2">Record #{String(index + 1).padStart(4, '0')}</p>
                                        </div>
                                        <div className="md:text-right">
                                            <p className="text-base md:text-lg font-semibold text-gray-900">{formattedDate}</p>
                                            <p className="text-gray-500 mt-1">Visit Date</p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                                            <p className="text-sm text-gray-500">Attending Physician</p>
                                            <p className="text-base md:text-lg font-semibold text-gray-900">{visit.doctor_id.name}</p>
                                            <p className="text-blue-600 text-sm md:text-base">{visit.doctor_id.speciality}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Diagnosis Section */}
                                <div className="mb-4 md:mb-8">
                                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">Diagnosis</h4>
                                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                        <p className="text-sm md:text-base text-gray-700">{visit.diagnosis || 'No diagnosis specified'}</p>
                                    </div>
                                </div>

                                {/* Prescriptions Section */}
                                <div className="mb-4 md:mb-8">
                                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">Prescriptions</h4>
                                    {Array.isArray(visit.prescriptions) && visit.prescriptions.length > 0 ? (
                                        <div>
                                            {/* Desktop Table View - Hidden on mobile */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <div className="inline-block min-w-full align-middle">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead>
                                                            <tr className="bg-gray-50">
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {visit.prescriptions.map((prescription, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prescription.medication}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.dosage}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.frequency}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.duration}</td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500">{prescription.instructions}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Mobile Card View - Shown only on mobile */}
                                            <div className="md:hidden space-y-4">
                                                {visit.prescriptions.map((prescription, idx) => (
                                                    <div key={idx} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500 block">Medication</label>
                                                                <p className="text-sm font-medium text-gray-900">{prescription.medication}</p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 block">Dosage</label>
                                                                    <p className="text-sm text-gray-900">{prescription.dosage}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 block">Frequency</label>
                                                                    <p className="text-sm text-gray-900">{prescription.frequency}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500 block">Duration</label>
                                                                <p className="text-sm text-gray-900">{prescription.duration}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-medium text-gray-500 block">Instructions</label>
                                                                <p className="text-sm text-gray-900">{prescription.instructions}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm md:text-base">No prescriptions recorded</p>
                                    )}
                                </div>

                                {/* Remarks Section */}
                                <div className="mb-4 md:mb-8">
                                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">Remarks</h4>
                                    <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                                        <p className="text-sm md:text-base text-gray-700">{visit.remarks || 'No remarks recorded'}</p>
                                    </div>
                                </div>

                                {/* Reports Section */}
                                <div className="mb-4 md:mb-8">
                                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">Reports</h4>
                                    {Array.isArray(visit.reports) && visit.reports.length > 0 ? (
                                        <div className="space-y-2 md:space-y-3">
                                            {visit.reports.map((report, idx) => (
                                                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center bg-gray-50 rounded-lg p-3 md:p-4 gap-3">
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-sm md:text-base text-gray-900">{report.title}</h5>
                                                        <p className="text-xs md:text-sm text-gray-500 mt-1">{report.remarks}</p>
                                                    </div>
                                                    <a
                                                        href={report.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full md:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        View Report
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-sm md:text-base">No reports attached</p>
                                    )}
                                </div>

                                {/* Footer Section */}
                                <div className="border-t border-gray-200 pt-4 md:pt-8 mt-4 md:mt-8">
                                    <button
                                        onClick={() => downloadPDF(visit)}
                                        className="w-full md:w-auto inline-flex justify-center items-center px-4 md:px-6 py-2 md:py-3 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Download Record as PDF
                                    </button>
                                </div>
                            </div>
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