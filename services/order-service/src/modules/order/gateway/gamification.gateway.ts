import { type ServiceBroker } from "moleculer";
import type {
	GetUserPointsUseCaseResponse,
	IGamificationGateway,
	PointsToAddResponse,
} from "../order.type";

export default class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async publishOrderSuccessful(userId: string, purchaseAmount: number): Promise<void> {
		await this.broker.emit("order.successful", { userId, purchaseAmount });
	}

	async fetchUserBalance(meta: object): Promise<GetUserPointsUseCaseResponse> {
		// We need to pass the meta object for authentication purposes
		return this.broker.call("gamification.getBalance", {}, { meta });
	}

	async pointsToAdd(pointsToAdd: number, meta: object): Promise<PointsToAddResponse> {
		try {
			return await this.broker.call("gamification.addPoints", { pointsToAdd }, { meta });
		} catch (error) {
			return {
				newBalance: -1,
			};
		}
	}
}
