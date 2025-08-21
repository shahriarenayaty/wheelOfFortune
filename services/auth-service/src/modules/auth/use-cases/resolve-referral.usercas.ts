import type {
	ResolveReferralParams,
	ResolveReferralUseCaseDependencies,
	ResolveReferralUseCaseResponse,
} from "../auth.types";
import type { UserDocument } from "../models/user/schema";

export default class ResolveReferralUseCase {
	private resolveReferralUseCaseDependencies: ResolveReferralUseCaseDependencies;

	constructor(resolveReferralUseCaseDependencies: ResolveReferralUseCaseDependencies) {
		this.resolveReferralUseCaseDependencies = resolveReferralUseCaseDependencies;
	}

	async execute(params: ResolveReferralParams): Promise<ResolveReferralUseCaseResponse> {
		const { referralCode } = params;
		const { userRepository } = this.resolveReferralUseCaseDependencies;

		// 1. Find the user by their referral code
		const user: UserDocument | null = await userRepository.findByReferralCode(referralCode);

		// 2. Validate user existence and password
		if (!user) {
			return {
				user: undefined,
			};
		}

		return {
			user: {
				id: user.id,
				phone: user.phone,
				referralCode: user.referralCode || "",
			},
		};
	}
}
