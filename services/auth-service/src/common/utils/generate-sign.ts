import { config } from "../../config";
import type { UserDocument } from "../../modules/auth/models/user/schema";

export default async function generateSign(data: unknown): Promise<string> {
	const jose = await import("jose");
	const payload = {
		data,
		// It's good practice to include standard claims
		iat: Math.floor(Date.now() / 1000), // Issued At
		iss: "auth-service", // Issuer
		aud: "gamification-service", // Audience
	};
	const pemPrivateKey = config.PRIVATE_KEY.replace(/\\n/g, "\n");
	const privateKey = await jose.importPKCS8(pemPrivateKey, "RS256");
	const jws = await new jose.SignJWT(payload)
		.setProtectedHeader({ alg: "RS256" })
		.setIssuedAt()
		.setIssuer("auth-service")
		.sign(privateKey);
	return jws;
}
