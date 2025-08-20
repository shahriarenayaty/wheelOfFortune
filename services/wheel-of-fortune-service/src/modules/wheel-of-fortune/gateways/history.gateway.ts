import { type ServiceBroker } from "moleculer";
import type { IAuth } from "../../../common/types/auth.types";
import type { IPrizeWonHistory } from "../wheel-of-fortune.types";

export interface IHistoryGateway {
	fetchUserPrizeWon(auth: IAuth): Promise<IPrizeWonHistory[]>;
}

export class HistoryGateway implements IHistoryGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async fetchUserPrizeWon(auth: IAuth): Promise<IPrizeWonHistory[]> {
		// We need to pass the meta object for authentication purposes
		return this.broker.call("history.prize", {}, { meta: { ...auth } });
	}
}
