import type { Model } from "mongoose";
import type { IUser, UserDocument } from "./models/user/schema";

export interface IUserRepository {
	/** Finds a single user by their phone number */
	findByPhone(phone: string): Promise<UserDocument | null>;

	/** Creates a new user and returns the created entity */
	create(data: IUser): Promise<UserDocument>;
}

export class UserRepository implements IUserRepository {
	private userModel: Model<IUser>;

	constructor(userModel: Model<IUser>) {
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
}
