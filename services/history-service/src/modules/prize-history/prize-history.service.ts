import { Service } from "moleculer";
import type { Context, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import type { AuthContext } from "../../common/types/auth.types";
import { config } from "../../config";
import PrizeHistoryRepository from "./prize-history.repository";
import type { IPrizeHistoryRepository, PrizeWonParams } from "./prize-hostory.types";
import GetPrizeHistoryUseCase from "./use-cases/get-prize-history.usecase";
import SavePrizeHistoryUseCase from "./use-cases/save-prize-history.usecase";

export default class PrizeHistoryService extends Service {
	private repository!: IPrizeHistoryRepository;

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "history",
			// --- Service Actions ---
			actions: {
				prize: {
					// No params defined here, as we only need the authenticated user
					authenticated: true,
					handler: this.handlePrizeHistory,
				},
			},
			// --- Service Events ---
			events: {
				"prize.won": {
					signed: true,
					group: "history",
					handler: this.onPrizeWon,
				},
			},

			// --- Service Lifecycle Hooks ---
			created: this.onServiceCreated,
			started: this.onServiceStarted,
			stopped: this.onServiceStopped,
		});
	}

	// --- Action Handlers ---
	private handlePrizeHistory(ctx: AuthContext) {
		const usecase = new GetPrizeHistoryUseCase({
			repository: this.repository,
		});
		return usecase.execute(ctx.meta);
	}

	// --- Event Handlers ---
	private onPrizeWon(ctx: Context<PrizeWonParams>) {
		this.logger.info(`Prize won event received:`, ctx.params);
		const usecase = new SavePrizeHistoryUseCase({
			repository: this.repository,
		});
		return usecase.execute(ctx.params);
	}

	// --- Lifecycle Hooks ---
	private onServiceCreated() {
		this.repository = new PrizeHistoryRepository();
	}

	private async onServiceStarted() {
		const mongoUri = config.MONGO_URI;
		await mongoose.connect(mongoUri);
		this.logger.info("Prize History Service successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
	}
}
