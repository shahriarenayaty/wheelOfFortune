import mongoose from "mongoose";
import { wonPrizeSchema } from "./schema";
import type { IWonPrize } from "./schema";

/**
 * =================================================================================
 * IMPORTANT: Mongoose Model Singleton Pattern
 * =================================================================================
 *
 * @description
 * This code prevents a common crash in hot-reloading development environments
 * (like the one used in MoleculerJS).
 *
 * THE PROBLEM IT SOLVES:
 * During development, when a file is saved, the server often tries to re-run the code.
 * If we just used `mongoose.model("WonPrize", wonPrizeSchema)`, Mongoose would try to
 * re-compile the 'WonPrize' model on every save, throwing an `OverwriteModelError`
 * because the model was already compiled on the first run. This code checks if the
 * model already exists in Mongoose's cache and reuses it, preventing the crash.
 *
 * =================================================================================
 * !!! CRITICAL CAVEAT: THIS DOES NOT APPLY NEW SCHEMA CHANGES ON HOT-RELOAD !!!
 * =================================================================================
 *
 * Because this pattern reuses the *first compiled version* of the model from the
 * cache, any subsequent changes you make to the `wonPrizeSchema` in this file
 * WILL BE IGNORED by the hot-reload process.
 *
 * >> To apply your new schema changes, you MUST manually restart the development server. <<
 *
 * You might think, "If I have to restart to apply schema changes, the duplicate model
 * error would be fixed anyway." You are correct. The value of this code is that it
 * PREVENTS THE SERVER FROM CRASHING on every file save, allowing you to continue
 * working without interruption unless you specifically modify the schema.
 * 
 * export const wonPrizeModel =
	mongoose.models && mongoose.models.WonPrize
		? mongoose.models.WonPrize
		: mongoose.model<IWonPrize>("WonPrize", wonPrizeSchema);
 */

export const wonPrizeModel = mongoose.model<IWonPrize>("WonPrize", wonPrizeSchema);
