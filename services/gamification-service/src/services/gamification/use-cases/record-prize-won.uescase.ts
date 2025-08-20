import type { PrizeWonParams } from "../../../utils/user.model";
import type { IGamificationRepository } from "../gamification.repository";

export interface RecordPrizeWonUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
}

export class RecordPrizeWonUseCase {
	private dependencies: RecordPrizeWonUseCaseDependencies;

	constructor(dependencies: RecordPrizeWonUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: PrizeWonParams): Promise<void> {
		const { gamificationRepository } = this.dependencies;
		const { userId, cost } = params;
		const point = await gamificationRepository.findPointBalanceByUserId(userId);
		if (point && point.balance >= cost) {
			await gamificationRepository.decrementBalance(userId, cost);
		}
	}
}
