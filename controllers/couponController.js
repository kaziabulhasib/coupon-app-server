import CouponCounter from "../models/CouponCounter.js";
import Claim from "../models/Claim.js";

const coupons = ["COUPON1", "COUPON2", "COUPON3", "COUPON4", "COUPON5"];

// Function to get client's IP address
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress
  );
};

export const claimCoupon = async (req, res) => {
  try {
    let counter = await CouponCounter.findOne();
    if (!counter) counter = await CouponCounter.create({ lastAssigned: 0 });

    const userIp = getClientIp(req); // Get the user's IP address
    const userCookie =
      req.cookies?.coupon_token || new Date().getTime().toString();

    // Check if this IP has claimed within the last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingClaim = await Claim.findOne({
      ipAddress: userIp,
      claimedAt: { $gt: oneHourAgo }, // ✅ Correct field name
    });

    if (existingClaim) {
      // Calculate remaining time
      const timePassed = (Date.now() - existingClaim.claimedAt.getTime()) / 1000; // in seconds
      const timeRemaining = 3600 - timePassed; // 1 hour - timePassed

      const minutes = Math.floor(timeRemaining / 60);
      const seconds = Math.floor(timeRemaining % 60);

      return res.status(429).json({
        message: `You have already claimed a coupon. Try again in ${minutes} min ${seconds} sec.`,
      });
    }

    // Assign a coupon
    const coupon = coupons[counter.lastAssigned % coupons.length];
    counter.lastAssigned += 1;
    await counter.save();

    // Save the claim with IP tracking
    await Claim.create({ ipAddress: userIp, userCookie, claimedAt: new Date() });

    // Set cookie for tracking (browser session-based)
    res.cookie("coupon_token", userCookie, { maxAge: 3600000, httpOnly: true });

    res.json({ coupon, message: "Coupon claimed successfully!" });
  } catch (error) {
    console.error("Error claiming coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
