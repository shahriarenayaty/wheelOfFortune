import type { HydratedDocument, InferSchemaType } from "mongoose";
import type { IAuth } from "../../common/types/user.model";
import type { ParamsFrom } from "../../common/types/validator";
import type pointSchema from "../../models/points/schema";
import type redeemedReferralSchema from "../../models/redeemed-referral/schema";
import type { deductPointsValidator, pointsToAddValidator } from "./gamification.validators";

// --- Points Type
export type IPoint = InferSchemaType<typeof pointSchema>;

export type PointDocument = HydratedDocument<IPoint>;

// --- RedeemedReferral Types ----
export type IRedeemedReferral = InferSchemaType<typeof redeemedReferralSchema>;
export type RedeemedReferralDocument = HydratedDocument<IRedeemedReferral>;

// --- PointsToAdd Types ----
export interface PointsToAddDependencies {
	gamificationRepository: IGamificationRepository;
}

export type PointsToAddParams = ParamsFrom<typeof pointsToAddValidator>;

export interface PointsToAddUseCaseParams extends PointsToAddParams, IAuth {}

export interface PointsToAddUseCaseResponse {
	newBalance: number;
}

// --- GetUserPoints Types ----
export interface GetUserPointsUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
}

export interface GetUserPointsUseCaseParams {
	userId: string;
}

export interface GetUserPointsUseCaseResponse {
	balance: number;
}

// --- DeductPoints Types ----
export interface DeductPointsUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
}

export type DeductPointsParams = ParamsFrom<typeof deductPointsValidator>;

export interface DeductPointsUseCaseParams extends DeductPointsParams, IAuth {}

export interface DeductPointsUseCaseResponse {
	newBalance: number;
}

// --- RedeemReferral Types ----
export interface RedeemReferralUseCaseDependencies {
	gamificationRepository: IGamificationRepository;
	authGateway: IAuthGateway;
}

export interface RedeemReferralUseCaseParams {
	userId: string;
	code: string;
}

export interface RedeemReferralUseCaseResponse {
	success: boolean;
	ownerPhone: string;
}

// --- IAuthGateway Types ----
export interface IAuthGateway {
	findUserByReferralCode(code: string): Promise<User | null>;
}

export interface User {
	_id: string;
	phone: string;
}

// --- IGamificationRepository Types ----
export interface IGamificationRepository {
	findPointBalanceByUserId(userId: string): Promise<PointDocument | null>;
	incrementBalance(userId: string, amount: number): Promise<PointDocument>;
	decrementBalance(userId: string, amount: number): Promise<PointDocument>;
	hasUserRedeemed(userId: string): Promise<boolean>;
	markAsRedeemed(userId: string, code: string): Promise<RedeemedReferralDocument>;
}
