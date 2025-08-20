import generateDiscountCode from "../../../common/utils/code-generator.util";
import type { IPrize } from "../wheel-of-fortune.types";

const PRIZE_POOL: IPrize[] = [
	{
		id: "DISCOUNT_20_HABLOLMATIN",
		name: "کد تخفیف ۲۰٪ حبل‌المتین",
		weight: 1.0,
		unique: true, // This prize can only be won once by a user
		detailsGenerator: () => ({ code: generateDiscountCode("HABLO20") }),
	},
	{
		id: "DISCOUNT_50_HABLOLMATIN",
		name: "کد تخفیف ۵۰٪ حبل‌المتین",
		weight: 0.8,
		unique: true, // This prize can only be won once by a user
		detailsGenerator: () => ({ code: generateDiscountCode("HABLO50") }),
	},
	{
		id: "LOTTERY_CHANCE_1",
		name: "۱ شانس قرعه‌کشی",
		weight: 2.5,
		unique: false,
		detailsGenerator: () => ({ chances: 1 }),
	},
	{
		id: "LOTTERY_CHANCE_3",
		name: "۳ شانس قرعه‌کشی",
		weight: 1.5,
		unique: false,
		detailsGenerator: () => ({ chances: 3 }),
	},
	{
		id: "CASH_2M_TOMAN",
		name: "جایزه نقدی ۲ میلیون تومانی",
		weight: 0.2,
		unique: true, // This prize can only be won once by a user
		detailsGenerator: () => ({ amount: 2_000_000, currency: "TOMAN" }),
	},
	{
		id: "DISCOUNT_30_DIGIKALA",
		name: "کد تخفیف ۳۰٪ دیجی‌کالا",
		weight: 1.5,
		unique: true,
		detailsGenerator: () => ({ code: generateDiscountCode("DIGI30") }),
	},
	{
		id: "DISCOUNT_30_TALASHI",
		name: "کد تخفیف ۳۰٪ تلاشی",
		weight: 1.5,
		unique: true,
		detailsGenerator: () => ({ code: generateDiscountCode("TALA30") }),
	},
];

export default PRIZE_POOL;
