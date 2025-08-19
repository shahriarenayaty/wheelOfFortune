import { RuleString, RuleNumber } from "fastest-validator";

export const redeemReferralValidator = {
	code: {
		type: "string",
		min: 5,
		max: 10,
		alphanum: true,
	} as RuleString,
	$$strict: true,
};

export const calculatePointsValidator = {
	purchaseAmount: {
		type: "number",
		min: 1,
	} as RuleNumber,
	$$strict: true,
};
