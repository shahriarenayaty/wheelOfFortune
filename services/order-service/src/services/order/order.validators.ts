import { RuleNumber, RuleString } from "fastest-validator";

export const createOrderValidator = {
	amount: {
		type: "number",
		positive: true,
		integer: true,
		min: 1,
	} as RuleNumber,
	$$strict: true,
};

export const paymentValidator = {
	orderId: {
		type: "string",
		// A basic check, could be more specific (e.g., ObjectID pattern)
		min: 10,
	} as RuleString,
	$$strict: true,
};
