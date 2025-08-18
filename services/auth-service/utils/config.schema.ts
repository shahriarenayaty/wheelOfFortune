import z from 'zod';

const configSchema = z.object({
  NATS_URL: z.string(),
  NAMESPACE: z.string(),
  NODE_ID_PREFIX: z.string(),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
});

export function validateEnv(config: Record<string, unknown>) {
  try {
    const validatedConfig = configSchema.parse(config);
    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Environment variable validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

export type EnvConfig = z.infer<typeof configSchema>;


