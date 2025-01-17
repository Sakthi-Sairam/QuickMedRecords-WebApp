import TemporarySession from "../models/tempSessionModel.js";

const cleanupExpiredSessions = async () => {
  try {
    await TemporarySession.deleteMany({ expiresAt: { $lt: Date.now() } });
    console.log("Expired sessions cleaned up");
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
};

// Run every minute with a starting delay of 1 minute
const scheduleSessionCleanup = () => {
  setTimeout(() => {
    cleanupExpiredSessions();
    setInterval(cleanupExpiredSessions, 60 * 1000); // Every minute
  }, 60 * 1000); // Initial delay of 1 minute
};

export default scheduleSessionCleanup;
