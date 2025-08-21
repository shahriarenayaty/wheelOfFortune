import mongoose from "mongoose";
import type { IRedeemedReferral } from "../../gamification.types";
import redeemedReferralSchema from "./schema";

export const redeemedReferralModel = mongoose.model<IRedeemedReferral>(
	"RedeemedReferral",
	redeemedReferralSchema,
);
