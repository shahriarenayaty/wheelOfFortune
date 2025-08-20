import type { IPrizeHistory } from "./models/schema";

export type ICreatePrizeHistory = Omit<IPrizeHistory, "createdAt" | "updatedAt">;

export interface PrizeWonParams {
	userId: string;
	prizeId: string;
	prizeName: string;
	prizeDetails: Record<string, unknown>;
	timestamp: Date;
	cost: number;
}
