import type { Model } from "mongoose";
import type { IOrder, OrderDocument } from "../../models/order/schema";
import { OrderStatus } from "../../models/order/schema";

export interface IOrderRepository {
	create(userId: string, amount: number): Promise<OrderDocument>;
	findById(orderId: string): Promise<OrderDocument | null>;
	updateStatus(orderId: string, status: OrderStatus): Promise<OrderDocument | null>;
}

export class OrderRepository implements IOrderRepository {
	private orderModel: Model<IOrder>;

	constructor(orderModel: Model<IOrder>) {
		this.orderModel = orderModel;
	}

	create(userId: string, amount: number): Promise<OrderDocument> {
		return this.orderModel.create({ userId, amount, status: OrderStatus.PENDING });
	}

	findById(orderId: string): Promise<OrderDocument | null> {
		return this.orderModel.findById(orderId);
	}

	updateStatus(orderId: string, status: OrderStatus): Promise<OrderDocument | null> {
		return this.orderModel.findByIdAndUpdate(orderId, { $set: { status } }, { new: true });
	}
}
