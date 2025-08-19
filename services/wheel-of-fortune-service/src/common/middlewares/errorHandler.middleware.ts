import type { ActionHandler, ActionSchema, Context } from "moleculer";
import { Errors } from "moleculer";

const { MoleculerClientError: moleculerClientError } = Errors;

const errorHandlerMiddleware = {
	localAction(handler: ActionHandler, action: ActionSchema): ActionHandler {
		if (typeof action.name === "string" && action.name.startsWith("$")) {
			return handler;
		}

		return async function errorHandler(this: unknown, ctx: Context): Promise<unknown> {
			try {
				// 1. Call the handler, which might return a value or a promise.
				// 2. Wrap the result in Promise.resolve() to guarantee we have a promise.
				// 3. Await the promise. This ensures both sync throws and async
				//    rejections are caught by the 'catch' block.
				const result = await Promise.resolve(handler.call(this, ctx));
				return result;
			} catch (err: unknown) {
				if (err instanceof moleculerClientError) {
					throw err;
				}

				const error = err as Error;

				// this.logger.error(`Error in action '${action.name}':`, error);
				// --- CORRECT WAY TO ACCESS THE LOGGER ---
				// Use the context object which holds a reference to the service instance.
				if (ctx?.service?.logger) {
					ctx.service.logger.error(`Error in action '${ctx?.action?.name}':`, error);
				}
				// -----------------------------------------

				throw new Errors.MoleculerClientError(
					error.message || "Internal server error",
					500,
					"INTERNAL_SERVER_ERROR",
					{
						action: action.name,
					},
				);
			}
		};
	},
};

export default errorHandlerMiddleware;
