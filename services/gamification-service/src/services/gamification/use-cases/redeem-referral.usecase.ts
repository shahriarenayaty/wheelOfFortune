import { ServiceBroker } from "moleculer";
import { IGamificationRepository } from "../gamification.repository";
const { MoleculerClientError } = require("moleculer").Errors;

export interface RedeemReferralUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
	broker: ServiceBroker;
}

export interface RedeemReferralUseCaseParams {
	userId: string; // The user redeeming the code
	code: string;
}

export class RedeemReferralUseCase {
	constructor(private dependencies: RedeemReferralUseCaseDependencies) {}

	public async execute(params: RedeemReferralUseCaseParams): Promise<{ success: boolean }> {
		const { gamificationRepository, broker } = this.dependencies;
		const { userId, code } = params;

		// 1. Check if the user has already redeemed a code
		const alreadyRedeemed = await gamificationRepository.hasUserRedeemed(userId);
		if (alreadyRedeemed) {
			throw new MoleculerClientError(
				"Referral code already redeemed.",
				409,
				"ALREADY_REDEEMED",
			);
		}

		// 2. Find the owner of the referral code by calling the auth service
		const owners: Array<{ _id: string; referralCode: string }> = await broker.call("auth.find", {
			query: { referralCode: code },
		});

		if (!owners || owners.length === 0) {
			throw new MoleculerClientError("Invalid referral code.", 404, "INVALID_CODE");
		}
		const owner = owners[0];

		// 3. A user cannot redeem their own code
		if (owner._id.toString() === userId) {
			throw new MoleculerClientError(
				"You cannot redeem your own code.",
				400,
				"SELF_REDEMPTION",
			);
		}

		// 4. Award points transactionally (atomically)
		await Promise.all([
			gamificationRepository.incrementBalance(userId, 1), // Award point to redeemer
			gamificationRepository.incrementBalance(owner._id, 1), // Award point to owner
			gamificationRepository.markAsRedeemed(userId, code), // Mark as used for this user
		]);

		return { success: true };
	}
}
