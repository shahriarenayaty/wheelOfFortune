import { Errors } from "moleculer";
import { OrderStatus } from "../../../models/order/schema";
import type { IGamificationGateway } from "../gamification.gateway";
import type { IOrderRepository } from "../order.repository";
import computePoints from "../../../utils/calculate-points";

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
	balance: number;
}

export class SimulatePaymentUseCase {
	private dependencies: SimulatePaymentUseCaseDependencies;

	constructor(dependencies: SimulatePaymentUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	/**
	 * Simulates a payment for an order, updates the order status, calculates points earned,
	 * interacts with the gamification service to update or fetch the user's points balance,
	 * and publishes an event to notify other services.
	 *
	 * @remarks
	 * This approach tightly couples the Order service to the Gamification service by requiring
	 * the Order service to call the Gamification API to fetch or update the user's points balance.
	 * This is generally not recommended, as it introduces inter-service dependencies and can
	 * lead to cascading failures or increased latency.
	 *
	 * A better approach is to use the "Client Pull" method, where the Order service simply returns
	 * the points earned in its response. The client UI can then display the points earned and make
	 * a separate, asynchronous call to the Gamification service (e.g., `GET /api/gamification/balance`)
	 * to refresh the user's total points. This pattern is reliable, simple, and widely used.
	 *
	 * For a more advanced, real-time experience, the "Server Push" method can be used. In this pattern,
	 * after the Gamification service updates the user's balance, it emits a `points.updated` event.
	 * A WebSocket gateway can listen for this event and push the new balance directly to the connected
	 * client's UI, eliminating the need for the client to poll for updates.
	 *
	 * @param params - The parameters required to simulate the payment.
	 * @returns A promise that resolves to the payment result, including points earned and the new total balance.
	 * @throws {MoleculerClientError} If the order is not found, the user is forbidden, or the order is already processed.
	 */
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

		let balance = 0;

		// 3. Calculate points earned locally
		const pointsEarned = computePoints(order.amountInToman);

		// 4. If points are earned, call the gamification service to add points
		// And if not, fetch the user's current balance
		if (pointsEarned > 0) {
			const pointsToAddResponse = await gamificationGateway.pointsToAdd(pointsEarned, meta);
			balance = pointsToAddResponse.newBalance;
		} else {
			const balanceResponse = await gamificationGateway.fetchUserBalance(meta);
			balance = balanceResponse.balance;
		}

		// 4. Publish the event to notify other services
		gamificationGateway.publishOrderSuccessful(userId, order.amountInToman);

		// 5. Return the detailed response
		return {
			success: true,
			pointsEarned,
			balance,
		};
	}
}
