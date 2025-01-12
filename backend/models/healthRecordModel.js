import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Patient Demographics
  demographics: {
    blood_group: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    marital_status: { type: String, enum: ['Single', 'Married', 'Widowed', 'Divorced'] },
    occupation: String,
  },

  // Doctor Visits (includes both past and current visits)
  doctor_visits: [
    {
      appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
      doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
      created_at: { type: Date, default: Date.now },
      diagnosis: String,
      prescriptions: [
        {
          medication: String,
          dosage: String,
          frequency: String,
          duration: String,
          instructions: String,
        },
      ],
      remarks: String,
      reports: [
        {
          title: String,
          url: String,
          remarks: String,
          uploaded_at: { type: Date, default: Date.now },
        },
      ],
    },
  ],

  allergies: [String],

  insurance_details: {
    provider: String,
    policy_number: String,
    valid_until: Date,
  },

  emergency_contact: {
    name: String,
    phone: String,
    relationship: String,
  },

  notes: [
    {
      created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      note: String,
      created_at: { type: Date, default: Date.now },
    },
  ],

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const healthRecordModel = mongoose.models.healthRecord || mongoose.model('healthRecord', healthRecordSchema);
export default healthRecordModel;