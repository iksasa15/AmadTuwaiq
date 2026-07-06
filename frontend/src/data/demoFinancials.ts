import type { FinancialStatements } from "../utils/financials";
import { line } from "../utils/financials";

type RawYear = Record<string, number | null>;

function buildFromRaw(years: number[], rows: RawYear[]): FinancialStatements {
  const get = (key: string) =>
    years.map((y) => {
      const r = rows.find((x) => x.year === y);
      return r?.[key] ?? null;
    });

  const revenue = get("revenue");
  const cogs = get("cogs");
  const gross = years.map((_, i) =>
    revenue[i] != null && cogs[i] != null ? (revenue[i]! - cogs[i]!) : null,
  );

  return {
    years,
    unit_label_ar: "القيم بالمليون ريال سعودي",
    income: [
      line("الإيرادات", revenue, { bold: true, highlight: true }),
      line("تكلفة المبيعات", cogs),
      line("مجمل الربح", gross, { bold: true }),
      line("المصاريف العمومية والإدارية", get("sga")),
      line("الربح التشغيلي", get("operating_income"), { bold: true }),
      line("صافي الربح", get("net_income"), { bold: true, highlight: true }),
    ],
    balance: [
      line("إجمالي الأصول", get("total_assets"), { bold: true }),
      line("الأصول المتداولة", get("current_assets")),
      line("الذمم المدينة", get("receivables"), { highlight: true }),
      line("الممتلكات والمعدات", get("ppe")),
      line("إجمالي الخصوم", get("total_liabilities")),
      line("إجمالي الديون", get("total_debt")),
      line("حقوق الملكية", get("total_equity"), { bold: true }),
    ],
    cashflow: [
      line("التدفق النقدي التشغيلي", get("cfo"), { bold: true, highlight: true }),
      line("الإهلاك والاستهلاك", get("depreciation")),
    ],
  };
}

const DEMO_RAW: Record<string, RawYear[]> = {
  "4001.SR": [
    { year: 2022, revenue: 9_800_000_000, cogs: 7_600_000_000, sga: 380_000_000, operating_income: 320_000_000, net_income: 520_000_000, total_assets: 5_800_000_000, current_assets: 1_400_000_000, receivables: 35_000_000, ppe: 3_400_000_000, total_liabilities: 4_200_000_000, total_debt: 1_900_000_000, total_equity: 1_350_000_000, cfo: 620_000_000, depreciation: 360_000_000 },
    { year: 2023, revenue: 10_234_000_000, cogs: 7_965_000_000, sga: 398_000_000, operating_income: 342_000_000, net_income: 482_000_000, total_assets: 6_099_000_000, current_assets: 1_547_000_000, receivables: 43_000_000, ppe: 3_617_000_000, total_liabilities: 4_645_000_000, total_debt: 2_051_000_000, total_equity: 1_413_000_000, cfo: 681_000_000, depreciation: 377_000_000 },
    { year: 2024, revenue: 10_763_000_000, cogs: 8_353_000_000, sga: 464_000_000, operating_income: 349_000_000, net_income: 511_000_000, total_assets: 7_052_000_000, current_assets: 1_604_000_000, receivables: 65_000_000, ppe: 4_348_000_000, total_liabilities: 5_638_000_000, total_debt: 2_782_000_000, total_equity: 1_373_000_000, cfo: 909_000_000, depreciation: 411_000_000 },
    { year: 2025, revenue: 11_089_000_000, cogs: 8_625_000_000, sga: 562_000_000, operating_income: 247_000_000, net_income: 250_000_000, total_assets: 7_691_000_000, current_assets: 2_180_000_000, receivables: 167_000_000, ppe: 4_199_000_000, total_liabilities: 6_413_000_000, total_debt: 3_017_000_000, total_equity: 1_227_000_000, cfo: 741_000_000, depreciation: 445_000_000 },
  ],
  "7020.SR": [
    { year: 2011, revenue: 11_200_000_000, cogs: 5_040_000_000, sga: 1_900_000_000, operating_income: 2_350_000_000, net_income: 1_550_000_000, total_assets: 26_500_000_000, current_assets: 9_200_000_000, receivables: 2_800_000_000, ppe: 12_200_000_000, total_liabilities: 15_800_000_000, total_debt: 8_500_000_000, total_equity: 10_700_000_000, cfo: 1_000_000_000, depreciation: 1_250_000_000 },
    { year: 2012, revenue: 12_500_000_000, cogs: 5_625_000_000, sga: 2_100_000_000, operating_income: 2_600_000_000, net_income: 1_850_000_000, total_assets: 28_500_000_000, current_assets: 11_000_000_000, receivables: 4_500_000_000, ppe: 12_500_000_000, total_liabilities: 17_000_000_000, total_debt: 9_200_000_000, total_equity: 11_500_000_000, cfo: 650_000_000, depreciation: 1_300_000_000 },
    { year: 2013, revenue: 14_200_000_000, cogs: 6_390_000_000, sga: 2_300_000_000, operating_income: 2_950_000_000, net_income: 2_300_000_000, total_assets: 31_000_000_000, current_assets: 13_500_000_000, receivables: 7_200_000_000, ppe: 12_800_000_000, total_liabilities: 18_500_000_000, total_debt: 10_000_000_000, total_equity: 12_500_000_000, cfo: 400_000_000, depreciation: 1_350_000_000 },
  ],
  "2140.SR": [
    { year: 2022, revenue: 8_500_000_000, cogs: 4_900_000_000, sga: 1_200_000_000, operating_income: 1_400_000_000, net_income: 1_100_000_000, total_assets: 12_000_000_000, current_assets: 3_200_000_000, receivables: 890_000_000, ppe: 5_500_000_000, total_liabilities: 5_800_000_000, total_debt: 2_100_000_000, total_equity: 6_200_000_000, cfo: 980_000_000, depreciation: 620_000_000 },
    { year: 2023, revenue: 9_200_000_000, cogs: 5_300_000_000, sga: 1_280_000_000, operating_income: 1_520_000_000, net_income: 1_180_000_000, total_assets: 13_200_000_000, current_assets: 3_500_000_000, receivables: 1_050_000_000, ppe: 5_800_000_000, total_liabilities: 6_200_000_000, total_debt: 2_300_000_000, total_equity: 6_500_000_000, cfo: 920_000_000, depreciation: 650_000_000 },
    { year: 2024, revenue: 10_100_000_000, cogs: 5_750_000_000, sga: 1_350_000_000, operating_income: 1_680_000_000, net_income: 1_250_000_000, total_assets: 14_500_000_000, current_assets: 3_900_000_000, receivables: 1_280_000_000, ppe: 6_100_000_000, total_liabilities: 6_800_000_000, total_debt: 2_550_000_000, total_equity: 6_900_000_000, cfo: 850_000_000, depreciation: 680_000_000 },
    { year: 2025, revenue: 11_000_000_000, cogs: 6_200_000_000, sga: 1_420_000_000, operating_income: 1_820_000_000, net_income: 1_320_000_000, total_assets: 15_800_000_000, current_assets: 4_200_000_000, receivables: 1_520_000_000, ppe: 6_400_000_000, total_liabilities: 7_400_000_000, total_debt: 2_800_000_000, total_equity: 7_200_000_000, cfo: 780_000_000, depreciation: 720_000_000 },
  ],
  "4300.SR": [
    { year: 2022, revenue: 2_100_000_000, cogs: 1_450_000_000, sga: 180_000_000, operating_income: 420_000_000, net_income: 310_000_000, total_assets: 18_500_000_000, current_assets: 4_200_000_000, receivables: 520_000_000, ppe: 2_800_000_000, total_liabilities: 14_200_000_000, total_debt: 9_500_000_000, total_equity: 4_300_000_000, cfo: 280_000_000, depreciation: 120_000_000 },
    { year: 2023, revenue: 2_450_000_000, cogs: 1_680_000_000, sga: 195_000_000, operating_income: 480_000_000, net_income: 350_000_000, total_assets: 20_100_000_000, current_assets: 4_800_000_000, receivables: 610_000_000, ppe: 3_100_000_000, total_liabilities: 15_800_000_000, total_debt: 10_800_000_000, total_equity: 4_300_000_000, cfo: 310_000_000, depreciation: 135_000_000 },
    { year: 2024, revenue: 2_800_000_000, cogs: 1_920_000_000, sga: 210_000_000, operating_income: 520_000_000, net_income: 380_000_000, total_assets: 22_400_000_000, current_assets: 5_200_000_000, receivables: 680_000_000, ppe: 3_400_000_000, total_liabilities: 17_500_000_000, total_debt: 12_200_000_000, total_equity: 4_900_000_000, cfo: 340_000_000, depreciation: 148_000_000 },
    { year: 2025, revenue: 3_100_000_000, cogs: 2_100_000_000, sga: 225_000_000, operating_income: 560_000_000, net_income: 410_000_000, total_assets: 24_800_000_000, current_assets: 5_600_000_000, receivables: 720_000_000, ppe: 3_650_000_000, total_liabilities: 19_600_000_000, total_debt: 13_800_000_000, total_equity: 5_200_000_000, cfo: 350_000_000, depreciation: 155_000_000 },
  ],
  "4005.SR": [
    { year: 2022, revenue: 1_200_000_000, cogs: 720_000_000, sga: 280_000_000, operating_income: 180_000_000, net_income: 140_000_000, total_assets: 2_800_000_000, current_assets: 680_000_000, receivables: 195_000_000, ppe: 1_600_000_000, total_liabilities: 1_400_000_000, total_debt: 520_000_000, total_equity: 1_400_000_000, cfo: 155_000_000, depreciation: 95_000_000 },
    { year: 2023, revenue: 1_350_000_000, cogs: 810_000_000, sga: 295_000_000, operating_income: 210_000_000, net_income: 165_000_000, total_assets: 3_100_000_000, current_assets: 750_000_000, receivables: 230_000_000, ppe: 1_720_000_000, total_liabilities: 1_550_000_000, total_debt: 580_000_000, total_equity: 1_550_000_000, cfo: 148_000_000, depreciation: 102_000_000 },
    { year: 2024, revenue: 1_520_000_000, cogs: 910_000_000, sga: 310_000_000, operating_income: 245_000_000, net_income: 190_000_000, total_assets: 3_400_000_000, current_assets: 820_000_000, receivables: 275_000_000, ppe: 1_850_000_000, total_liabilities: 1_700_000_000, total_debt: 620_000_000, total_equity: 1_700_000_000, cfo: 142_000_000, depreciation: 110_000_000 },
    { year: 2025, revenue: 1_680_000_000, cogs: 1_000_000_000, sga: 325_000_000, operating_income: 270_000_000, net_income: 210_000_000, total_assets: 3_750_000_000, current_assets: 920_000_000, receivables: 320_000_000, ppe: 1_980_000_000, total_liabilities: 1_880_000_000, total_debt: 680_000_000, total_equity: 1_870_000_000, cfo: 101_000_000, depreciation: 118_000_000 },
  ],
};

function genericRaw(ticker: string): RawYear[] {
  const seed = ticker.charCodeAt(0) + ticker.charCodeAt(1);
  const scale = 3_000_000_000 + (seed % 20) * 500_000_000;
  return [2022, 2023, 2024, 2025].map((year, i) => {
    const g = 1 + i * 0.08;
    return {
      year,
      revenue: scale * g,
      cogs: scale * g * 0.72,
      sga: scale * 0.04,
      operating_income: scale * g * 0.12,
      net_income: scale * g * 0.09,
      total_assets: scale * g * 1.8,
      current_assets: scale * g * 0.35,
      receivables: scale * g * 0.08,
      ppe: scale * g * 0.9,
      total_liabilities: scale * g * 1.1,
      total_debt: scale * g * 0.45,
      total_equity: scale * g * 0.7,
      cfo: scale * g * 0.11,
      depreciation: scale * g * 0.05,
    };
  });
}

export function getDemoFinancials(ticker: string): FinancialStatements {
  const norm = ticker.includes(".") ? ticker : `${ticker}.SR`;
  const raw = DEMO_RAW[norm] ?? genericRaw(norm);
  const years = raw.map((r) => r.year as number);
  return buildFromRaw(years, raw);
}
