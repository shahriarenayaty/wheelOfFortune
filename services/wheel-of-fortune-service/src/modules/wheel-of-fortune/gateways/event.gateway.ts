import type { JWTPayload } from "jose";
import type { ServiceBroker } from "moleculer";
import generateSign from "../../../common/utils/generate-sign";
import type { IEventGateway, PrizeWonEventPayload } from "../wheel-of-fortune.types";

export default class EventGateway implements IEventGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async publishPrizeWon(prizeWon: PrizeWonEventPayload): Promise<void> {
		const payload: JWTPayload = { ...prizeWon };
		const sign = generateSign(payload);
		await this.broker.emit("prize.won", sign);
	}
}
