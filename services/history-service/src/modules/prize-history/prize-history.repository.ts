import type { Model } from "mongoose";
import type { IPrizeHistory, PrizeHistoryDocument } from "./models/schema";
import type { ICreatePrizeHistory } from "./prize-hostory.types";

export interface IPrizeHistoryRepository {
	findByUserIdSorted(userId: string): Promise<PrizeHistoryDocument[]>;
	savePrize(prizeData: ICreatePrizeHistory): Promise<PrizeHistoryDocument>;
}
export class PrizeHistoryRepository implements IPrizeHistoryRepository {
	private prizeModel: Model<IPrizeHistory>;

	constructor(prizeModel: Model<IPrizeHistory>) {
		this.prizeModel = prizeModel;
	}

	findByUserIdSorted(userId: string): Promise<PrizeHistoryDocument[]> {
		return this.prizeModel.find({ userId }).sort({ wonAt: -1 });
	}

	savePrize(prizeData: ICreatePrizeHistory): Promise<PrizeHistoryDocument> {
		return this.prizeModel.create(prizeData);
	}
}
