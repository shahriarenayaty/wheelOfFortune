import { Errors, Service } from "moleculer";
import type { Context, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import type { IAuth } from "../../common/types/auth.types";
import { EventGateway } from "./gateways/event.gateway";
import type { IEventGateway } from "./gateways/event.gateway";
import { GamificationGateway } from "./gateways/gamification.gateway";
import type { IGamificationGateway } from "./gateways/gamification.gateway";
import { wonPrizeModel } from "./models/won-prize";
import SpinWheelUseCase from "./use-cases/spin-wheel.usecase";
import { WheelOfFortuneRepository } from "./wheel-of-fortune.repository";
import type { IWheelOfFortuneRepository } from "./wheel-of-fortune.repository";

const { MoleculerClientError } = Errors;

export default class WheelOfFortuneService extends Service {
	private repository!: IWheelOfFortuneRepository;

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
			repository: this.repository,
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
		this.repository = new WheelOfFortuneRepository(wonPrizeModel);
		this.gamificationGateway = new GamificationGateway(this.broker);
		this.eventGateway = new EventGateway(this.broker);
	}

	private async onServiceStarted() {
		const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/orders";
		await mongoose.connect(mongoUri);
		this.logger.info("Order Service successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
	}
}
