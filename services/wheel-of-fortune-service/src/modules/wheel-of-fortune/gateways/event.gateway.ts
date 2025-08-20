import type { ServiceBroker } from "moleculer";
import type { PrizeWonEventPayload } from "../wheel-of-fortune.types";

export interface IEventGateway {
	publishPrizeWon(payload: PrizeWonEventPayload): Promise<void>;
}

export class EventGateway implements IEventGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async publishPrizeWon(payload: PrizeWonEventPayload): Promise<void> {
		await this.broker.emit("prize.won", payload);
	}
}
