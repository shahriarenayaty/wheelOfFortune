import type { IOrderRepository } from "../order.repository";

export interface CreateOrderUseCaseDependencies {
	orderRepository: IOrderRepository;
}

export interface CreateOrderUseCaseParams {
	amount: number;
}
export interface CreateOrderUseCaseResult {
	orderId: string;
	status: string;
	amount: number;
}

export class CreateOrderUseCase {
	private dependencies: CreateOrderUseCaseDependencies;

	constructor(dependencies: CreateOrderUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(userId: string, amount: number): Promise<CreateOrderUseCaseResult> {
		const { orderRepository } = this.dependencies;
		const newOrder = await orderRepository.create(userId, amount);
		return {
			orderId: newOrder._id.toString(),
			status: newOrder.status,
			amount: newOrder.amount,
		};
	}
}
