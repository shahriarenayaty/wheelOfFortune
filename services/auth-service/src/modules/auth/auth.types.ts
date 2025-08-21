import type { ParamsFrom } from "../../common/types/validator";
import type { loginValidator, registerValidator } from "./auth.validators";
import type { IUser, UserDocument } from "./models/user/schema";

export type LoginUseCaseParams = ParamsFrom<typeof loginValidator>;

export type RegisterUseCaseParams = ParamsFrom<typeof registerValidator>;

export type RegisterUseCaseResult = {
	token: string;
	referralCode: string;
	userId: string;
};

export interface IGamificationGateway {
	notifyUserRegistered(userId: string): Promise<void>;
}

export interface IUserRepository {
	/** Finds a single user by their phone number */
	findByPhone(phone: string): Promise<UserDocument | null>;

	/** Creates a new user and returns the created entity */
	create(data: IUser): Promise<UserDocument>;
}

// Define the dependencies this use case needs
export interface LoginUseCaseDependencies {
	userRepository: IUserRepository;
}

export interface RegisterUseCaseDependencies {
	userRepository: IUserRepository;
	gamificationGateway: IGamificationGateway;
}
