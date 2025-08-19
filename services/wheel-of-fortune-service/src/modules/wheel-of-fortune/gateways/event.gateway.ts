import type { ServiceBroker } from "moleculer";
import type { PrizeWonEventPayload } from "../wheel-of-fortune.types";

export default class EventGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async publishPrizeWon(payload: PrizeWonEventPayload): Promise<void> {
		await this.broker.emit("prize.won", payload);
	}
}
