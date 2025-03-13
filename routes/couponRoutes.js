import express from "express";
import { claimCoupon } from "../controllers/couponController.js";
import preventAbuse from "../middlewares/abusePrevention.js";

const router = express.Router();

router.get("/claim", preventAbuse, claimCoupon);

export default router;
