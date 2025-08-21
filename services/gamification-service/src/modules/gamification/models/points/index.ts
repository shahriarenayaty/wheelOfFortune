import mongoose from "mongoose";
import type { IPoint } from "../../gamification.types";
import pointSchema from "./schema";

export const pointModel = mongoose.model<IPoint>("Point", pointSchema);
