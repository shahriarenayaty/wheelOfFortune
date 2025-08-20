export default function computePoints(amountInToman: number): number {
	if (amountInToman > 200000) {
		return 2;
	}
	if (amountInToman >= 100000) {
		return 1;
	}
	return 0;
}
