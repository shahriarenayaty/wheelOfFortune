import { Schema } from "mongoose";

const pointSchema = new Schema({
	userId: { type: String, required: true, unique: true, index: true },
	balance: { type: Number, default: 0 },
});

export default pointSchema;
