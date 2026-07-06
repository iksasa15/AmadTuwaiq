import type { CompanyDetail, CompanySummary, FlagItem, MarketOverview } from "./client";
import { api } from "./client";
import {
  demoFetchCompanies,
  demoFetchCompany,
  demoFetchFlags,
  demoFetchOverview,
  demoRefresh,
  DEMO_ALERTS,
  MOBILY_TIMELINE,
} from "../data/demo";

export type { DemoAlert } from "../data/demo";
export { DEMO_ALERTS, MOBILY_TIMELINE };
export { DEMO_ACTIVITY, DEMO_MARKET_STATS, DEMO_SECTOR_META, SECTOR_AR } from "../data/demoExtras";

export function createDataSource(demoMode: boolean) {
  return {
    companies: (): Promise<CompanySummary[]> =>
      demoMode ? demoFetchCompanies() : api.companies(),

    overview: (): Promise<MarketOverview> =>
      demoMode ? demoFetchOverview() : api.overview(),

    company: (ticker: string): Promise<CompanyDetail | null> =>
      demoMode ? demoFetchCompany(ticker) : api.company(ticker).catch(() => null),

    flags: (ticker: string): Promise<FlagItem[]> =>
      demoMode ? demoFetchFlags(ticker) : api.flags(ticker),

    refresh: (): Promise<Record<string, unknown>> =>
      demoMode ? demoRefresh() : api.refresh(),
  };
}
