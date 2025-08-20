import z from 'zod';

const configSchema = z.object({
  NATS_URL: z.string(),
  NAMESPACE: z.string(),
  NODE_ID_PREFIX: z.string(),
  PUBLIC_KEY: z.string().startsWith('-----BEGIN PUBLIC KEY-----'),
});

export function validateSchema(config: Record<string, unknown>) {
  // `parse` will throw an error if validation fails
  const validatedConfig = configSchema.parse(config);
  return validatedConfig;
}

type EnvConfig = z.infer<typeof configSchema>;

export type { EnvConfig };
