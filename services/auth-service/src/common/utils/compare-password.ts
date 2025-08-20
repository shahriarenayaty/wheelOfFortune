import bcrypt from "bcrypt";

export default async function comparePassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}
