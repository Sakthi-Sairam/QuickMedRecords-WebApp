import TemporarySession from "../models/tempSessionModel.js";
import healthRecordModel from "../models/healthRecordModel.js";
import userModel from "../models/userModel.js";
import crypto from "crypto";

export const createSession = async (req, res) => {
  try {
    const { userId } = req.body;

    // Generate a unique token
    const token = crypto.randomBytes(16).toString("hex");

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save the session to the database
    const session = new TemporarySession({
      token,
      userId,
      expiresAt,
    });
    await session.save();

    res.json({
      success: true,
      message: "Temporary session created",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const accessSession = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the session
    const session = await TemporarySession.findOne({ token })
    .populate({
        path: "userId",
        model: "user",
        select: "name email gender dob "
      })

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid session token" });
    }

    // Check if the session has expired
    if (session.expiresAt < Date.now()) {
      return res
        .status(403)
        .json({ success: false, message: "Session has expired" });
    }

    // First get the basic health record
    let healthRecord = await healthRecordModel.findOne({ user_id: session.userId._id });

    // Populate both doctor visits and notes in a single query
    healthRecord = await healthRecordModel
      .findOne({ user_id: session.userId._id })
      .populate({
        path: "doctor_visits.doctor_id",
        model: "doctor",
        select: "name email speciality",
        options: { strictPopulate: false },
      })
      .populate({
        path: "doctor_visits.appointment_id",
        model: "appointment",
        select: "slotDate slotTime",
        options: { strictPopulate: false },
      })
      .populate({
        path: "notes.created_by",
        model: "doctor",
        select: "name speciality",
        options: { strictPopulate: false },
      });

    // Clean up any null references
    if (healthRecord.doctor_visits) {
      healthRecord.doctor_visits = healthRecord.doctor_visits.filter(
        (visit) => visit.doctor_id && visit.appointment_id
      );
    }

    if (healthRecord.notes) {
      healthRecord.notes = healthRecord.notes.filter((note) => note.created_by);
    }

    if (!healthRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Health record not found" });
    }

    res.json({ success: true,session , healthRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
