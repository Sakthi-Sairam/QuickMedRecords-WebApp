import React from 'react';
import { FaClipboardList } from 'react-icons/fa';

const NotesSection = ({ healthRecord }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <FaClipboardList className="text-purple-500 text-xl" />
            <h3 className="text-xl font-semibold text-gray-800">Clinical Notes</h3>
        </div>
        {Array.isArray(healthRecord?.notes) && healthRecord.notes.length > 0 ? (
            <div className="space-y-4">
                {healthRecord.notes.map((note, index) => (
                    <div key={index} className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-purple-900">
                                Dr. {note.created_by.name}
                            </span>
                            <span className="text-sm text-purple-700 px-2 py-0.5 bg-purple-100 rounded-full">
                                {note.created_by.speciality}
                            </span>
                        </div>
                        <p className="text-gray-700">{note.note}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {new Date(note.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500 italic">No notes recorded</p>
        )}
    </div>
);

export default NotesSection;