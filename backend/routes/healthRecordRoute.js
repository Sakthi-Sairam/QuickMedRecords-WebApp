import express from 'express';
import { 
    createHealthRecord,
    addDoctorVisit,
    updateHealthRecord,
    addNote,
    getHealthRecord
} from '../controllers/healthRecordController.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.js';
import { createSession, accessSession } from "../controllers/healthRecordSession.js";

const healthRecordRouter = express.Router();

// Patient routes (with user authentication)
healthRecordRouter.post('/create', authUser, createHealthRecord);          // Create initial record
healthRecordRouter.put('/update', authUser, updateHealthRecord);           // Update basic details
healthRecordRouter.get('/get-record', authUser, getHealthRecord);         // Get health record

// Doctor routes (with doctor authentication)
healthRecordRouter.post('/add-visit', authDoctor, addDoctorVisit);        // Add visit record
healthRecordRouter.post('/add-note', authDoctor, addNote);                // Add note

healthRecordRouter.post("/create-session",authUser ,createSession); // Create a temporary session
healthRecordRouter.get("/session/:token",authDoctor ,accessSession);  // Access the temporary session

export default healthRecordRouter;