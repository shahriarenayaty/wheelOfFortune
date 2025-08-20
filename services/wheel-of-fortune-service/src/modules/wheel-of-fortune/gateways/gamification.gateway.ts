import { type ServiceBroker } from "moleculer";
import type { IAuth } from "../../../common/types/auth.types";
import type { DeductPointsUseCaseResponse } from "../wheel-of-fortune.types";

export interface IGamificationGateway {
	deductPoints(pointsToDeduct: number, auth: IAuth): Promise<DeductPointsUseCaseResponse>;
}

export class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async deductPoints(pointsToDeduct: number, auth: IAuth): Promise<DeductPointsUseCaseResponse> {
		// We need to pass the meta object for authentication purposes
		return this.broker.call(
			"gamification.deductPoints",
			{ pointsToDeduct },
			{ meta: { ...auth } },
		);
	}
}
