export function computePoints(amount: number): number {
	if (amount > 200000) {
		return 2;
	} else if (amount >= 100000) {
		return 1;
	}
	return 0;
}
