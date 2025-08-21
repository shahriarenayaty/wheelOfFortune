import type { Context, EventSchema, ServiceEventHandler } from "moleculer";
import { config, type EnvConfig } from "../../config";

const EventAuthMiddleware = {
	localEvent(handler: ServiceEventHandler, event: EventSchema): ServiceEventHandler {
		// If the event is not marked as 'signed', bypass the middleware
		if (!event.signed) {
			return handler;
		}

		// Return the wrapped handler for signed events
		return async function eventAuth(ctx: Context) {
			const { broker } = ctx;

			const jose = await import("jose");

			const jwsSignature = ctx.params;

			if (typeof jwsSignature !== "string" || !jwsSignature.includes(".")) {
				broker.logger.warn(
					`Event '${event.name}' requires a JWS signature, but received an invalid payload. Discarding.`,
				);
				return;
			}

			try {
				// 1. Decode header to find the issuer ('iss') without full verification yet
				const header = jose.decodeProtectedHeader(jwsSignature);
				const iss = header?.iss;
				if (!iss || typeof iss !== "string") {
					broker.logger.warn(
						`Event '${event.name}' requires a JWS signature, but received an invalid 'iss' (issuer) claim. Discarding.`,
					);
					return;
				}
				if (!(iss in config)) {
					broker.logger.warn(
						`Event '${event.name}' requires a JWS signature, but received an unknown or untrusted 'iss' (issuer) claim. Discarding.`,
					);
					return;
				}

				const validKey = iss as keyof EnvConfig;
				// 2. Look up the issuer's public key from our cache
				const pemPublicKey = config[validKey].replace(/\\n/g, "\n");

				const publicKey = await jose.importSPKI(pemPublicKey, "RS256"); // <--- The fix is here!

				// 3. Verify the JWS signature and get the payload
				const { payload } = await jose.compactVerify(jwsSignature, publicKey);

				// 4. Parse the payload and replace ctx.params
				const verifiedPayload = JSON.parse(new TextDecoder().decode(payload));
				ctx.params = verifiedPayload;

				// 5. Call the original event handler with the now-trusted payload
				await handler(ctx);
			} catch (error) {
				broker.logger.error(
					`Event signature verification failed for '${event.name}'. Error:`,
					error.message,
				);
				throw error;
			}
		};
	},
};
export default EventAuthMiddleware;
