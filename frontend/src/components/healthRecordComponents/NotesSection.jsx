import React from 'react';

const NotesSection = ({ healthRecord }) => (
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
);

export default NotesSection;