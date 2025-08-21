import { type ServiceBroker } from "moleculer";
import generateSign from "../../../common/utils/generate-sign";
import { config } from "../../../config";

export interface IGamificationGateway {
	notifyUserRegistered(userId: string): Promise<void>;
}

export class GamificationGateway implements IGamificationGateway {
	private broker: ServiceBroker;

	constructor(broker: ServiceBroker) {
		this.broker = broker;
	}

	async notifyUserRegistered(userId: string): Promise<void> {
		const sign = await generateSign({ userId });

		await this.broker.emit("user.registered", { jws: sign });
	}
}
