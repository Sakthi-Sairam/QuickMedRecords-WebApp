import TemporarySession from "../models/tempSessionModel.js";

const cleanupExpiredSessions = async () => {
  try {
    await TemporarySession.deleteMany({ expiresAt: { $lt: Date.now() } });
    console.log("Expired sessions cleaned up");
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
};

const scheduleSessionCleanup = () => {
    cleanupExpiredSessions()
    setInterval(cleanupExpiredSessions, 30 * 60 * 1000);
};

export default scheduleSessionCleanup;
