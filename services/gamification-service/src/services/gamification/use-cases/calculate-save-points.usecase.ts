import { computePoints } from "../../../utils/calculate-points";
import { IGamificationRepository } from "../gamification.repository";

export interface CalculateAndSavePointsUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
}

export interface CalculateAndSavePointsResponse {
	newPoints: number;
}
export interface CalculatePointsUseCaseParams {
	purchaseAmount: number;
}

export class CalculateAndSavePointsUseCase {
	constructor(private dependencies: CalculateAndSavePointsUseCaseDependencies) {}

	public async execute(userId: string, amount: number): Promise<CalculateAndSavePointsResponse> {
		const { gamificationRepository } = this.dependencies;
		const pointsToAdd = computePoints(amount);
		if (pointsToAdd > 0) {
			await gamificationRepository.incrementBalance(userId, pointsToAdd);
		}

		return { newPoints: pointsToAdd };
	}
}
