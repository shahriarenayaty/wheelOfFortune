import { type ServiceBroker } from "moleculer";
import type { CallingOptions } from "../../../common/types/auth";
import type {
	GetUserPointsUseCaseResponse,
	IGamificationGateway,
	PointsToAddResponse,
} from "../order.type";
import generateSign from "../../../common/utils/generate-sign";

export default class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async publishOrderSuccessful(userId: string, purchaseAmount: number): Promise<void> {
		const sign = await generateSign({ userId, purchaseAmount });
		await this.broker.emit("order.successful", sign);
	}

	async fetchUserBalance(token: string): Promise<GetUserPointsUseCaseResponse> {
		const callOptions: CallingOptions = { meta: { token } };

		// We need to pass the meta object for authentication purposes
		return this.broker.call("gamification.getBalance", {}, callOptions);
	}

	async pointsToAdd(pointsToAdd: number, token: string): Promise<PointsToAddResponse> {
		const callOptions: CallingOptions = { meta: { token } };

		try {
			return await this.broker.call("gamification.pointsToAdd", { pointsToAdd }, callOptions);
		} catch (error) {
			return {
				newBalance: -1,
			};
		}
	}
}
