import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Errors } from "moleculer";
import type { UserDocument } from "../../../models/user/schema";
import type { IUserRepository } from "../auth.repository";

const { MoleculerClientError } = Errors;

// Define the dependencies this use case needs
export interface LoginUseCaseDependencies {
	userRepository: IUserRepository;
	jwtSecret: string; // The secret key for signing tokens
}

// Define the input parameters for this specific use case
export interface LoginUseCaseParams {
	phone: string;
	password: string;
}

export class LoginUseCase {
	private dependencies: LoginUseCaseDependencies;

	constructor(dependencies: LoginUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: LoginUseCaseParams): Promise<{ token: string }> {
		const { phone, password } = params;
		const { userRepository, jwtSecret } = this.dependencies;

		// 1. Find the user by their phone number
		const user: UserDocument | null = await userRepository.findByPhone(phone);

		// 2. Validate user existence and password
		if (!user || !user.password) {
			// It's a good security practice to use a generic error message
			// for both "user not found" and "wrong password" to prevent user enumeration.
			throw new MoleculerClientError("Invalid credentials provided.", 401, "INVALID_PHONE");
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			throw new MoleculerClientError(
				"Invalid credentials provided.",
				401,
				"INVALID_PASSWORD",
			);
		}

		// 3. If credentials are valid, generate a JWT
		const token = jwt.sign(
			{ userId: user._id }, // Payload
			jwtSecret, // Secret Key
			{ expiresIn: "1h" }, // Options
		);

		// 4. Return the token
		return { token };
	}
}
