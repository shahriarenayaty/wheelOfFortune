import { Errors, Context, Service, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import { GamificationRepository, IGamificationRepository } from "./gamification.repository";
import { GetUserPointsUseCase } from "./use-cases/get-user-points.usecase";
import { RedeemReferralUseCase } from "./use-cases/redeem-referral.usecase";
import { calculatePointsValidator, redeemReferralValidator } from "./gamification.validators";
import { pointModel } from "../../models/points";
import { redeemedReferralModel } from "../../models/redeemed-referral";
import { AuthGateway } from "./auth.gateway";
import { computePoints } from "../../utils/calculate-points";
import { IUser, PrizeWonParams } from "../../utils/user.model";
import {
	CalculateAndSavePointsUseCase,
	CalculatePointsUseCaseParams,
} from "./use-cases/calculate-save-points.usecase";
import { RecordPrizeWonUseCase } from "./use-cases/record-prize-won.uescase";

const { MoleculerClientError } = Errors;

export default class GamificationService extends Service {
	private gamificationRepository!: IGamificationRepository;
	private authGateway!: AuthGateway;

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
				calculatePoints: {
					params: calculatePointsValidator,
					handler: this.calculatePoints,
				},
				calculateAndSavePoints: {
					//userId comes from authenticated context
					params: calculatePointsValidator,
					handler: this.calculateAndSavePoints,
				},
			},

			// --- Service Events ---
			events: {
				"user.registered": {
					group: "gamification", // For balanced consumption
					handler: this.onUserRegistered,
				},
				"prize.won": {
					group: "gamification",
					handler: this.onPrizeWon,
				},
			},
		});
	}

	// --- Action Handlers ---
	private async getBalance(ctx: Context<{}, { user: IUser }>) {
		this.verifyAuth(ctx);
		const useCase = new GetUserPointsUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return useCase.execute(ctx.meta.user.userId);
	}

	private async redeemReferral(ctx: Context<{ code: string }, { user: IUser }>) {
		this.verifyAuth(ctx);
		const useCase = new RedeemReferralUseCase({
			gamificationRepository: this.gamificationRepository,
			authGateway: this.authGateway,
		});
		return useCase.execute({ userId: ctx.meta.user.userId, code: ctx.params.code });
	}

	private async calculatePoints(ctx: Context<CalculatePointsUseCaseParams>) {
		const { purchaseAmount } = ctx.params;
		return computePoints(purchaseAmount);
	}

	private async calculateAndSavePoints(
		ctx: Context<CalculatePointsUseCaseParams, { user: IUser }>,
	) {
		this.verifyAuth(ctx);
		const useCase = new CalculateAndSavePointsUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return useCase.execute(ctx.meta.user.userId, ctx.params.purchaseAmount);
	}

	// --- Event Handlers ---
	private async onUserRegistered(ctx: Context<{ userId: string }>) {
		this.logger.info(`User registered event received for userId: ${ctx.params.userId}`);
		await this.gamificationRepository.incrementBalance(ctx.params.userId, 1);
	}

	private async onPrizeWon(ctx: Context<PrizeWonParams>) {
		this.logger.info(`Prize won event received:`, ctx.params);
		const usecase = new RecordPrizeWonUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return usecase.execute(ctx.params);
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
		this.authGateway = new AuthGateway(this.broker);
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
