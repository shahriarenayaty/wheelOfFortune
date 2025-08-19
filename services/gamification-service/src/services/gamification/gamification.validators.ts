import { RuleString } from "fastest-validator";

export const redeemReferralValidator = {
	code: {
		type: "string",
		min: 5,
		max: 10,
		alphanum: true,
	} as RuleString,
	$$strict: true,
};
