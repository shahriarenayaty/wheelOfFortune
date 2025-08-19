import { Errors, Service } from "moleculer";
import type { Context, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import { orderModel } from "../../models/order";
import { GamificationGateway } from "./gamification.gateway";
import { OrderRepository } from "./order.repository";
import type { IOrderRepository } from "./order.repository";
import { createOrderValidator, paymentValidator } from "./order.validators";
import { CreateOrderUseCase, CreateOrderUseCaseParams } from "./use-cases/create-order.usecase";
import {
	SimulatePaymentUseCase,
	SimulatePaymentUseCaseInputParams,
} from "./use-cases/simulate-payment.usecase";
import { IUser } from "../../utils/user.model";

const { MoleculerClientError } = Errors;

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
	private async createOrder(ctx: Context<CreateOrderUseCaseParams, { user: IUser }>) {
		this.verifyAuth(ctx);
		const { userId } = ctx.meta.user;
		const { amount } = ctx.params;
		const useCase = new CreateOrderUseCase({
			orderRepository: this.orderRepository,
		});
		return useCase.execute(userId, amount);
	}

	private async simulatePayment(
		ctx: Context<SimulatePaymentUseCaseInputParams, { user: IUser }>,
	) {
		this.verifyAuth(ctx);
		const useCase = new SimulatePaymentUseCase({
			orderRepository: this.orderRepository,
			gamificationGateway: this.gamificationGateway,
		});
		return useCase.execute({
			orderId: ctx.params.orderId,
			userId: ctx.meta.user.userId,
			meta: ctx.meta, // Pass the whole meta object
		});
	}

	// --- Helper Methods ---
	private verifyAuth(ctx: Context<any, any>) {
		if (!ctx.meta.user || !ctx.meta.user.userId) {
			throw new MoleculerClientError("Unauthorized", 401, "UNAUTHORIZED");
		}
	}

	// --- Lifecycle Hooks ---
	private onServiceCreated() {
		this.orderRepository = new OrderRepository(orderModel);
		this.gamificationGateway = new GamificationGateway(this.broker);
	}

	private async onServiceStarted() {
		const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/orders";
		await mongoose.connect(mongoUri);
		this.logger.info("Order Service successfully connected to MongoDB.");
	}

	private async onServiceStopped() {
		await mongoose.disconnect();
	}
}
