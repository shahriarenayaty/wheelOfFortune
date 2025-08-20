import type { Context, ServiceBroker } from "moleculer";
import { Errors, Service } from "moleculer";
import mongoose from "mongoose";
import { config } from "../../config";
import { UserRepository } from "./auth.repository";
import type {
	LoginUseCaseParams,
	RegisterUseCaseParams,
	RegisterUseCaseResult,
} from "./auth.types";
import { loginValidator, registerValidator } from "./auth.validators";
import { GamificationGateway } from "./gateways/gamification.gateway";
import { userModel } from "./models/user";
import { LoginUseCase } from "./use-cases/login.usecase";
import { RegisterUseCase } from "./use-cases/register.usecase";

export default class AuthService extends Service {
	private userRepository!: UserRepository;

	private gamificationGateway!: GamificationGateway;

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

	// --- Lifecycle Hooks ---

	private onServiceCreated() {
		this.userRepository = new UserRepository(userModel);
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
