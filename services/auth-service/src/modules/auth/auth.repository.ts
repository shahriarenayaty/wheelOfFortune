import type { Model } from "mongoose";
import type { IUserRepository } from "./auth.types";
import { userModel } from "./models/user";
import type { IUser, UserDocument } from "./models/user/schema";

export default class UserRepository implements IUserRepository {
	private userModel: Model<IUser>;

	constructor() {
		this.userModel = userModel;
	}

	async findByPhone(phone: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ phone });
	}

	async create(data: Partial<IUser>): Promise<UserDocument> {
		// const user = new this.adapter(data);

		const user = await this.userModel.create(data as IUser);
		return user;
	}

	async findByReferralCode(referralCode: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ referralCode });
	}
}
