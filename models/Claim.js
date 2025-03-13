import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema({
  ipAddress: { type: String, required: true },
  userCookie: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now },
});

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;
