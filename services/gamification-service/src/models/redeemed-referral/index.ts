import mongoose from "mongoose";
import type { IRedeemedReferral } from "../../modules/gamification/gamification.types";
import redeemedReferralSchema from "./schema";

export const redeemedReferralModel = mongoose.model<IRedeemedReferral>(
	"RedeemedReferral",
	redeemedReferralSchema,
);
