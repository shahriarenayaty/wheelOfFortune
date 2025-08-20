import type { Model } from "mongoose";
import type {
	IGamificationRepository,
	IPoint,
	IRedeemedReferral,
	PointDocument,
	RedeemedReferralDocument,
} from "./gamification.types";

export default class GamificationRepository implements IGamificationRepository {
	private pointModel: Model<IPoint>;

	private redeemedReferralModel: Model<IRedeemedReferral>;

	constructor(pointModel: Model<IPoint>, redeemedReferralModel: Model<IRedeemedReferral>) {
		this.pointModel = pointModel;
		this.redeemedReferralModel = redeemedReferralModel;
	}

	async findPointBalanceByUserId(userId: string): Promise<PointDocument | null> {
		return this.pointModel.findOne({ userId });
	}

	async incrementBalance(userId: string, amount: number): Promise<PointDocument> {
		return this.pointModel.findOneAndUpdate(
			{ userId },
			{ $inc: { balance: amount } },
			{ new: true, upsert: true }, // Create if it doesn't exist
		);
	}

	async decrementBalance(userId: string, amount: number): Promise<PointDocument> {
		return this.pointModel.findOneAndUpdate(
			{ userId },
			{ $inc: { balance: -amount } },
			{ new: true, upsert: true },
		);
	}

	async hasUserRedeemed(userId: string): Promise<boolean> {
		const record = await this.redeemedReferralModel.findOne({ userId });
		return !!record;
	}

	async markAsRedeemed(userId: string, code: string): Promise<RedeemedReferralDocument> {
		return this.redeemedReferralModel.create({ userId, codeUsed: code });
	}
}
