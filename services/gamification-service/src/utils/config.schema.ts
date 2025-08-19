import z from "zod";

const configSchema = z.object({
	NATS_URL: z.string(),
	NAMESPACE: z.string(),
	NODE_ID_PREFIX: z.string(),
	MONGO_URI: z.string(),
});

export type EnvConfig = z.infer<typeof configSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
	try {
		const validatedConfig: EnvConfig = configSchema.parse(config);
		return validatedConfig;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.issues
				.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
				.join(", ");
			throw new Error(`Environment variable validation failed: ${errorMessages}`);
		}
		throw error;
	}
}
