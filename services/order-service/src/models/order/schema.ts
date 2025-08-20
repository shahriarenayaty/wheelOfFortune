import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

export enum OrderStatus {
	PENDING = "pending",
	SUCCESSFUL = "successful",
	FAILED = "failed",
}

export type IOrder = InferSchemaType<typeof orderSchema>;

export type OrderDocument = HydratedDocument<IOrder>;

export const orderSchema = new Schema(
	{
		userId: { type: String, required: true, index: true },
		amountInToman: { type: Number, required: true },
		status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
	},
	{ timestamps: true },
);
