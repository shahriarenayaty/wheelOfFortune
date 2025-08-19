import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Errors } from "moleculer";
import { v4 as uuid } from "uuid";
import type { UserDocument } from "../../../models/user/schema";
import type { IUserRepository } from "../auth.repository";

const { MoleculerClientError } = Errors;

// Define the dependencies this use case needs
export interface RegisterUseCaseDependencies {
	userRepository: IUserRepository;
	jwtSecret: string; // The secret key for signing tokens
}

// Define the input parameters for this specific use case
export interface RegisterUseCaseParams {
	phone: string;
	password: string;
}

export class RegisterUseCase {
	private dependencies: RegisterUseCaseDependencies;

	constructor(dependencies: RegisterUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(
		params: RegisterUseCaseParams,
	): Promise<{ token: string; referralCode: string; userId: string }> {
		const { phone, password } = params;
		const { userRepository, jwtSecret } = this.dependencies;

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
		const hashedPassword = await bcrypt.hash(password, 10);

		// 3. Create the new user
		const referralCode = uuid().slice(0, 8).toUpperCase();
		const user: UserDocument = await userRepository.create({
			phone,
			password: hashedPassword,
			referralCode,
		});

		// 4. Generate a JWT
		const token = jwt.sign(
			{ userId: user._id }, // Payload
			jwtSecret, // Secret Key
			{ expiresIn: "1h" }, // Options
		);

		// 5. Return the token
		return { token, referralCode, userId: user._id.toString() };
	}
}
