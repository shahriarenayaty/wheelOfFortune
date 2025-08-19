import { Errors } from "moleculer";
import { OrderStatus } from "../../../models/order/schema";
import type { IGamificationGateway } from "../gamification.gateway";
import type { IOrderRepository } from "../order.repository";

const { MoleculerClientError } = Errors;

export interface SimulatePaymentUseCaseDependencies {
	orderRepository: IOrderRepository;
	gamificationGateway: IGamificationGateway;
}

export interface SimulatePaymentUseCaseParams {
	orderId: string;
	userId: string;
	meta: object; // Pass meta for the downstream call
}
export interface SimulatePaymentUseCaseInputParams {
	orderId: string;
}

interface PaymentResult {
	success: boolean;
	pointsEarned: number;
	newTotalBalance: number;
}

export class SimulatePaymentUseCase {
	private dependencies: SimulatePaymentUseCaseDependencies;

	constructor(dependencies: SimulatePaymentUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: SimulatePaymentUseCaseParams): Promise<PaymentResult> {
		const { orderRepository, gamificationGateway } = this.dependencies;
		const { orderId, userId, meta } = params;

		// 1. Find and validate the order
		const order = await orderRepository.findById(orderId);
		if (!order) {
			throw new MoleculerClientError("Order not found.", 404, "ORDER_NOT_FOUND");
		}
		if (order.userId.toString() !== userId) {
			throw new MoleculerClientError("Forbidden.", 403, "FORBIDDEN_ORDER");
		}
		if (order.status !== OrderStatus.PENDING) {
			throw new MoleculerClientError("Order already processed.", 409, "ORDER_PROCESSED");
		}

		// 2. Update order status to 'successful'
		await orderRepository.updateStatus(orderId, OrderStatus.SUCCESSFUL);

		// // 3. Publish the event to notify other services (like gamification)
		// gamificationGateway.publishOrderSuccessful(userId, order.amount);

		// 4. Calculate points earned locally
		const pointsEarned = await gamificationGateway.calculateAndSaveOrderPoints(
			order.amount,
			meta,
		);

		// 5. Call the Gamification service to get the NEW total balance
		// This call happens AFTER the event is published, ensuring the balance is up-to-date.
		const balanceResponse = await gamificationGateway.fetchUserBalance(meta);

		// 6. Return the detailed response
		return {
			success: true,
			pointsEarned: pointsEarned.newPoints,
			newTotalBalance: balanceResponse.balance,
		};
	}
}
