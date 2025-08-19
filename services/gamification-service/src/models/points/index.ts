import mongoose from "mongoose";
import { pointSchema } from "./schema";
import type { IPoint } from "./schema";

export const pointModel = mongoose.model<IPoint>("Point", pointSchema);