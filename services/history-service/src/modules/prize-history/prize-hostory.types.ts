import type { IPrizeHistory } from "./models/schema";

export type ICreatePrizeHistory = Omit<IPrizeHistory, "createdAt" | "updatedAt">;
