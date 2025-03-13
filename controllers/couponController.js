import CouponCounter from "../models/CouponCounter.js";
import Claim from "../models/Claim.js";

const coupons = ["COUPON1", "COUPON2", "COUPON3", "COUPON4", "COUPON5"];

export const claimCoupon = async (req, res) => {
  let counter = await CouponCounter.findOne();
  if (!counter) counter = await CouponCounter.create({ lastAssigned: 0 });

  const coupon = coupons[counter.lastAssigned % coupons.length];
  counter.lastAssigned += 1;
  await counter.save();

  const ipAddress = req.ip;
  const userCookie = req.cookies?.coupon_token || new Date().getTime().toString();
  res.cookie("coupon_token", userCookie, { maxAge: 3600000, httpOnly: true });

  await Claim.create({ ipAddress, userCookie });

  res.json({ coupon, message: "Coupon claimed successfully!" });
};
