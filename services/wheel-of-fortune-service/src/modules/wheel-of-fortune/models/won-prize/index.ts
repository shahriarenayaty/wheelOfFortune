import mongoose from "mongoose";
import { wonPrizeSchema } from "./schema";
import type { IWonPrize } from "./schema";

export const wonPrizeModel = mongoose.model<IWonPrize>("WonPrize", wonPrizeSchema);
