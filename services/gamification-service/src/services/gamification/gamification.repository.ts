import type { Model } from "mongoose";
import type { IPoint, PointDocument } from "../../models/points/schema";
import type { IRedeemedReferral, RedeemedReferralDocument } from "../../models/redeemed-referral/schema";

export interface IGamificationRepository {
	findPointBalanceByUserId(userId: string): Promise<PointDocument | null>;
	incrementBalance(userId: string, amount: number): Promise<PointDocument>;
	hasUserRedeemed(userId: string): Promise<boolean>;
	markAsRedeemed(userId: string, code: string): Promise<RedeemedReferralDocument>;
}

export class GamificationRepository implements IGamificationRepository {
	constructor(
		private pointModel: Model<IPoint>,
		private redeemedReferralModel: Model<IRedeemedReferral>,
	) {}

	public async findPointBalanceByUserId(userId: string): Promise<PointDocument | null> {
		return this.pointModel.findOne({ userId });
	}

	public async incrementBalance(userId: string, amount: number): Promise<PointDocument> {
		return this.pointModel.findOneAndUpdate(
			{ userId },
			{ $inc: { balance: amount } },
			{ new: true, upsert: true }, // Create if it doesn't exist
		);
	}

	public async hasUserRedeemed(userId: string): Promise<boolean> {
		const record = await this.redeemedReferralModel.findOne({ userId });
		return !!record;
	}

	public async markAsRedeemed(userId: string, code: string): Promise<RedeemedReferralDocument> {
		return this.redeemedReferralModel.create({ userId, codeUsed: code });
	}
}
