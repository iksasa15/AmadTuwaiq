import { riskLevelFromScore, type RiskLevel } from "./risk";

const WEIGHTS = { m: 0.4, if_: 0.2, xgb: 0.15, rules: 0.25 };

export type WhatIfInputs = {
  cash_change_pct: number;
  receivables_change_pct: number;
  revenue_change_pct: number;
  cfo_change_pct: number;
};

export type WhatIfResult = {
  score: number;
  level: RiskLevel;
  breakdown: { m: number; if_: number; xgb: number; rules: number };
  delta: number;
};

export function computeWhatIfScore(
  baseScore: number,
  baseBreakdown: { m: number; if_: number; xgb: number; rules: number },
  inputs: WhatIfInputs,
): WhatIfResult {
  const stress =
    Math.abs(Math.min(0, inputs.cash_change_pct)) * 0.35 +
    Math.max(0, inputs.receivables_change_pct) * 0.4 +
    Math.abs(Math.min(0, inputs.revenue_change_pct)) * 0.15 +
    Math.abs(Math.min(0, inputs.cfo_change_pct)) * 0.3;

  const factor = 1 + stress / 100;

  const breakdown = {
    m: Math.min(95, Math.round(baseBreakdown.m * (1 + Math.max(0, inputs.receivables_change_pct) / 80))),
    if_: Math.min(90, Math.round(baseBreakdown.if_ * factor)),
    xgb: Math.min(85, Math.round(baseBreakdown.xgb * factor)),
    rules: Math.min(98, Math.round(baseBreakdown.rules * factor)),
  };

  const score = Math.min(
    100,
    Math.round(
      WEIGHTS.m * breakdown.m +
        WEIGHTS.if_ * breakdown.if_ +
        WEIGHTS.xgb * breakdown.xgb +
        WEIGHTS.rules * breakdown.rules,
    ),
  );

  return {
    score,
    level: riskLevelFromScore(score),
    breakdown,
    delta: score - baseScore,
  };
}
