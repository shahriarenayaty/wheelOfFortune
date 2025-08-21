import { Errors } from "moleculer";
import type { CallingOptions, ServiceBroker } from "moleculer";
import type { IAuthGateway, User } from "../gamification.types";

const { MoleculerClientError } = Errors;

export default class AuthGateway implements IAuthGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async findUserByReferralCode(code: string, token?: string): Promise<User | null> {
		const callOptions: CallingOptions | undefined = token ? { meta: { token } } : undefined;

		const owner = await this.broker.call(
			"auth.resolveReferral",
			{
				referralCode: code,
			},
			callOptions,
		);

		return this.validateAndGetFirstUser(owner);
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
		// Ensure response is an object and not null
		if (!response || typeof response !== "object") {
			throw new MoleculerClientError(
				"Invalid response from auth service: Response is not an object.",
				502,
				"DEFAULT",
				{ received: response },
			);
		}

		const resp = response as { user?: unknown };
		if (!resp.user) {
			return null;
		}
		const user = resp.user as Partial<User>;

		if (
			typeof user.id !== "string" ||
			user.id.length === 0 ||
			typeof user.referralCode !== "string" ||
			typeof user.phone !== "string" ||
			user.phone.length === 0
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
