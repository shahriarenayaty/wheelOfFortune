import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

// export interface IUser extends Document {
// 	phone: string;
// 	password?: string;
// 	referralCode: string;
// }

// export type UserDocument = HydratedDocument<IUser>;

export const userSchema = new Schema({
	phone: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	referralCode: { type: String, unique: true },
});

// export const User: Model<IUser> = mongoose.models.User || model<IUser>("User", userSchema);

export type IUser = InferSchemaType<typeof userSchema>;

export type UserDocument = HydratedDocument<IUser>;
