import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Context, ServiceBroker } from "moleculer";
import { Service } from "moleculer";
import DbService from "moleculer-db";
import MongooseAdapter from "moleculer-db-adapter-mongoose";
import { v4 as uuid } from "uuid";
import { userModel } from "../models/user";
import type { IUser } from "../models/user/schema";

export default class AuthService extends Service {
	// Adapter for the moleculer-db mixin
	private adapter = new MongooseAdapter(process.env.MONGO_URI!);

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "auth",
			// Use the DbService mixin
			mixins: [DbService],
			adapter: this.adapter,
			model: userModel,

			// Service-specific settings
			settings: {
				// Exclude the password field from default responses
				fields: ["_id", "phone", "referralCode"],
			},

			// Service actions
			actions: {
				register: {
					params: {
						phone: { type: "string" },
						password: { type: "string" },
					},
					async handler(
						ctx: Context<{ phone: string; password: string }>,
					): Promise<{ message: string; referralCode: string }> {
						const { phone, password } = ctx.params;

						// Check if user already exists
						const existingUser = await this.adapter.findOne({ phone });
						if (existingUser) {
							throw new Error("Phone number is already registered.");
						}

						const referralCode = uuid().slice(0, 8).toUpperCase();
						const hashedPassword = await bcrypt.hash(password, 10);

						const newUser = await this.adapter.insert({
							phone,
							password: hashedPassword,
							referralCode,
						});

						this.broker
							.emit("user.registered", { userId: newUser._id })
							.catch((err) => {
								this.logger.warn("Event emit failed", err);
							});
						return { message: "Registered successfully", referralCode };
					},
				},

				login: {
					params: {
						phone: { type: "string" },
						password: { type: "string" },
					},
					async handler(
						ctx: Context<{ phone: string; password: string }>,
					): Promise<{ token: string }> {
						const { phone, password } = ctx.params;

						const user: IUser | null = await this.adapter.findOne({ phone });

						if (
							!user ||
							!user.password ||
							!(await bcrypt.compare(password, user.password))
						) {
							throw new Error("Invalid credentials");
						}

						const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
							expiresIn: "1h",
						});
						return { token };
					},
				},
			},
		});
	}
}
