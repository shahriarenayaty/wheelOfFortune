import mongoose from "mongoose";
import { orderSchema } from "./schema";
import type { IOrder } from "./schema";

export const orderModel = mongoose.model<IOrder>("Order", orderSchema);
