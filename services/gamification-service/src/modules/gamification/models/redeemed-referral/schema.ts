import { Schema } from "mongoose";

const redeemedReferralSchema = new Schema({
	userId: { type: String, required: true, unique: true }, // The user who redeemed the code
	codeUsed: { type: String, required: true },
});
export default redeemedReferralSchema;
