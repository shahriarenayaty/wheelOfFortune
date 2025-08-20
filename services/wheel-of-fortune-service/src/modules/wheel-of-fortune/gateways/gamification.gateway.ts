import { type ServiceBroker } from "moleculer";
import type { IAuth } from "../../../common/types/auth.types";
import type { IUserBalanceResponse } from "../wheel-of-fortune.types";

export interface IGamificationGateway {
	fetchUserBalance(auth: IAuth): Promise<IUserBalanceResponse>;
}

export class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async fetchUserBalance(auth: IAuth): Promise<IUserBalanceResponse> {
		// We need to pass the meta object for authentication purposes
		return this.broker.call("gamification.getBalance", {}, { meta: { ...auth } });
	}
}
