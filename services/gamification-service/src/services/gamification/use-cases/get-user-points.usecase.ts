import { IGamificationRepository } from "../gamification.repository";

export interface GetUserPointsUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
}

export class GetUserPointsUseCase {
	constructor(private dependencies: GetUserPointsUseCaseDependencies) {}

	public async execute(userId: string): Promise<{ balance: number }> {
		const { gamificationRepository } = this.dependencies;
		const pointsDoc = await gamificationRepository.findPointBalanceByUserId(userId);
		return { balance: pointsDoc?.balance ?? 0 };
	}
}
