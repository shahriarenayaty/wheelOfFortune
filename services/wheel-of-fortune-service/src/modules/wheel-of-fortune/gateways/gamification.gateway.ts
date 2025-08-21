import { type ServiceBroker } from "moleculer";
import type { CallingOptions } from "../../../common/types/auth.types";
import type { DeductPointsUseCaseResponse, IGamificationGateway } from "../wheel-of-fortune.types";

export default class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async deductPoints(
		pointsToDeduct: number,
		token: string,
	): Promise<DeductPointsUseCaseResponse> {
		// We need to pass the meta object for authentication purposes
		const optional: CallingOptions = { meta: { token } };
		return this.broker.call("gamification.deductPoints", { pointsToDeduct }, optional);
	}
}
