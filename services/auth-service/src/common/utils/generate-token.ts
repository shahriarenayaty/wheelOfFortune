import { config } from "../../config";
import type { UserDocument } from "../../modules/auth/models/user/schema";

export default async function generateToken(user: UserDocument): Promise<string> {
	const jose = await import("jose");
	const pemPrivateKey = config.PRIVATE_KEY.replace(/\\n/g, "\n");
	const privateKey = await jose.importPKCS8(pemPrivateKey, "RS256");
	const token = await new jose.SignJWT({ userId: user._id.toString() })
		.setProtectedHeader({ alg: "RS256" })
		.setIssuedAt()
		.setIssuer("auth-service")
		.setExpirationTime("1h")
		.sign(privateKey);
	return token;
}
