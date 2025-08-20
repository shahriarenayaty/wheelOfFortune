import jwt from "jsonwebtoken";
import { config } from "../../config";
import type { UserDocument } from "../../modules/auth/models/user/schema";

export default function generateToken(user: UserDocument): string {
	const privateKey = config.PRIVATE_KEY.replace(/\\n/g, "\n");
	const token = jwt.sign(
		{ userId: user._id }, // Payload
		privateKey, // Secret Key
		{ expiresIn: "1h", algorithm: "RS256" }, // Options
	);
	return token;
}
