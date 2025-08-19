import type { Model } from "mongoose";
import type { IWonPrize, WonPrizeDocument } from "./models/won-prize/schema";
import type { ICreateWonPrize } from "./wheel-of-fortune.types";

export interface IWheelOfFortuneRepository {
	findWonPrizesByUserId(userId: string): Promise<WonPrizeDocument[]>;
	saveWonPrize(prizeData: ICreateWonPrize): Promise<WonPrizeDocument>;
}
export class WheelOfFortuneRepository implements IWheelOfFortuneRepository {
	private prizeModel: Model<IWonPrize>;

	constructor(prizeModel: Model<IWonPrize>) {
		this.prizeModel = prizeModel;
	}

	findWonPrizesByUserId(userId: string): Promise<WonPrizeDocument[]> {
		return this.prizeModel.find({ userId });
	}

	saveWonPrize(prizeData: ICreateWonPrize): Promise<WonPrizeDocument> {
		return this.prizeModel.create(prizeData);
	}
}
