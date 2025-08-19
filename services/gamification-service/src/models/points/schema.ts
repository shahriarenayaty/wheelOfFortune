import { Schema } from "mongoose";
import type { HydratedDocument, InferSchemaType } from "mongoose";

export const pointSchema = new Schema({
	userId: { type: String, required: true, unique: true, index: true },
	balance: { type: Number, default: 0 },
});

export type IPoint = InferSchemaType<typeof pointSchema>;

export type PointDocument = HydratedDocument<IPoint>;
