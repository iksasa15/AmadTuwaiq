# API Contract — مشروع رقيب

> **لعضو 2:** ابنِ الواجهة على mock JSON بنفس الشكل بالضبط.  
> Base URL: `http://localhost:8000/api/v1`  
> آخر تحديث: 7 يوليو 2026

---

## أنواع مشتركة

### `RiskLevel`
```json
"low" | "medium" | "high" | "critical"
```

| المستوى | `risk_score` |
|---------|--------------|
| `low` | 0 – 25 |
| `medium` | 26 – 50 |
| `high` | 51 – 75 |
| `critical` | 76 – 100 |

### `Severity`
```json
"info" | "warning" | "critical"
```

---

## `GET /companies`

قائمة جميع الشركات مع درجة المخاطر الأخيرة.

**Response `200`:**
```json
[
  {
    "ticker": "2222.SR",
    "name_ar": "أرامكو السعودية",
    "name_en": "Saudi Aramco",
    "sector": "Energy",
    "risk_score": 42,
    "risk_level": "medium"
  },
  {
    "ticker": "1120.SR",
    "name_ar": "مصرف الراجحي",
    "name_en": "Al Rajhi Bank",
    "sector": "Banks",
    "risk_score": 18,
    "risk_level": "low"
  }
]
```

---

## `GET /companies/{ticker}`

تفاصيل شركة واحدة مع تاريخ الدرجة والإشارات.

**Path:** `ticker` — مثل `2222.SR` (URL-encoded: `2222.SR`)

**Response `200`:**
```json
{
  "ticker": "2222.SR",
  "name_ar": "أرامكو السعودية",
  "name_en": "Saudi Aramco",
  "sector": "Energy",
  "risk_score": 42,
  "risk_level": "medium",
  "m_score": -2.14,
  "latest_year": 2024,
  "score_history": [
    { "year": 2022, "risk_score": 35, "m_score": -2.45 },
    { "year": 2023, "risk_score": 38, "m_score": -2.31 },
    { "year": 2024, "risk_score": 42, "m_score": -2.14 }
  ],
  "flags_count": 3,
  "top_flags": [
    {
      "flag_id": "tata_high",
      "title_ar": "أرباح ورقية بلا تدفق نقدي",
      "severity": "critical"
    },
    {
      "flag_id": "cfo_ni_low",
      "title_ar": "التدفق النقدي أقل من صافي الربح",
      "severity": "warning"
    }
  ],
  "key_metrics": {
    "cfo_to_net_income": 0.72,
    "gross_margin": 0.58,
    "debt_to_equity": 0.31,
    "receivables_to_revenue_growth": 1.45
  }
}
```

**Response `404`:**
```json
{ "detail": "Company not found" }
```

---

## `GET /companies/{ticker}/flags`

جميع الإشارات الحمراء المفسّرة لشركة.

**Response `200`:**
```json
[
  {
    "flag_id": "tata_high",
    "title_ar": "استحقاقات عالية مقارنة بالأصول",
    "severity": "critical",
    "explanation_ar": "نسبة TATA = 0.08 تتجاوز العتبة. الفرق بين صافي الربح والتدفق النقدي التشغيلي مرتفع، مما يشير إلى أرباح 'ورقية' قد لا تعكس نقداً حقيقياً.",
    "evidence": {
      "metric": "TATA",
      "value": 0.082,
      "threshold": 0.05,
      "year": 2024
    }
  },
  {
    "flag_id": "dsri_elevated",
    "title_ar": "نمو الذمم المدينة أسرع من المبيعات",
    "severity": "warning",
    "explanation_ar": "مؤشر DSRI = 1.23 يعني أن نسبة الذمم إلى المبيعات ارتفعت 23% عن السنة السابقة — إشارة محتملة على تضخيم الإيرادات.",
    "evidence": {
      "metric": "DSRI",
      "value": 1.23,
      "threshold": 1.10,
      "year": 2024
    }
  },
  {
    "flag_id": "cfo_ni_low",
    "title_ar": "التدفق النقدي لا يدعم الأرباح المعلنة",
    "severity": "warning",
    "explanation_ar": "نسبة CFO/Net Income = 0.72 — أقل من 1.0. الشركة تحقق أرباحاً أكبر مما تولّده من نقد تشغيلي.",
    "evidence": {
      "metric": "cfo_to_net_income",
      "value": 0.72,
      "threshold": 1.0,
      "year": 2024
    }
  }
]
```

---

## `GET /market/overview`

إحصائيات السوق وتوزيع المخاطر.

**Response `200`:**
```json
{
  "total_companies": 31,
  "avg_risk_score": 38.5,
  "distribution": {
    "low": 8,
    "medium": 14,
    "high": 7,
    "critical": 2
  },
  "top_risks": [
    {
      "ticker": "4300.SR",
      "name_ar": "دار الأركان",
      "risk_score": 78,
      "risk_level": "critical"
    },
    {
      "ticker": "4002.SR",
      "name_ar": "الدريس",
      "risk_score": 71,
      "risk_level": "critical"
    },
    {
      "ticker": "8230.SR",
      "name_ar": "صندوق الرياض ريت",
      "risk_score": 65,
      "risk_level": "high"
    },
    {
      "ticker": "2350.SR",
      "name_ar": "كيان السعودية",
      "risk_score": 62,
      "risk_level": "high"
    },
    {
      "ticker": "2380.SR",
      "name_ar": "بترو رابغ",
      "risk_score": 58,
      "risk_level": "high"
    }
  ],
  "sector_breakdown": [
    { "sector": "Banks", "avg_risk_score": 22.1, "count": 6 },
    { "sector": "Petrochemicals", "avg_risk_score": 41.3, "count": 7 },
    { "sector": "Real Estate", "avg_risk_score": 68.5, "count": 2 }
  ],
  "updated_at": "2026-07-07T18:00:00+03:00"
}
```

---

## CORS

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

---

## Mock للتطوير

احفظ mock JSON في `frontend/src/mocks/` بنفس البنية. مثال:

```typescript
// frontend/src/mocks/companies.ts
export const mockCompanies = [ /* نفس GET /companies */ ];
```

**ملاحظة:** `risk_score` و `risk_level` ستكون mock حتى يوم 8 عندما يكتمل محرك الدرجة.

---

## الجدول الزمني

| اليوم | الحالة |
|-------|--------|
| 7 يوليو | هذا العقد + mock JSON |
| 8 يوليو | Beneish حقيقي → risk_score أولي |
| 9–10 | FastAPI endpoints حية |
| 11+ | SHAP + XGBoost ensemble |
