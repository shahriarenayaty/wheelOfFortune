import type { IPrizeHistory, PrizeHistoryDocument } from "./models/schema";

export type ICreatePrizeHistory = Omit<IPrizeHistory, "createdAt" | "updatedAt">;

export interface PrizeWonParams {
	userId: string;
	prizeId: string;
	prizeName: string;
	prizeDetails: Record<string, unknown>;
	timestamp: Date;
	cost: number;
}

export interface GetPrizeHistoryUseCaseDependencies {
	repository: IPrizeHistoryRepository;
}
export interface IPrizeHistoryRepository {
	findByUserIdSorted(userId: string): Promise<PrizeHistoryDocument[]>;
	savePrize(prizeData: ICreatePrizeHistory): Promise<PrizeHistoryDocument>;
}
