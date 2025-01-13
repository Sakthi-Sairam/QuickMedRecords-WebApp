import healthRecordModel from '../models/healthRecordModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

// Create new health record (first time, basic details only)
// const createHealthRecord = async (req, res) => {
//     try {
//         const { 
//             userId, 
//             blood_group,
//             marital_status,
//             occupation,
//             allergies,
//             insurance_details,
//             emergency_contact 
//         } = req.body;

//         // Check if health record already exists
//         const existingRecord = await healthRecordModel.findOne({ user_id: userId });
//         if (existingRecord) {
//             return res.json({ success: false, message: 'Health Record already exists' });
//         }

//         const healthRecordData = {
//             user_id: userId,
//             demographics: {
//                 blood_group,
//                 marital_status,
//                 occupation
//             },
//             allergies,
//             insurance_details,
//             emergency_contact
//         };

//         const newHealthRecord = new healthRecordModel(healthRecordData);
//         await newHealthRecord.save();

//         res.json({ success: true, message: 'Health Record Created', healthRecord: newHealthRecord });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };
const createHealthRecord = async (req, res) => {
    try {
        const { 
            userId,
            demographics,
            allergies,
            insurance_details,
            emergency_contact 
        } = req.body;

        // Check if health record already exists
        const existingRecord = await healthRecordModel.findOne({ user_id: userId });
        if (existingRecord) {
            return res.json({ success: false, message: 'Health Record already exists' });
        }

        const healthRecordData = {
            user_id: userId,
            demographics,
            allergies,
            insurance_details,
            emergency_contact
        };

        const newHealthRecord = new healthRecordModel(healthRecordData);
        await newHealthRecord.save();

        res.json({ success: true, message: 'Health Record Created', healthRecord: newHealthRecord });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add doctor visit (only by doctor)
const addDoctorVisit = async (req, res) => {
    try {
        const { 
            userId,
            docId,  // from authDoctor middleware
            appointmentId,
            diagnosis,
            prescriptions,
            remarks,
            reports 
        } = req.body;

        // Verify appointment
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        // Verify doctor
        const doctorData = await doctorModel.findById(docId);
        if (!doctorData) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        // Verify if the doctor is the same as in appointment
        if (appointmentData.docId !== docId) {
            return res.json({ success: false, message: 'Unauthorized to add visit record' });
        }

        const visitData = {
            appointment_id: appointmentId,
            doctor_id: docId,
            diagnosis,
            prescriptions,
            remarks,
            reports
        };

        await healthRecordModel.findOneAndUpdate(
            { user_id: userId },
            { 
                $push: { doctor_visits: visitData },
                updated_at: Date.now()
            }
        );

        // Mark appointment as completed
        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

        res.json({ success: true, message: 'Doctor Visit Record Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update basic health record details (excluding doctor visits)
// const updateHealthRecord = async (req, res) => {
//     try {
//         const { 
//             userId,
//             blood_group,
//             marital_status,
//             occupation,
//             allergies,
//             insurance_details,
//             emergency_contact 
//         } = req.body;

//         const updateData = {
//             'demographics.blood_group': blood_group,
//             'demographics.marital_status': marital_status,
//             'demographics.occupation': occupation,
//             allergies,
//             insurance_details,
//             emergency_contact,
//             updated_at: Date.now()
//         };

//         await healthRecordModel.findOneAndUpdate(
//             { user_id: userId },
//             { $set: updateData }
//         );

//         res.json({ success: true, message: 'Health Record Updated' });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };
const updateHealthRecord = async (req, res) => {
    try {
        const { 
            userId,
            demographics,
            allergies,
            insurance_details,
            emergency_contact 
        } = req.body;

        const updateData = {
            demographics,
            allergies,
            insurance_details,
            emergency_contact,
            updated_at: Date.now()
        };

        await healthRecordModel.findOneAndUpdate(
            { user_id: userId },
            { $set: updateData }
        );

        res.json({ success: true, message: 'Health Record Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add note (only by doctor)
const addNote = async (req, res) => {
    try {
        const { userId, docId, note } = req.body;

        // Verify doctor exists
        const doctorExists = await doctorModel.findById(docId);
        if (!doctorExists) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        const noteData = {
            created_by: docId,
            note,
            created_at: Date.now()
        };

        await healthRecordModel.findOneAndUpdate(
            { user_id: userId },
            { 
                $push: { notes: noteData },
                updated_at: Date.now()
            }
        );

        res.json({ success: true, message: 'Note Added' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get health record
// const getHealthRecord = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const healthRecord = await healthRecordModel
//             .findOne({ user_id: userId })
//             // .populate({
//             //     path: 'doctor_visits.doctor_id',
//             //     model: 'doctor',
//             //     select: 'name speciality'
//             // })
//             // .populate('doctor_visits.appointment_id')
//             // .populate({
//             //     path: 'notes.created_by',
//             //     model: 'doctor',
//             //     select: 'name speciality'
//             // });

//         if (!healthRecord) {
//             return res.json({ success: false, message: 'Health Record not found' });
//         }

//         res.json({ success: true, healthRecord });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };
const getHealthRecord = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // First get the basic health record
        let healthRecord = await healthRecordModel.findOne({ user_id: userId });
        
        if (!healthRecord) {
            return res.json({ success: false, message: 'Health Record not found' });
        }
        
        // Populate both doctor visits and notes in a single query
        healthRecord = await healthRecordModel
            .findOne({ user_id: userId })
            .populate({
                path: 'doctor_visits.doctor_id',
                model: 'doctor',
                select: 'name email speciality',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'doctor_visits.appointment_id',
                model: 'appointment',
                select: 'slotDate slotTime',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'notes.created_by',
                model: 'doctor',
                select: 'name speciality',
                options: { strictPopulate: false }
            });
        
        // Clean up any null references
        if (healthRecord.doctor_visits) {
            healthRecord.doctor_visits = healthRecord.doctor_visits.filter(visit => 
                visit.doctor_id && visit.appointment_id
            );
        }
        
        if (healthRecord.notes) {
            healthRecord.notes = healthRecord.notes.filter(note => 
                note.created_by
            );
        }
        
        res.json({
            success: true,
            healthRecord,
            hasVisits: healthRecord.doctor_visits.length > 0,
            hasNotes: healthRecord.notes.length > 0
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    createHealthRecord,
    addDoctorVisit,
    updateHealthRecord,
    addNote,
    getHealthRecord
};