export interface IPrize {
	id: string; // A unique identifier for the prize
	name: string; // The user-facing name (in Persian)
	weight: number;
	unique: boolean;
	detailsGenerator?: () => Record<string, unknown>; // Function to generate dynamic details like a discount code
}

export interface PrizeWonEventPayload {
	userId: string;
	prizeId: string;
	prizeName: string;
	prizeDetails: Record<string, unknown>;
	timestamp: Date;
	cost: number;
}

export interface DeductPointsUseCaseResponse {
	newBalance: number;
}

export interface IPrizeWonHistory {
	_id: string;
	userId: string;
	prizeId: string;
	prizeName: string;
	prizeDetails: Record<string, unknown>;
	wonAt: Date;
	cost: number;
	createdAt: Date;
	updatedAt: Date;
}
export interface ISpinWheelResponse {
	prizeName: string;
	prizeDetails: Record<string, unknown>;
}

export interface IHistoryGateway {
	fetchUserPrizeWon(token: string): Promise<IPrizeWonHistory[]>;
}

export interface IGamificationGateway {
	deductPoints(pointsToDeduct: number, token: string): Promise<DeductPointsUseCaseResponse>;
}

export interface IEventGateway {
	publishPrizeWon(prizeWon: PrizeWonEventPayload): Promise<void>;
}
