import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

export const userSchema = new Schema({
	phone: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	referralCode: { type: String, unique: true },
});

export type IUser = InferSchemaType<typeof userSchema>;

export type UserDocument = HydratedDocument<IUser>;
