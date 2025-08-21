import { Errors } from "moleculer";
import { generateToken } from "../../../common/utils";
import comparePassword from "../../../common/utils/compare-password";
import type { LoginUseCaseDependencies, LoginUseCaseParams } from "../auth.types";
import type { UserDocument } from "../models/user/schema";

const { MoleculerClientError } = Errors;

export default class LoginUseCase {
	private loginUseCaseDependencies: LoginUseCaseDependencies;

	constructor(loginUseCaseDependencies: LoginUseCaseDependencies) {
		this.loginUseCaseDependencies = loginUseCaseDependencies;
	}

	async execute(params: LoginUseCaseParams): Promise<{ token: string }> {
		const { phone, password } = params;
		const { userRepository } = this.loginUseCaseDependencies;

		// 1. Find the user by their phone number
		const user: UserDocument | null = await userRepository.findByPhone(phone);

		// 2. Validate user existence and password
		if (!user || !user.password) {
			// It's a good security practice to use a generic error message
			// for both "user not found" and "wrong password" to prevent user enumeration.
			throw new MoleculerClientError("Invalid credentials provided.", 401, "INVALID_PHONE");
		}

		const isPasswordCorrect = await comparePassword(password, user.password);
		if (!isPasswordCorrect) {
			throw new MoleculerClientError(
				"Invalid credentials provided.",
				401,
				"INVALID_PASSWORD",
			);
		}

		// 3. If credentials are valid, generate a JWT
		const token = await generateToken(user);

		// 4. Return the token
		return { token };
	}
}
