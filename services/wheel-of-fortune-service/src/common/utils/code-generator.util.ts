/**
 * Generates a unique-ish discount code.
 * @param prefix - A prefix for the code, e.g., 'HABLO'.
 * @returns A generated code like 'HABLO-A8B2C1'.
 */
export default function generateDiscountCode(prefix: string): string {
	const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `${prefix.toUpperCase()}-${randomPart}`;
}
