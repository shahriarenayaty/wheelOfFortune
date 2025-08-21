import type { ActionHandler, ActionSchema } from "moleculer";
import { Errors } from "moleculer";
import { config } from "../../config";
import type { AuthContext, UserPayload } from "../types/auth.types";

const { MoleculerClientError } = Errors;

const ActionAuthMiddleware = {
	localAction(handler: ActionHandler, action: ActionSchema): ActionHandler {
		// If the action is marked as public, skip the check
		if (!action.authenticated) {
			return handler;
		}

		return async function actionAuth(this: unknown, ctx: AuthContext) {
			const { token } = ctx.meta;
			const jose = await import("jose");

			if (!token) {
				throw new MoleculerClientError("Request is missing a token!", 500, "NO_TOKEN");
			}

			try {
				const pemPublicKey = config.AUTH_PUBLIC_KEY.replace(/\\n/g, "\n");

				const publicKey = await jose.importSPKI(pemPublicKey, "RS256"); // <--- The fix is here!

				const c = await jose.jwtVerify<UserPayload>(token, publicKey);
				ctx.meta.user = c.payload;
			} catch (err) {
				throw new MoleculerClientError("Invalid token!", 500, "INVALID_TOKEN");
			}

			// 3. Call the original action handler
			const result = await handler(ctx);

			// You can do something after the action call here if needed

			return result;
		};
	},
};

export default ActionAuthMiddleware;
