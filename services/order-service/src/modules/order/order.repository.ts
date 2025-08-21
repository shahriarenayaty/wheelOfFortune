import type { Model } from "mongoose";
import type { IOrder, OrderDocument } from "../../models/order/schema";
import { OrderStatus } from "../../models/order/schema";
import type { IOrderRepository } from "./order.type";
import { orderModel } from "../../models/order";

export default class OrderRepository implements IOrderRepository {
	private orderModel: Model<IOrder>;

	constructor() {
		this.orderModel = orderModel;
	}

	create(userId: string, amountInToman: number): Promise<OrderDocument> {
		return this.orderModel.create({ userId, amountInToman, status: OrderStatus.PENDING });
	}

	findById(orderId: string): Promise<OrderDocument | null> {
		return this.orderModel.findById(orderId);
	}

	updateStatus(orderId: string, status: OrderStatus): Promise<OrderDocument | null> {
		return this.orderModel.findByIdAndUpdate(orderId, { $set: { status } }, { new: true });
	}
}
