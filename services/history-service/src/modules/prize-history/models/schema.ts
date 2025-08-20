import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

export const prizeHistorySchema = new Schema(
	{
		userId: { type: String, required: true },
		prizeId: { type: String, required: true },
		prizeName: { type: String, required: true },
		prizeDetails: { type: Schema.Types.Mixed, default: {} },
		wonAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

export type IPrizeHistory = InferSchemaType<typeof prizeHistorySchema>;

export type PrizeHistoryDocument = HydratedDocument<IPrizeHistory>;
