import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [visitData, setVisitData] = useState({
    diagnosis: '',
    prescriptions: [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    remarks: '',
    reports: [{ title: '', url: '', remarks: '' }]
  });

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  const handleOpenModal = (appointment) => {
    if (!appointment.isCompleted && !appointment.cancelled) {
      setCurrentAppointment(appointment);
      setIsModalOpen(true);
    }
  };

  const addPrescription = () => {
    setVisitData({
      ...visitData,
      prescriptions: [...visitData.prescriptions, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const addReport = () => {
    setVisitData({
      ...visitData,
      reports: [...visitData.reports, { title: '', url: '', remarks: '' }]
    });
  };

  const removePrescription = (index) => {
    const newPrescriptions = visitData.prescriptions.filter((_, i) => i !== index);
    setVisitData({ ...visitData, prescriptions: newPrescriptions });
  };

  const removeReport = (index) => {
    const newReports = visitData.reports.filter((_, i) => i !== index);
    setVisitData({ ...visitData, reports: newReports });
  };

  const updatePrescription = (index, field, value) => {
    const newPrescriptions = [...visitData.prescriptions];
    newPrescriptions[index][field] = value;
    setVisitData({ ...visitData, prescriptions: newPrescriptions });
  };

  const updateReport = (index, field, value) => {
    const newReports = [...visitData.reports];
    newReports[index][field] = value;
    setVisitData({ ...visitData, reports: newReports });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:4000/api/health-record/add-visit', {
        userId: currentAppointment.userId,
        appointmentId: currentAppointment._id,
        ...visitData
      }, {
        headers: { dToken }
      });
      setIsModalOpen(false);
      // alert('Health record visit added successfully.');
      toast.success("Health record visit added successfully.");
      // Reset form
      setVisitData({
        diagnosis: '',
        prescriptions: [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        remarks: '',
        reports: [{ title: '', url: '', remarks: '' }]
      });
      setCurrentAppointment(null);
      getAppointments(); // Refetch updated appointments
    } catch (err) {
      console.error('Error adding health record visit:', err);
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded-lg shadow-sm text-sm max-h-[80vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b bg-gray-50">
          <p className="font-medium">No.</p>
          <p className="font-medium">Patient</p>
          <p className="font-medium">Payment</p>
          <p className="font-medium">Age</p>
          <p className="font-medium">Date & Time</p>
          <p className="font-medium">Fees</p>
          <p className="font-medium">Action</p>
        </div>

        {appointments.map((item, index) => (
          <div className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50" key={index}>
            <p>{index + 1}</p>
            <div 
              className={`flex items-center gap-2 ${!item.isCompleted && !item.cancelled ? 'cursor-pointer hover:text-blue-600' : ''}`}
              onClick={() => handleOpenModal(item)}
            >
              <img src={item.userData.image} className="w-8 h-8 rounded-full object-cover" alt="" />
              <p className="font-medium text-gray-700">{item.userData.name}</p>
            </div>
            <div>
              <p className={`text-xs inline px-2 py-1 rounded-full ${item.payment ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.payment ? 'Online' : 'CASH'}
              </p>
            </div>
            <p>{calculateAge(item.userData.dob)}</p>
            <p className="text-gray-700">{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p className="font-medium text-gray-700">{currency}{item.amount}</p>
            {item.cancelled ? (
              <p className="text-red-500 font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 font-medium">Completed</p>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => cancelAppointment(item._id)} className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200">
                  <img className="w-5 h-5" src={assets.cancel_icon} alt="Cancel" />
                </button>
                <button onClick={() => completeAppointment(item._id)} className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200">
                  <img className="w-5 h-5" src={assets.tick_icon} alt="Complete" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && currentAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add Health Record Visit</h2>
                <button onClick={() => {
                  setIsModalOpen(false);
                  setCurrentAppointment(null);
                }} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>

              <div className="space-y-6">
                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={visitData.diagnosis}
                    onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter diagnosis"
                  />
                </div>

                {/* Prescriptions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Prescriptions</label>
                    <button
                      onClick={addPrescription}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      + Add Prescription
                    </button>
                  </div>
                  
                  {visitData.prescriptions.map((prescription, index) => (
                    <div key={index} className="p-4 border rounded-lg mb-4 relative">
                      <button
                        onClick={() => removePrescription(index)}
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                      <div className="grid gap-4">
                        <input
                          placeholder="Medication name"
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Dosage"
                            value={prescription.dosage}
                            onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                          <input
                            placeholder="Frequency"
                            value={prescription.frequency}
                            onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            placeholder="Duration"
                            value={prescription.duration}
                            onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                          <input
                            placeholder="Instructions"
                            value={prescription.instructions}
                            onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={visitData.remarks}
                    onChange={(e) => setVisitData({ ...visitData, remarks: e.target.value })}
                    className="w-full p-2 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any additional remarks"
                  />
                </div>

                {/* Reports */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Reports</label>
                    <button
                      onClick={addReport}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      + Add Report
                    </button>
                  </div>

                  {visitData.reports.map((report, index) => (
                    <div key={index} className="p-4 border rounded-lg mb-4 relative">
                      <button
                        onClick={() => removeReport(index)}
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                      <div className="grid gap-4">
                        <input
                          placeholder="Report title"
                          value={report.title}
                          onChange={(e) => updateReport(index, 'title', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                        <input
                          placeholder="Report URL"
                          value={report.url}
                          onChange={(e) => updateReport(index, 'url', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                        <input
                          placeholder="Report remarks"
                          value={report.remarks}
                          onChange={(e) => updateReport(index, 'remarks', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentAppointment(null);
                    }}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;