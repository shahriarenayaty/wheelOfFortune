import { RuleString } from "fastest-validator";

// This example looks for 10 to 15 digits, optionally starting with a +.
const phonePattern = /^\+?[0-9]{10,15}$/;

export const registerValidator = {
	phone: {
		type: "string",
		pattern: phonePattern,
		messages: {
			stringPattern: "Please provide a valid phone number.",
		},
	} as RuleString, // Cast for better type inference
	password: {
		type: "string",
		min: 8,
		messages: {
			stringMin: "Password must be at least 8 characters long.",
		},
	} as RuleString,
	$$strict: true, // Disallow any properties not defined in the schema
};

export const loginValidator = {
	phone: { type: "string", pattern: phonePattern },
	password: { type: "string", min: 1 }, // A simple check that it's not empty
	$$strict: true,
};
