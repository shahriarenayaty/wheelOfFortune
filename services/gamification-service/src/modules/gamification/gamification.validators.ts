import type { RuleNumber, RuleString } from "fastest-validator";

export const redeemReferralValidator = {
	code: {
		type: "string",
		min: 5,
		max: 10,
		alphanum: true,
	} as RuleString,
	$$strict: true,
} as const;

export const pointsToAddValidator = {
	pointsToAdd: {
		type: "number",
		min: 1,
		integer: true,
	} as RuleNumber,
	$$strict: true,
} as const;

export const deductPointsValidator = {
	pointsToDeduct: {
		type: "number",
		min: 1,
		integer: true,
	} as RuleNumber,
	$$strict: true,
} as const;
