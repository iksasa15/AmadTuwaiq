export const MOBILY_TICKER = "7020.SR";

export function isMobilyTicker(ticker: string): boolean {
  return ticker.includes("7020");
}
