import type { Context, ServiceBroker } from "moleculer";
import { Service } from "moleculer";
import mongoose from "mongoose";
import type { AuthMeta } from "../../common/types/auth";
import { config } from "../../config";
import UserRepository from "./auth.repository";
import type {
	IGamificationGateway,
	IUserRepository,
	LoginUseCaseParams,
	RegisterUseCaseParams,
	RegisterUseCaseResult,
	ResolveReferralParams,
	ResolveReferralUseCaseResponse,
} from "./auth.types";
import { loginValidator, registerValidator, resolveReferralValidator } from "./auth.validators";
import GamificationGateway from "./gateways/gamification.gateway";
import LoginUseCase from "./use-cases/login.usecase";
import RegisterUseCase from "./use-cases/register.usecase";
import ResolveReferralUseCase from "./use-cases/resolve-referral.usercas";

export default class AuthService extends Service {
	private userRepository!: IUserRepository;

	private gamificationGateway!: IGamificationGateway;

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "auth",

			// --- Service Actions ---
			actions: {
				register: {
					params: registerValidator,
					handler: this.handleRegister,
				},

				login: {
					params: loginValidator,
					handler: this.handleLogin,
				},
				// findUserByReferralCode
				resolveReferral: {
					authenticated: true,
					params: resolveReferralValidator,
					handler: this.handleResolveReferral,
				},
			},
			// --- Service Lifecycle Hooks ---
			created: this.onServiceCreated,
			started: this.onServiceStarted,
			stopped: this.onServiceStopped,
		});
	}

	// --- Action Handlers ---
	private async handleRegister(
		ctx: Context<RegisterUseCaseParams>,
	): Promise<RegisterUseCaseResult> {
		const useCase = new RegisterUseCase({
			userRepository: this.userRepository,
			gamificationGateway: this.gamificationGateway,
		});

		return useCase.execute(ctx.params);
	}

	private async handleLogin(ctx: Context<LoginUseCaseParams>): Promise<{ token: string }> {
		const useCase = new LoginUseCase({
			userRepository: this.userRepository,
		});

		return useCase.execute(ctx.params);
	}

	private async handleResolveReferral(
		ctx: Context<ResolveReferralParams, AuthMeta>,
	): Promise<ResolveReferralUseCaseResponse> {
		const useCase = new ResolveReferralUseCase({
			userRepository: this.userRepository,
		});
		return useCase.execute(ctx.params);
	}

	// --- Lifecycle Hooks ---

	private onServiceCreated() {
		this.userRepository = new UserRepository();
		this.gamificationGateway = new GamificationGateway(this.broker);
	}

	private async onServiceStarted() {
		const mongoUri = config.MONGO_URI;
		await mongoose.connect(mongoUri);
		this.logger.info("Auth Service successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
	}
}
