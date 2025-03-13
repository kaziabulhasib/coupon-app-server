import mongoose from "mongoose";

const CouponCounterSchema = new mongoose.Schema({
  lastAssigned: { type: Number, default: 0 },
});

const CouponCounter = mongoose.model("CouponCounter", CouponCounterSchema);
export default CouponCounter;
