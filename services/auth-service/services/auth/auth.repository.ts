import type MongooseDbAdapter from "moleculer-db-adapter-mongoose";
import type { IUser, UserDocument } from "../../models/user/schema";

export interface IUserRepository {
	/** Finds a single user by their phone number */
	findByPhone(phone: string): Promise<UserDocument | null>;

	/** Creates a new user and returns the created entity */
	create(data: IUser): Promise<UserDocument>;
}

export class UserRepository implements IUserRepository {
	private adapter: MongooseDbAdapter<UserDocument>;

	constructor(adapter: MongooseDbAdapter<UserDocument>) {
		this.adapter = adapter;
	}

	async findByPhone(phone: string): Promise<UserDocument | null> {
		return this.adapter.findOne({ phone });
	}

	async create(data: Partial<IUser>): Promise<UserDocument> {
		// const user = new this.adapter(data);

		const user = await this.adapter.insert(data as IUser);
		return user;
	}
}
