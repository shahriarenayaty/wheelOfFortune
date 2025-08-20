export interface IUser {
	userId: string;
}

export interface PrizeWonParams {
	userId: string;
	prizeName: string;
	prizeDetails: Record<string, unknown>;
	timestamp: Date;
	cost: number;
}
