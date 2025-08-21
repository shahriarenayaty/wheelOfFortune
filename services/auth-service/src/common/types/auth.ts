import type { Context } from "moleculer";

// Type for the user payload inside a validated JWT
export interface UserPayload {
	userId: string; // Typically 'sub' claim in JWT
}

// Extend Moleculer's Context 'meta' to include our user and token
export interface AuthMeta {
	user?: UserPayload;
	token?: string;
}

// Create a typed Context for use in your actions
export type AuthContext = Context<unknown, AuthMeta>;
