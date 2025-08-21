import { Service } from "moleculer";
import type { Context, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import type { AuthMeta } from "../../common/types/auth";
import { config } from "../../config";
import GamificationGateway from "./gateway/gamification.gateway";
import OrderRepository from "./order.repository";
import type { CreateOrderParams, IOrderRepository, SimulatePaymentParams } from "./order.type";
import { createOrderValidator, paymentValidator } from "./order.validators";
import CreateOrderUseCase from "./use-cases/create-order.usecase";
import SimulatePaymentUseCase from "./use-cases/simulate-payment.usecase";

export default class OrderService extends Service {
	private orderRepository!: IOrderRepository;

	private gamificationGateway!: GamificationGateway;

	constructor(broker: ServiceBroker) {
		super(broker);

		this.parseServiceSchema({
			name: "order",
			created: this.onServiceCreated,
			started: this.onServiceStarted,
			stopped: this.onServiceStopped,

			actions: {
				create: {
					params: createOrderValidator,
					handler: this.createOrder,
				},
				pay: {
					params: paymentValidator,
					handler: this.simulatePayment,
				},
			},
		});
	}

	// --- Action Handlers ---
	private async createOrder(ctx: Context<CreateOrderParams, AuthMeta>) {
		const useCase = new CreateOrderUseCase({
			orderRepository: this.orderRepository,
		});
		return useCase.execute({
			amount: ctx.params.amount,
			userId: ctx.meta.user?.userId,
		});
	}

	private async simulatePayment(ctx: Context<SimulatePaymentParams, AuthMeta>) {
		const useCase = new SimulatePaymentUseCase({
			orderRepository: this.orderRepository,
			gamificationGateway: this.gamificationGateway,
		});
		return useCase.execute({
			orderId: ctx.params.orderId,
			userId: ctx.meta.user?.userId,
			meta: ctx.meta, // Pass the whole meta object
		});
	}

	// --- Lifecycle Hooks ---
	private onServiceCreated() {
		this.orderRepository = new OrderRepository();
		this.gamificationGateway = new GamificationGateway(this.broker);
	}

	private async onServiceStarted() {
		const mongoUri = config.MONGO_URI || "mongodb://localhost:27017/orders";
		await mongoose.connect(mongoUri);
		this.logger.info("Order Service successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
	}
}
