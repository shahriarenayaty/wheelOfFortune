import type { Context, ServiceBroker } from "moleculer";
import { Errors, Service } from "moleculer";
import DbService from "moleculer-db";
import MongooseDbAdapter from "moleculer-db-adapter-mongoose";
import { userModel } from "../../src/models/user";
import type { UserDocument } from "../../src/models/user/schema";
import { UserRepository } from "./auth.repository";
import { loginValidator, registerValidator } from "./auth.validators";
import { GamificationGateway } from "./gamification.gateway";
import { LoginUseCase, type LoginUseCaseParams } from "./use-cases/login.usecase";
import { RegisterUseCase, type RegisterUseCaseParams } from "./use-cases/register.usecase";

const { MoleculerClientError } = Errors;

export default class AuthService extends Service {
	// Adapter for the moleculer-db mixin
	private adapter: MongooseDbAdapter<UserDocument> = new MongooseDbAdapter(
		process.env.MONGO_URI || "mongodb://localhost:27017/wheelOfFortune",
	);

	private userRepository!: UserRepository;

	private gamificationGateway!: GamificationGateway;

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "auth",
			// Use the DbService mixin
			mixins: [DbService],
			adapter: this.adapter,
			model: userModel,

			// Service-specific settings

			settings: {
				// Exclude the password field from default responses
				// effectively hiding sensitive data like the user's password
				fields: ["_id", "phone", "referralCode"],
			},

			/**
			 * The 'created' hook is called when the service instance is created.
			 * It's the perfect place to initialize objects that the service will need throughout its lifetime.
			 */
			created: () => {
				// Now, the repository is created only ONCE per service instance.
				this.userRepository = new UserRepository(this.adapter);
				this.gamificationGateway = new GamificationGateway(this.broker);
			},

			/**
			 * The 'started' hook is called after the service has been started.
			 * It's a great place to validate configuration and environment variables.
			 */
			started: () => {},

			// Service actions
			actions: {
				register: {
					params: registerValidator,
					handler: async (
						ctx: Context<RegisterUseCaseParams>,
					): Promise<{ token: string; referralCode: string }> => {
						const useCase = new RegisterUseCase({
							userRepository: this.userRepository,
							gamificationGateway: this.gamificationGateway,
						});

						return useCase.execute(ctx.params);
					},
				},

				login: {
					params: loginValidator,
					async handler(ctx: Context<LoginUseCaseParams>): Promise<{ token: string }> {
						const useCase = new LoginUseCase({
							userRepository: this.userRepository,
						});

						// 2. Execute the use case with the validated parameters
						return useCase.execute(ctx.params);
					},
				},
			},
		});
	}
}
