import mongoose from "mongoose";

const temporarySessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  // healthRecordData: { type: Object, required: true }
//   doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
});

const TemporarySession = mongoose.models.TemporarySession || mongoose.model("TemporarySession", temporarySessionSchema);
export default TemporarySession;
