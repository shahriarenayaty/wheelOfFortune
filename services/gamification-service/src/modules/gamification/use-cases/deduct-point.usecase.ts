import { Errors } from "moleculer";
import type {
	DeductPointsUseCaseDependencies,
	DeductPointsUseCaseParams,
	DeductPointsUseCaseResponse,
} from "../gamification.types";

const { MoleculerClientError } = Errors;

/**
 * Use case for deducting points from a user's balance
 * Validates sufficient balance before performing the deduction
 */
export default class DeductPointsUseCase {
	private readonly dependencies: DeductPointsUseCaseDependencies;

	constructor(dependencies: DeductPointsUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	/**
	 * Executes the point deduction operation
	 * @param params - Contains user information and points to deduct
	 * @returns Promise with the new balance after deduction
	 * @throws MoleculerClientError when user has insufficient points
	 */
	async execute(params: DeductPointsUseCaseParams): Promise<DeductPointsUseCaseResponse> {
		const { gamificationRepository } = this.dependencies;
		const { pointsToDeduct, user } = params;

		// Validate input parameters
		this.validateParams(params);

		// Fetch current point balance
		const point = await gamificationRepository.findPointBalanceByUserId(user.userId);

		// Check if user has any points
		if (!point) {
			this.throwInsufficientPointsError(user.userId, pointsToDeduct, 0);
		}

		const { balance } = point;

		// Validate sufficient balance
		if (balance < pointsToDeduct) {
			this.throwInsufficientPointsError(user.userId, pointsToDeduct, balance);
		}

		// Perform the deduction
		const result = await gamificationRepository.decrementBalance(user.userId, pointsToDeduct);

		return {
			newBalance: result.balance,
		};
	}

	/**
	 * Validates input parameters
	 * @param params - Parameters to validate
	 * @throws MoleculerClientError for invalid parameters
	 */
	private validateParams(params: DeductPointsUseCaseParams): void {
		const { pointsToDeduct, user } = params;

		if (!user?.userId) {
			throw new MoleculerClientError("User ID is required", 500, "INVALID_USER_ID", {
				userId: user?.userId,
			});
		}

		if (!pointsToDeduct || pointsToDeduct <= 0) {
			throw new MoleculerClientError(
				"Points to deduct must be a positive number",
				500,
				"INVALID_POINTS_AMOUNT",
				{ pointsToDeduct },
			);
		}
	}

	/**
	 * Throws a standardized insufficient points error
	 * @param userId - User identifier
	 * @param pointsToDeduct - Points attempted to deduct
	 * @param currentBalance - Current user balance
	 */
	private throwInsufficientPointsError(
		userId: string,
		pointsToDeduct: number,
		currentBalance: number,
	): never {
		throw new MoleculerClientError(
			`Insufficient points. Required: ${pointsToDeduct}, Available: ${currentBalance}`,
			402,
			"INSUFFICIENT_POINTS",
			{
				userId,
				pointsToDeduct,
				currentBalance,
			},
		);
	}
}
