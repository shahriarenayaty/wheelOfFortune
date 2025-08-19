import type { IWonPrize } from "./models/won-prize/schema";

export interface IPrize {
	id: string; // A unique identifier for the prize
	name: string; // The user-facing name (in Persian)
	weight: number;
	detailsGenerator?: () => Record<string, unknown>; // Function to generate dynamic details like a discount code
}

export interface PrizeWonEventPayload {
	userId: string;
	prizeName: string;
	prizeDetails: Record<string, unknown>;
	timestamp: Date;
}

export type ICreateWonPrize = Omit<IWonPrize, "createdAt" | "updatedAt">;
