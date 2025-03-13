import Claim from "../models/Claim.js";

const ABUSE_TIMEOUT = 60 * 60 * 1000; // 1 hour

const preventAbuse = async (req, res, next) => {
  const ipAddress = req.ip;
  const userCookie = req.cookies?.coupon_token || "";

  const lastClaim = await Claim.findOne({
    $or: [{ ipAddress }, { userCookie }],
  }).sort({ claimedAt: -1 });

  if (lastClaim && new Date() - lastClaim.claimedAt < ABUSE_TIMEOUT) {
    const remaining = Math.ceil((ABUSE_TIMEOUT - (new Date() - lastClaim.claimedAt)) / 60000);
    return res.status(429).json({ message: `You can claim another coupon in ${remaining} minutes.` });
  }

  next();
};

export default preventAbuse;
