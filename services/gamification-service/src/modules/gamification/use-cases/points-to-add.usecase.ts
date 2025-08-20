import type {
	PointsToAddDependencies,
	PointsToAddUseCaseParams,
	PointsToAddUseCaseResponse,
} from "../gamification.types";

export default class PointsToAddUseCase {
	private dependencies: PointsToAddDependencies;

	constructor(dependencies: PointsToAddDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: PointsToAddUseCaseParams): Promise<PointsToAddUseCaseResponse> {
		const { user, pointsToAdd } = params;
		const { gamificationRepository } = this.dependencies;
		const userPoints = await gamificationRepository.findPointBalanceByUserId(user.userId);
		let newBalance = userPoints?.balance ?? 0;
		if (pointsToAdd > 0) {
			const result = await gamificationRepository.incrementBalance(user.userId, pointsToAdd);
			newBalance = result.balance;
		}

		return { newBalance };
	}
}
