// src/types/moleculer.d.ts

// Import the original type, although it's often not strictly necessary for augmentation,
// it can help with clarity and referencing other types if needed.
import "moleculer";

// Use 'declare module' to open up the original module declaration
declare module "moleculer" {
	// Re-declare the interface you want to extend.
	// TypeScript will merge this declaration with the original one.
	export interface ServiceEvent {
		/**
		 * Indicates that this event must be signed.
		 * Your custom middleware can use this flag for verification.
		 * @type {boolean}
		 */
		signed?: boolean;
	}
}
