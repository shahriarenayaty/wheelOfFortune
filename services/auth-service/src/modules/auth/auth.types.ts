import type { ParamsFrom } from "../../common/types/validator";
import type { loginValidator, registerValidator } from "./auth.validators";

export type LoginUseCaseParams = ParamsFrom<typeof loginValidator>;

export type RegisterUseCaseParams = ParamsFrom<typeof registerValidator>;

export type RegisterUseCaseResult = {
	token: string;
	referralCode: string;
	userId: string;
};
