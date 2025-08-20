import { validateEnv } from "./environment.schema";
import type { EnvConfig } from "./environment.schema";

// Perform the validation immediately when this module is first imported.
// If it fails, the application will crash on startup, which is the desired behavior.
const validatedConfig: EnvConfig = validateEnv(process.env);

// Export the validated, type-safe config object as the default export.
// The 'Readonly' utility type is a good practice to prevent accidental mutations.
export const config: Readonly<EnvConfig> = validatedConfig;

// Optional: You can also re-export the type if needed elsewhere
export type { EnvConfig };
