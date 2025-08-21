import type { HydratedDocument, InferSchemaType } from "mongoose";
import type { IAuth } from "../../common/types/user.model";
import type { ParamsFrom } from "../../common/types/validator";
import type {
	deductPointsValidator,
	pointsToAddValidator,
	redeemReferralValidator,
} from "./gamification.validators";
import type AuthGateway from "./gateways/auth.gateway";
import type pointSchema from "./models/points/schema";
import type redeemedReferralSchema from "./models/redeemed-referral/schema";

// --- Points Type
export type IPoint = InferSchemaType<typeof pointSchema>;

export type PointDocument = HydratedDocument<IPoint>;

// --- RedeemedReferral Types ----
export type IRedeemedReferral = InferSchemaType<typeof redeemedReferralSchema>;
export type RedeemedReferralDocument = HydratedDocument<IRedeemedReferral>;
export type User = {
	id: string;
	phone: string;
	referralCode?: string;
};

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
	userId?: string;
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
	token?: string;
}

export type RedeemReferralParams = ParamsFrom<typeof redeemReferralValidator>;
export interface RedeemReferralUseCaseParams {
	userId?: string;
	code?: string;
	token?: string;
}

export interface RedeemReferralUseCaseResponse {
	success: boolean;
	ownerPhone: string;
}

// --- IAuthGateway Types ----
export interface IAuthGateway {
	findUserByReferralCode(code: string, token?: string): Promise<User | null>;
}

// --- IGamificationRepository Types ----
export interface IGamificationRepository {
	findPointBalanceByUserId(userId: string): Promise<PointDocument | null>;
	incrementBalance(userId: string, amount: number): Promise<PointDocument>;
	decrementBalance(userId: string, amount: number): Promise<PointDocument>;
	hasUserRedeemed(userId: string): Promise<boolean>;
	markAsRedeemed(userId: string, code: string): Promise<RedeemedReferralDocument>;
}
