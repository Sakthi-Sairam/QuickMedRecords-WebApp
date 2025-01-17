import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';

const PatientRecord = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthRecord, setHealthRecord] = useState(null);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { dToken } = useContext(DoctorContext);

  useEffect(() => {
    const fetchHealthRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/health-record/session/${token}`, { headers: { dToken } });
        if (response.data.success) {
          setHealthRecord(response.data.healthRecord);
          setSession(response.data.session);
        } else {
          setError('Failed to fetch health record');
          toast.error('Failed to fetch health record');
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecord();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderPatientHeader = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{session?.userId?.name}</h1>
          <div className="mt-2 space-x-4">
            <span className="text-gray-600">Email: {session?.userId?.email}</span>
            <span className="text-gray-600">Gender: {session?.userId?.gender}</span>
            <span className="text-gray-600">DOB: {session?.userId?.dob}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Record Created</p>
          <p className="font-medium">{formatDate(healthRecord?.created_at)}</p>
        </div>
      </div>
    </div>
  );

  const renderStatistics = () => {
    const totalVisits = healthRecord?.doctor_visits?.length || 0;
    const totalPrescriptions = healthRecord?.doctor_visits?.reduce(
      (acc, visit) => acc + (visit.prescriptions?.length || 0),
      0
    );
    const totalReports = healthRecord?.doctor_visits?.reduce(
      (acc, visit) => acc + (visit.reports?.length || 0),
      0
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900">Total Visits</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalVisits}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900">Prescriptions</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalPrescriptions}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900">Medical Reports</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{totalReports}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading patient record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {renderPatientHeader()}
      {renderStatistics()}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'visits', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 font-medium text-sm capitalize border-b-2 ${
                activeTab === tab
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
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demographics Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <p className="text-gray-900 mt-1">{healthRecord.demographics.blood_group}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Marital Status</label>
                  <p className="text-gray-900 mt-1">{healthRecord.demographics.marital_status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-gray-900 mt-1">{healthRecord.demographics.occupation}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900 mt-1">{healthRecord.emergency_contact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 mt-1">{healthRecord.emergency_contact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Relationship</label>
                  <p className="text-gray-900 mt-1">{healthRecord.emergency_contact.relationship}</p>
                </div>
              </div>
            </div>

            {/* Insurance Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Provider</label>
                  <p className="text-gray-900 mt-1">{healthRecord.insurance_details.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Policy Number</label>
                  <p className="text-gray-900 mt-1">{healthRecord.insurance_details.policy_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valid Until</label>
                  <p className="text-gray-900 mt-1">{formatDate(healthRecord.insurance_details.valid_until)}</p>
                </div>
              </div>
            </div>

            {/* Allergies & Notes Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies & Notes</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Known Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {healthRecord.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Clinical Notes</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {healthRecord.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900">{note.note}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <span>{note.created_by.name}</span>
                          <span>•</span>
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="max-h-[600px] overflow-y-auto p-6">
              <div className="space-y-6">
                {healthRecord.doctor_visits.map((visit, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Visit with Dr. {visit.doctor_id.name}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(visit.created_at)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {visit.doctor_id.speciality}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Diagnosis</h4>
                        <p className="mt-1 text-gray-900">{visit.diagnosis}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Prescriptions</h4>
                        <div className="mt-2 space-y-2">
                          {visit.prescriptions.map((prescription, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{prescription.medication}</span>
                                <span className="text-sm text-gray-500">{prescription.dosage}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {prescription.frequency} - {prescription.duration}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {prescription.instructions}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Remarks</h4>
                        <p className="mt-1 text-gray-900">{visit.remarks}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthRecord.doctor_visits.flatMap(visit =>
              visit.reports.map((report, index) => (
                <div key={`${visit._id}-${index}`} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.remarks}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(report.uploaded_at)}
                    </span>
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Report
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecord;