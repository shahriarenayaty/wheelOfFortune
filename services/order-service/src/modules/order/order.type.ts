import type { ParamsFrom } from "../../common/types/validator";
import type { OrderDocument, OrderStatus } from "../../models/order/schema";
import type { createOrderValidator, paymentValidator } from "./order.validators";

// --- Repository
export interface IOrderRepository {
	create(userId: string, amount: number): Promise<OrderDocument>;
	findById(orderId: string): Promise<OrderDocument | null>;
	updateStatus(orderId: string, status: OrderStatus): Promise<OrderDocument | null>;
}

// -- Gamification Gateway
export interface IGamificationGateway {
	publishOrderSuccessful(userId: string, purchaseAmount: number): void;

	fetchUserBalance(meta: object): Promise<{ balance: number }>;

	pointsToAdd(pointsToAdd: number, meta: object): Promise<PointsToAddResponse>;
}

export interface PointsToAddResponse {
	newBalance: number;
}

export interface GetUserPointsUseCaseResponse {
	balance: number;
}

// --- Create Order
export interface CreateOrderUseCaseDependencies {
	orderRepository: IOrderRepository;
}

export interface CreateOrderUseCaseParams {
	amount?: number;
	userId?: string;
}

export type CreateOrderParams = ParamsFrom<typeof createOrderValidator>;
export interface CreateOrderUseCaseResult {
	orderId: string;
	status: string;
	amount: number;
}

// --- Simulate Payment
export interface SimulatePaymentUseCaseDependencies {
	orderRepository: IOrderRepository;
	gamificationGateway: IGamificationGateway;
}

export interface SimulatePaymentUseCaseParams {
	orderId?: string;
	userId?: string;
	meta?: object; // Pass meta for the downstream call
}
export type SimulatePaymentParams = ParamsFrom<typeof paymentValidator>;

export interface PaymentResult {
	success: boolean;
	pointsEarned: number;
	balance: number;
}
