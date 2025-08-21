type InferRuleType<T> = T extends { type: "string" }
	? string
	: T extends { type: "number" }
	? number
	: T extends { type: "boolean" }
	? boolean
	: T extends { type: "email" }
	? string
	: T extends { type: "url" }
	? string
	: T extends { type: "uuid" }
	? string
	: T extends { type: "array" }
	? unknown[] // You can make this more specific if needed
	: T extends { type: "object" }
	? object
	: unknown;

// This is the main utility type.
// It takes a validator schema and creates the corresponding params type.
export type ParamsFrom<T> = {
	// We iterate over each key in the provided schema `T`.
	// We use `Omit` to exclude Moleculer-specific keys like `$$strict`.
	[K in keyof Omit<T, "$$strict">]: T[K] extends { optional: true } // Check if the property is optional in the validator
		? // If it is, make the property optional in the resulting type
		  InferRuleType<T[K]> | undefined
		: // Otherwise, it's a required property
		  InferRuleType<T[K]>;
};
