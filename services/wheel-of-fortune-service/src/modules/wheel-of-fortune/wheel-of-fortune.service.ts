import { Errors, Service } from "moleculer";
import type { Context, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import type { IAuth } from "../../common/types/auth.types";
import { config } from "../../config";
import { EventGateway } from "./gateways/event.gateway";
import type { IEventGateway } from "./gateways/event.gateway";
import { GamificationGateway } from "./gateways/gamification.gateway";
import type { IGamificationGateway } from "./gateways/gamification.gateway";
import { HistoryGateway, type IHistoryGateway } from "./gateways/history.gateway";
import SpinWheelUseCase from "./use-cases/spin-wheel.usecase";

const { MoleculerClientError } = Errors;

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
	private async spinWheel(ctx: Context<unknown, IAuth>) {
		this.verifyAuth(ctx);
		const useCase = new SpinWheelUseCase({
			historyGateway: this.historyGateway,
			gamificationGateway: this.gamificationGateway,
			eventGateway: this.eventGateway,
		});
		return useCase.execute(ctx.meta);
	}

	// --- Helper Methods ---
	private verifyAuth(ctx: Context<any, any>) {
		if (!ctx.meta.user || !ctx.meta.user.userId) {
			throw new MoleculerClientError("Unauthorized", 401, "UNAUTHORIZED");
		}
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
