import { Errors } from "moleculer";
import type { IAuth } from "../../../common/types/auth.types";
import PRIZE_POOL from "../constants/prize-pool.constants";
import type { IEventGateway } from "../gateways/event.gateway";
import type { IGamificationGateway } from "../gateways/gamification.gateway";
import type { IHistoryGateway } from "../gateways/history.gateway";
import type { IPrize, ISpinWheelResponse } from "../wheel-of-fortune.types";

const { MoleculerClientError } = Errors;
interface Dependencies {
	gamificationGateway: IGamificationGateway;
	eventGateway: IEventGateway;
	historyGateway: IHistoryGateway;
}

export default class SpinWheelUseCase {
	private readonly historyGateway: IHistoryGateway;

	private readonly gamificationGateway: IGamificationGateway;

	private readonly eventGateway: IEventGateway;

	constructor(dependencies: Dependencies) {
		this.historyGateway = dependencies.historyGateway;
		this.gamificationGateway = dependencies.gamificationGateway;
		this.eventGateway = dependencies.eventGateway;
	}

	async execute(params: IAuth): Promise<ISpinWheelResponse> {
		const { user } = params;

		// 1. Consume 1 point. This will throw an error if the user has insufficient points.
		const { balance } = await this.gamificationGateway.fetchUserBalance(params);
		if (balance < 1) {
			throw new MoleculerClientError(
				"Insufficient points to spin the wheel.",
				400,
				"INSUFFICIENT_POINTS",
				{
					userId: user.userId,
				},
			);
		}

		// 2. Fetch the user's prize history to determine available prizes.
		const wonPrizes = await this.historyGateway.fetchUserPrizeWon(params);
		const activeWonPrizeIds = new Set(
			wonPrizes
				.map((p) => p.prizeId)
				.filter((prizeId) => {
					// This ensures that we only consider prizes that are still part of the current game.
					const prizeInPool = PRIZE_POOL.find((p) => p.id === prizeId);
					return prizeInPool && prizeInPool.unique;
				}),
		);

		// 3. Dynamically calculate the prize pool for this specific user.
		const availablePrizes = PRIZE_POOL.filter((prize) => !activeWonPrizeIds.has(prize.id));

		if (availablePrizes.length === 0) {
			// This happens if a user has won all one-time prizes.
			// The point is already spent, as per the "spin" action.
			throw new MoleculerClientError(
				"You have already won all available unique prizes. Better luck next time!",
				400,
				"NO_AVAILABLE_PRIZES",
				{
					userId: user.userId,
				},
			);
		}

		// 4. Perform the weighted random spin on the available prizes.
		const winner = this.getWeightedRandomPrize(availablePrizes);

		// 5. Generate prize details (e.g., a unique discount code).
		const prizeDetails = winner.detailsGenerator ? winner.detailsGenerator() : {};

	
		// 6. Publish a prize.won event.
		await this.eventGateway.publishPrizeWon({
			userId: user.userId,
			prizeName: winner.name,
			prizeId: winner.id,
			prizeDetails,
			timestamp: new Date(),
			cost: 1, // The cost of spinning the wheel is always 1 point
		});

		// 8. Return the result to the user.
		return {
			prizeName: winner.name,
			prizeDetails,
		};
	}

	private getWeightedRandomPrize(prizes: IPrize[]): IPrize {
		const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
		// We scale this random number up to our range. The result will be a random number between 0 and totalWeight
		let random = Math.random() * totalWeight;

		const probabilities = prizes.map((p) => ({
			name: p.name,
			probability: `${((p.weight / totalWeight) * 100).toFixed(2)}%`,
		}));



        // eslint-disable-next-line no-console
		console.table(probabilities);

		for (const prize of prizes) {
			if (random < prize.weight) {
				return prize;
			}
			random -= prize.weight;
		}
		// Fallback in case of floating point inaccuracies
		return prizes[prizes.length - 1];
	}
}
