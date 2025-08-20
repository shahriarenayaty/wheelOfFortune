import mongoose from "mongoose";
import type { IPoint } from "../../modules/gamification/gamification.types";
import pointSchema from "./schema";

export const pointModel = mongoose.model<IPoint>("Point", pointSchema);
