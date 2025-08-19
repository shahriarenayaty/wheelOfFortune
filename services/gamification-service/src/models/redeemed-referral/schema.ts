import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

export const redeemedReferralSchema = new Schema({
	userId: { type: String, required: true, unique: true }, // The user who redeemed the code
	codeUsed: { type: String, required: true },
});

export type IRedeemedReferral = InferSchemaType<
	typeof redeemedReferralSchema
>;

export type RedeemedReferralDocument = HydratedDocument<IRedeemedReferral>;
