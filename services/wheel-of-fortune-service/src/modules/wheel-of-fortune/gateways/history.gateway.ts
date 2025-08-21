import { type ServiceBroker } from "moleculer";
import type { CallingOptions } from "../../../common/types/auth.types";
import type { IHistoryGateway, IPrizeWonHistory } from "../wheel-of-fortune.types";

export default class HistoryGateway implements IHistoryGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async fetchUserPrizeWon(token: string): Promise<IPrizeWonHistory[]> {
		// We need to pass the meta object for authentication purposes
		const optional: CallingOptions = { meta: { token } };
		return this.broker.call("history.prize", {}, optional);
	}
}
