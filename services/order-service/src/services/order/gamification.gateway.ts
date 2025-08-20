import { type ServiceBroker } from "moleculer";

export interface IGamificationGateway {
	publishOrderSuccessful(userId: string, purchaseAmount: number): void;
	fetchUserBalance(meta: object): Promise<{ balance: number }>;
	calculateOrderPoints(purchaseAmount: number): Promise<number>;
	calculateAndSaveOrderPoints(
		purchaseAmount: number,
		meta: object,
	): Promise<{ newPoints: number }>;
}



export class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async publishOrderSuccessful(userId: string, purchaseAmount: number): Promise<void> {
		await this.broker.emit("order.successful", { userId, purchaseAmount });
	}

	async fetchUserBalance(meta: object): Promise<{ balance: number }> {
		// We need to pass the meta object for authentication purposes
		return this.broker.call("gamification.getBalance", {}, { meta });
	}

	async calculateOrderPoints(purchaseAmount: number): Promise<number> {
		return this.broker.call("gamification.calculatePoints", { purchaseAmount });
	}

	async calculateAndSaveOrderPoints(
		purchaseAmount: number,
		meta: object,
	): Promise<{ newPoints: number }> {
		return this.broker.call(
			"gamification.calculateAndSavePoints",
			{ purchaseAmount },
			{ meta },
		);
	}
}
