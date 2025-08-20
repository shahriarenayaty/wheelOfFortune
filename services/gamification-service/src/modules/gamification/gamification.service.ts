import { Errors, Service } from "moleculer";
import type { Context, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import type { IAuth } from "../../common/types/user.model";
import { config } from "../../config";
import { pointModel } from "../../models/points";
import { redeemedReferralModel } from "../../models/redeemed-referral";
import GamificationRepository from "./gamification.repository";
import type {
	DeductPointsParams,
	IAuthGateway,
	IGamificationRepository,
	PointsToAddParams,
	RedeemReferralUseCaseParams,
} from "./gamification.types";
import {
	deductPointsValidator,
	pointsToAddValidator,
	redeemReferralValidator,
} from "./gamification.validators";
import AuthGateway from "./gateways/auth.gateway";
import DeductPointsUseCase from "./use-cases/deduct-point.usecase";
import GetUserPointsUseCase from "./use-cases/get-user-points.usecase";
import PointsToAddUseCase from "./use-cases/points-to-add.usecase";
import RedeemReferralUseCase from "./use-cases/redeem-referral.usecase";

const { MoleculerClientError } = Errors;

export default class GamificationService extends Service {
	private gamificationRepository!: IGamificationRepository;

	private authGateway!: IAuthGateway;

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
				pointsToAdd: {
					// userId comes from authenticated context
					params: pointsToAddValidator,
					handler: this.handlePointsToAdd,
				},
				deductPoints: {
					// userId comes from authenticated context
					params: deductPointsValidator,
					handler: this.handleDeductPoints,
				},
			},

			// --- Service Events ---
			events: {
				"user.registered": {
					group: "gamification", // For balanced consumption
					handler: this.onUserRegistered,
				},
			},
		});
	}

	// --- Action Handlers ---
	private async getBalance(ctx: Context<unknown, IAuth>) {
		this.verifyAuth(ctx);
		const useCase = new GetUserPointsUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return useCase.execute({ userId: ctx.meta.user.userId });
	}

	private async redeemReferral(ctx: Context<RedeemReferralUseCaseParams, IAuth>) {
		this.verifyAuth(ctx);
		const useCase = new RedeemReferralUseCase({
			gamificationRepository: this.gamificationRepository,
			authGateway: this.authGateway,
		});
		return useCase.execute({ userId: ctx.meta.user.userId, code: ctx.params.code });
	}

	private async handlePointsToAdd(ctx: Context<PointsToAddParams, IAuth>) {
		this.verifyAuth(ctx);
		const useCase = new PointsToAddUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return useCase.execute({
			pointsToAdd: ctx.params.pointsToAdd,
			user: ctx.meta.user,
		});
	}

	private async handleDeductPoints(ctx: Context<DeductPointsParams, IAuth>) {
		this.verifyAuth(ctx);
		const useCase = new DeductPointsUseCase({
			gamificationRepository: this.gamificationRepository,
		});
		return useCase.execute({
			pointsToDeduct: ctx.params.pointsToDeduct,
			user: ctx.meta.user,
		});
	}

	// --- Event Handlers ---
	private async onUserRegistered(ctx: Context<{ userId: string }>) {
		this.logger.info(`User registered event received for userId: ${ctx.params.userId}`);
		await this.gamificationRepository.incrementBalance(ctx.params.userId, 1);
	}

	// --- Helper Methods ---
	private verifyAuth(ctx: Context<unknown, IAuth>) {
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
		const mongoUri = config.MONGO_URI;
		await mongoose.connect(mongoUri);
		this.logger.info("Successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
		this.logger.info("Disconnected from MongoDB.");
	}
}
