import type { IAuth } from "../../../common/types/auth.types";
import type { PrizeHistoryDocument } from "../models/schema";
import type { IPrizeHistoryRepository } from "../prize-history.repository";

export interface GetPrizeHistoryUseCaseDependencies {
	repository: IPrizeHistoryRepository;
}

export class GetPrizeHistoryUseCase {
	private dependencies: GetPrizeHistoryUseCaseDependencies;

	constructor(dependencies: GetPrizeHistoryUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: IAuth): Promise<PrizeHistoryDocument[]> {
		const { user } = params;
		const { repository } = this.dependencies;
		const prizeHistory = await repository.findByUserIdSorted(user.userId);
		return prizeHistory;
	}
}
