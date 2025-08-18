import mongoose from "mongoose";
import type { Document } from "mongoose";

export interface IUser extends Document {
	phone: string;
	password?: string;
	referralCode: string;
}

export const userSchema = new mongoose.Schema({
	phone: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	referralCode: { type: String, unique: true },
});
