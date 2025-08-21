import type { Model } from "mongoose";
import { prizeHistoryModel } from "./models";
import type { IPrizeHistory, PrizeHistoryDocument } from "./models/schema";
import type { ICreatePrizeHistory, IPrizeHistoryRepository } from "./prize-hostory.types";

export default class PrizeHistoryRepository implements IPrizeHistoryRepository {
	private prizeModel: Model<IPrizeHistory>;

	constructor() {
		this.prizeModel = prizeHistoryModel;
	}

	findByUserIdSorted(userId: string): Promise<PrizeHistoryDocument[]> {
		return this.prizeModel.find({ userId }).sort({ wonAt: -1 });
	}

	savePrize(prizeData: ICreatePrizeHistory): Promise<PrizeHistoryDocument> {
		return this.prizeModel.create(prizeData);
	}
}
