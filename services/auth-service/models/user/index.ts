import mongoose from "mongoose";
import { userSchema } from "./schema";
import type { IUser } from "./schema";

export const userModel = mongoose.model<IUser>("User", userSchema);
