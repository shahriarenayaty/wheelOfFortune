import mongoose from "mongoose";
import { prizeHistorySchema } from "./schema";
import type { IPrizeHistory } from "./schema";

export const prizeHistoryModel = mongoose.model<IPrizeHistory>("PrizeHistory", prizeHistorySchema);
