import { v4 as uuid } from "uuid";

export default function generateReferralCode(): string {
	return uuid().slice(0, 8).toUpperCase();
}
