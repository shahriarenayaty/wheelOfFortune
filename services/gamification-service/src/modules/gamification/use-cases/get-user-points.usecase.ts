import type {
	GetUserPointsUseCaseDependencies,
	GetUserPointsUseCaseParams,
	GetUserPointsUseCaseResponse,
} from "../gamification.types";

export default class GetUserPointsUseCase {
	private dependencies: GetUserPointsUseCaseDependencies;

	constructor(dependencies: GetUserPointsUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: GetUserPointsUseCaseParams): Promise<GetUserPointsUseCaseResponse> {
		const { userId } = params;
		const { gamificationRepository } = this.dependencies;
		const pointsDoc = await gamificationRepository.findPointBalanceByUserId(userId);
		return { balance: pointsDoc?.balance ?? 0 };
	}
}
