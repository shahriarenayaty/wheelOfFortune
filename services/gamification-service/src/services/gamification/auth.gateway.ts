import { Errors, type ServiceBroker } from "moleculer";

const { MoleculerClientError } = Errors;

export interface User {
	_id: string;
	referralCode: string;
}

export interface IAuthGateway {
	findUserByReferralCode(code: string): Promise<User | null>;
}

export class AuthGateway implements IAuthGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async findUserByReferralCode(code: string): Promise<User | null> {
		const owners: Array<User> = await this.broker.call("auth.find", {
			query: { referralCode: code },
		});

		return this.validateAndGetFirstUser(owners);
	}

	/**
	 * Validates the response from the 'auth.find' service call.
	 * It ensures the response is an array containing at least one valid user object.
	 *
	 * @param response The raw response from broker.call
	 * @returns The first valid user from the array.
	 * @throws {MoleculerClientError} if the response is invalid.
	 */
	private validateAndGetFirstUser(response: unknown): User | null {
		// Rule 1: Must be an array
		if (!Array.isArray(response)) {
			throw new MoleculerClientError(
				"Invalid response from auth service: Expected an array.",
				502, // Bad Gateway
				"DEFAULT",
			);
		}

		// Rule 2: The calling function will handle the "not found" case, so we only error if the shape is wrong.
		// If the array is empty, we let the calling function handle it.
		if (response.length === 0) {
			return null;
		}

		const user = response[0];

		// Rule 3: The first element must be a valid user object
		if (
			!user ||
			typeof user !== "object" ||
			typeof user._id !== "string" ||
			user._id.length === 0 ||
			typeof user.referralCode !== "string" ||
			user.referralCode.length === 0
		) {
			throw new MoleculerClientError(
				"Invalid response from auth service: User object is malformed.",
				502, // Bad Gateway
				"DEFAULT",
				{ received: user }, // Include the bad data for debugging
			);
		}

		return user as User;
	}
}
