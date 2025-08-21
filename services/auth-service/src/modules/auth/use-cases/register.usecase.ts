import { Errors } from "moleculer";
import { generateReferralCode, generateToken, hashPassword } from "../../../common/utils";
import type {
	RegisterUseCaseDependencies,
	RegisterUseCaseParams,
	RegisterUseCaseResult,
} from "../auth.types";
import type { UserDocument } from "../models/user/schema";

const { MoleculerClientError } = Errors;

// Define the dependencies this use case needs

export default class RegisterUseCase {
	private dependencies: RegisterUseCaseDependencies;

	constructor(dependencies: RegisterUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: RegisterUseCaseParams): Promise<RegisterUseCaseResult> {
		const { phone, password } = params;
		const { userRepository } = this.dependencies;

		// 1. Check if user already exists
		const existingUser: UserDocument | null = await userRepository.findByPhone(phone);
		if (existingUser) {
			throw new MoleculerClientError(
				"User with this phone number already exists.",
				409,
				"PHONE_EXISTS",
			);
		}

		// 2. Hash the password
		const hashedPassword = await hashPassword(password);

		// 3. Create the new user
		const referralCode = generateReferralCode();
		const user: UserDocument = await userRepository.create({
			phone,
			password: hashedPassword,
			referralCode,
		});

		// 4. Generate a JWT
		const token = await generateToken(user);

		// 5. Notify the gamification service and reward the user
		await this.dependencies.gamificationGateway.notifyUserRegistered(user._id.toString());

		// 6. Return the token
		return { token, referralCode, userId: user._id.toString() };
	}
}
