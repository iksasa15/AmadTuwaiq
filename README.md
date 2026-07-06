<div align="center">

# رقيب · Raqeeb

**منصة رقابة مالية استباقية** — كشف مخاطر التلاعب في الشركات المدرجة  
هاكاثون **امد 2026** · مصرف الإنماء × أكاديمية طويق

[![Tests](https://img.shields.io/badge/tests-31%20passing-success)](#)
[![Python](https://img.shields.io/badge/python-3.11-blue)](#)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688)](#)

</div>

---

## تشغيل سريع (3 أوامر)

```bash
python3.11 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
python -m src.ingestion.run_all --skip-fetch && python -m src.models.run_beneish
uvicorn src.api.main:app --reload --port 8000   # + cd frontend && npm run dev
```

**Swagger:** http://localhost:8000/docs · **Dashboard:** http://localhost:5173

---

## المعمارية

| الطبقة | التقنية | الدور |
|--------|---------|-------|
| **Ingestion** | yfinance → parquet | جلب القوائم المالية |
| **ETL** | pandas, validate | توحيد schema + فحص جودة |
| **Features** | Beneish (8 مؤشرات) | DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA |
| **Models** | IF + XGBoost + SHAP | كشف شذوذ + احتمال تلاعب |
| **Scoring** | مركّب 0–100 | `0.40·M + 0.20·IF + 0.15·XGB + 0.25·Rules` |
| **API** | FastAPI | `/companies`, `/flags`, `/market/overview`, `POST /refresh` |
| **Frontend** | React + Recharts | لوحة RTL + dark mode |

```
yfinance ──► ETL ──► features.parquet ──► ML + Beneish ──► scores.parquet + SQLite
                                                              │
                                                         FastAPI ──► React Dashboard
```

---

## الدرجة المركّبة

| المكوّن | الوزن | المصدر |
|---------|-------|--------|
| M-Score (Beneish) | 40% | تلاعب محاسبي كلاسيكي |
| Isolation Forest | 20% | شذوذ قطاعي |
| XGBoost | 15% | احتمال (حقن synthetic) |
| قواعد إشارات | 25% | CFO/NI، ذمم، TATA، DEPI… |

**المستويات:** منخفض 0–25 · متوسط 26–50 · مرتفع 51–75 · حرج 76–100

---

## Backtest: موبايلي 2014 ✓

قبل إعلان إعادة الإصدار (نوفمبر 2014)، النظام يعطي **2013 → درجة 57 (مرتفع)** مع M-Score فوق العتبة.

```bash
python -m src.backtest.mobily
pytest tests/test_backtest_mobily.py -v
```

التفاصيل: [`docs/backtest-mobily.md`](docs/backtest-mobily.md)

> **شريحة العرض:** «سنة قبل الإعلان — 4 إشارات حمراء — كان سيرفع علمًا»

---

## الصلابة (اليوم 7)

| حالة | السلوك |
|------|--------|
| سنة واحدة فقط | `بيانات غير كافية` — بدون crash |
| NaN في مؤشرات | درجة من المتاح + شارة **ثقة منخفضة** |
| بنك | مستبعد من التسجيل + رسالة واضحة |
| تحديث | `POST /api/v1/refresh` أو `python -m src.refresh` |

```bash
pytest tests/ -v                    # 31 اختبار
python -m src.refresh --skip-fetch  # تحديث يدوي
./scripts/cron_refresh.sh           # جدولة أسبوعية
```

---

## هيكل المشروع

```
├── data/
│   ├── companies.csv          # 31 شركة
│   ├── backtest/              # موبايلي pre-restatement
│   └── processed/             # features, scores, ml_scores
├── src/
│   ├── ingestion/             # fetch, normalize, validate, run_all
│   ├── features/build.py
│   ├── models/                # beneish, scoring, ML, data_quality
│   ├── backtest/mobily.py
│   ├── api/                     # FastAPI
│   └── refresh.py
├── frontend/                  # React dashboard
├── docs/                      # api-contract, backtest, scoring
├── tests/                     # 31 pytest
└── scripts/cron_refresh.sh
```

---

## Docker

```bash
docker compose up --build    # api:8000 + web:3000
```

## النشر

```bash
cd frontend && npx vercel --prod    # VITE_API_URL=https://your-api/api/v1
docker compose up api               # Railway / Render
```

---

## الفريق

| العضو | الدور |
|-------|-------|
| المطور الخبير | المعمارية، البيانات، النماذج، API |
| عضو 2 | React Dashboard |
| عضو 3 | جمع بيانات يدوي |
| عضو 4 | العرض التقديمي |

**الخطة الكاملة:** [`خطة_تطوير_رقيب.md`](./خطة_تطوير_رقيب.md)

---

<div align="center">

*رقيب — نرصد قبل أن يرصد السوق*

**v0.9-pre-hackathon**

</div>
