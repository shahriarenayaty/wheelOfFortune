import { Errors } from "moleculer";
import type { IAuth } from "../../../common/types/auth.types";
import type { IPrizeHistoryRepository } from "../prize-history.repository";
import type { ICreatePrizeHistory, PrizeWonParams } from "../prize-hostory.types";

const { MoleculerClientError } = Errors;
interface Dependencies {
	repository: IPrizeHistoryRepository;
}

export default class SavePrizeHistoryUseCase {
	private readonly repository: IPrizeHistoryRepository;

	constructor(dependencies: Dependencies) {
		this.repository = dependencies.repository;
	}

	async execute(params: PrizeWonParams): Promise<void> {
		const { userId, prizeName, timestamp, cost, prizeId, prizeDetails } = params;
		const newPrize: ICreatePrizeHistory = {
			userId,
			prizeId,
			prizeName,
			wonAt: timestamp,
			cost,
			prizeDetails,
		};
		await this.repository.savePrize(newPrize);
	}
}
