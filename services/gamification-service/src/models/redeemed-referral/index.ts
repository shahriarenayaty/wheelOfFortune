import mongoose from "mongoose";
import { redeemedReferralSchema } from "./schema";
import type { IRedeemedReferral } from "./schema";

export const redeemedReferralModel = mongoose.model<IRedeemedReferral>(
	"RedeemedReferral",
	redeemedReferralSchema,
);
