import { Errors } from "moleculer";
import type { AuthMeta } from "../../../common/types/auth.types";
import type { PrizeHistoryDocument } from "../models/schema";
import type { GetPrizeHistoryUseCaseDependencies } from "../prize-hostory.types";

const { MoleculerClientError } = Errors;
export default class GetPrizeHistoryUseCase {
	private dependencies: GetPrizeHistoryUseCaseDependencies;

	constructor(dependencies: GetPrizeHistoryUseCaseDependencies) {
		this.dependencies = dependencies;
	}

	async execute(params: AuthMeta): Promise<PrizeHistoryDocument[]> {
		const { user } = params;
		if (!user) {
			throw new MoleculerClientError("Bad Request", 500, "BAD_REQUEST");
		}
		const { repository } = this.dependencies;
		const prizeHistory = await repository.findByUserIdSorted(user.userId);
		return prizeHistory;
	}
}
