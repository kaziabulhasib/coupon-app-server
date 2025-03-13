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
      createdAt: { $gt: oneHourAgo },
    });

    if (existingClaim) {
      return res
        .status(429)
        .json({
          message:
            "You have already claimed a coupon. Please try again after 1 hour.",
        });
    }

    // Assign a coupon
    const coupon = coupons[counter.lastAssigned % coupons.length];
    counter.lastAssigned += 1;
    await counter.save();

    // Save the claim with IP tracking
    await Claim.create({ ipAddress: userIp, userCookie });

    // Set cookie for tracking (browser session-based)
    res.cookie("coupon_token", userCookie, { maxAge: 3600000, httpOnly: true });

    res.json({ coupon, message: "Coupon claimed successfully!" });
  } catch (error) {
    console.error("Error claiming coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
