import { Errors } from "moleculer";
import type {
	GetUserPointsUseCaseDependencies,
	GetUserPointsUseCaseParams,
	GetUserPointsUseCaseResponse,
} from "../gamification.types";

const { MoleculerClientError } = Errors;

export default class GetUserPointsUseCase {
	private dependencies: GetUserPointsUseCaseDependencies;

	constructor(dependencies: GetUserPointsUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: GetUserPointsUseCaseParams): Promise<GetUserPointsUseCaseResponse> {
		const { userId } = params;
		if (!userId) {
			throw new MoleculerClientError("User ID is required", 400, "BAD_REQUEST");
		}
		const { gamificationRepository } = this.dependencies;
		const pointsDoc = await gamificationRepository.findPointBalanceByUserId(userId);
		return { balance: pointsDoc?.balance ?? 0 };
	}
}
