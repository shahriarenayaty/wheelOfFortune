import { Errors } from "moleculer";
import type {
	CreateOrderUseCaseDependencies,
	CreateOrderUseCaseParams,
	CreateOrderUseCaseResult,
} from "../order.type";

const { MoleculerClientError } = Errors;

export default class CreateOrderUseCase {
	private dependencies: CreateOrderUseCaseDependencies;

	constructor(dependencies: CreateOrderUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: CreateOrderUseCaseParams): Promise<CreateOrderUseCaseResult> {
		const { userId, amountInToman } = params;
		if (!userId || !amountInToman) {
			throw new MoleculerClientError("Missing required parameters", 500, "CREATE_ORDER");
		}
		const { orderRepository } = this.dependencies;
		const newOrder = await orderRepository.create(userId, amountInToman);
		return {
			orderId: newOrder._id.toString(),
			status: newOrder.status,
			amountInToman: newOrder.amountInToman,
		};
	}
}
