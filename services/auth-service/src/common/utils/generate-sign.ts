import type { JWTPayload } from "jose";
import { config } from "../../config";

export default async function generateSign(data: JWTPayload): Promise<string> {
	const jose = await import("jose");

	const pemPrivateKey = config.PRIVATE_KEY.replace(/\\n/g, "\n");
	const privateKey = await jose.importPKCS8(pemPrivateKey, "RS256");
	const jws = await new jose.SignJWT(data)
		.setProtectedHeader({ alg: "RS256", iss: config.ISS_JWS })
		.setIssuedAt()
		.sign(privateKey);
	return jws;
}