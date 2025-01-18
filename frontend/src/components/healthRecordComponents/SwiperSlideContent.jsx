import React from 'react';

const SwiperSlideContent = ({ visit, downloadPDF, index, formattedDate }) => (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-[210mm] mx-auto p-4 md:p-8 lg:p-12">
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
);

export default SwiperSlideContent;