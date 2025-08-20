import { type ServiceBroker } from "moleculer";

export interface IGamificationGateway {
	notifyUserRegistered(userId: string): Promise<void>;
}

export class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async notifyUserRegistered(userId: string): Promise<void> {
		await this.broker.emit("user.registered", { userId });
	}
}
