import { Service } from "moleculer";
import type { ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import type { AuthContext } from "../../common/types/auth.types";
import { config } from "../../config";
import EventGateway from "./gateways/event.gateway";
import GamificationGateway from "./gateways/gamification.gateway";
import HistoryGateway from "./gateways/history.gateway";
import SpinWheelUseCase from "./use-cases/spin-wheel.usecase";
import type {
	IEventGateway,
	IGamificationGateway,
	IHistoryGateway,
} from "./wheel-of-fortune.types";

export default class WheelOfFortuneService extends Service {
	private historyGateway!: IHistoryGateway;

	private gamificationGateway!: IGamificationGateway;

	private eventGateway!: IEventGateway;

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "wheel-of-fortune",
			actions: {
				spin: {
					// No params defined here, as we only need the authenticated user
					authenticated: true,
					handler: this.spinWheel,
				},
			},
			created: this.onServiceCreated,
			started: this.onServiceStarted,
			stopped: this.onServiceStopped,
		});
	}

	/**
	 * Orchestrates the spin wheel action. It translates the incoming request
	 * into a command for the use case.
	 */
	// --- Action Handlers ---
	private async spinWheel(ctx: AuthContext) {
		const useCase = new SpinWheelUseCase({
			historyGateway: this.historyGateway,
			gamificationGateway: this.gamificationGateway,
			eventGateway: this.eventGateway,
		});
		return useCase.execute(ctx.meta);
	}

	// --- Lifecycle Hooks ---
	private onServiceCreated() {
		this.historyGateway = new HistoryGateway(this.broker);
		this.gamificationGateway = new GamificationGateway(this.broker);
		this.eventGateway = new EventGateway(this.broker);
	}

	private async onServiceStarted() {
		const mongoUri = config.MONGO_URI;
		await mongoose.connect(mongoUri);
		this.logger.info("Wheel of Fortune Service successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
	}
}
