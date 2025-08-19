import { Context, Service, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import { GamificationRepository, IGamificationRepository } from "./gamification.repository";
import { GetUserPointsUseCase } from "./use-cases/get-user-points.usecase";
import { RedeemReferralUseCase } from "./use-cases/redeem-referral.usecase";
import { redeemReferralValidator } from "./gamification.validators";
import { pointModel } from "../../models/points";
import { redeemedReferralModel } from "../../models/redeemed-referral";

const { MoleculerClientError } = require("moleculer").Errors;

export default class GamificationService extends Service {
	private gamificationRepository!: IGamificationRepository;

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "gamification",
			// Service's lifecycle hooks
			created: this.onServiceCreated,
			started: this.onServiceStarted,
			stopped: this.onServiceStopped,

			// --- Service Actions ---
			actions: {
				getBalance: {
					// No params needed, userId comes from authenticated context
					handler: this.getBalance,
				},
				redeem: {
					params: redeemReferralValidator,
					handler: this.redeemReferral,
				},
			},

			// --- Service Events ---
			events: {
				"user.registered": {
					group: "gamification", // For balanced consumption
					handler: this.onUserRegistered,
				},
				"order.successful": {
					group: "gamification",
					handler: this.onOrderSuccessful,
				},
			},
		});
	}

	// --- Action Handlers ---
	private async getBalance(ctx: Context<{}, { user: { userId: string } }>) {
		this.verifyAuth(ctx);
		const useCase = new GetUserPointsUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return useCase.execute(ctx.meta.user.userId);
	}

	private async redeemReferral(ctx: Context<{ code: string }, { user: { userId: string } }>) {
		this.verifyAuth(ctx);
		const useCase = new RedeemReferralUseCase({
			gamificationRepository: this.gamificationRepository,
			broker: this.broker,
		});
		return useCase.execute({ userId: ctx.meta.user.userId, code: ctx.params.code });
	}

	// --- Event Handlers ---
	private async onUserRegistered(ctx: Context<{ userId: string }>) {
		this.logger.info(`User registered event received for userId: ${ctx.params.userId}`);
		await this.gamificationRepository.incrementBalance(ctx.params.userId, 1);
	}

	private async onOrderSuccessful(ctx: Context<{ userId: string; purchaseAmount: number }>) {
		this.logger.info(`Order successful event received for userId: ${ctx.params.userId}`);
		const { userId, purchaseAmount } = ctx.params;
		let pointsToAdd = 0;
		if (purchaseAmount > 200000) {
			pointsToAdd = 2;
		} else if (purchaseAmount > 100000) {
			pointsToAdd = 1;
		}

		if (pointsToAdd > 0) {
			await this.gamificationRepository.incrementBalance(userId, pointsToAdd);
			this.logger.info(`Awarded ${pointsToAdd} points to user ${userId}.`);
		}
	}

	// --- Helper Methods ---
	private verifyAuth(ctx: Context<any, any>) {
		if (!ctx.meta.user || !ctx.meta.user.userId) {
			throw new MoleculerClientError("Unauthorized", 401, "UNAUTHORIZED");
		}
	}

	// --- Lifecycle Hooks ---
	private onServiceCreated() {
		// This hook is called when the service instance is created.
		// It's the perfect place to initialize objects that the service will need throughout its lifetime.
		this.gamificationRepository = new GamificationRepository(pointModel, redeemedReferralModel);
	}

	private async onServiceStarted() {
		// This hook is called after the service has been started.
		const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/gamification";
		await mongoose.connect(mongoUri);
		this.logger.info("Successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
		this.logger.info("Disconnected from MongoDB.");
	}
}
