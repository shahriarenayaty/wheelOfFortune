import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

export const wonPrizeSchema = new Schema(
	{
		userId: { type: String, required: true, unique: true, index: true },
		prizeId: { type: String, required: true },
		prizeName: { type: String, required: true },
		prizeDetails: { type: Schema.Types.Mixed, default: {} },
	},
	{ timestamps: true },
);

export type IWonPrize = InferSchemaType<typeof wonPrizeSchema>;

export type WonPrizeDocument = HydratedDocument<IWonPrize>;
