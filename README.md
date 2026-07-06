# رقيب (Raqeeb)

> منصة رقابة مالية استباقية لكشف مخاطر الاحتيال في الشركات المدرجة  
> هاكاثون امد 2026 — مصرف الإنماء × أكاديمية طويق

## الهيكل

```
├── data/
│   ├── companies.csv     # 31 شركة سعودية
│   ├── raw/              # بيانات yfinance (parquet)
│   ├── interim/          # بعد التنظيف
│   └── processed/        # جاهزة للنموذج
├── src/
│   ├── ingestion/        # fetch_yf.py
│   ├── models/           # beneish.py
│   ├── features/
│   ├── api/
│   └── utils/
├── frontend/             # React + Vite + Tailwind (RTL)
├── tests/
├── docs/
└── notebooks/
```

## إعداد البيئة

```bash
# Python
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

## الأوامر الأساسية

```bash
# Pipeline كامل (raw → processed)
python -m src.ingestion.run_all

# بدون إعادة جلب yfinance
python -m src.ingestion.run_all --skip-fetch

# خطوات منفصلة
python -m src.ingestion.normalize
python -m src.ingestion.validate
python -m src.features.build

# اختبارات
pytest tests/ -v

# الواجهة
cd frontend && npm run dev
```

## اليوم 1 ✓

- هيكل المشروع + `fetch_yf.py` + `beneish.py`
- 31 شركة في `data/companies.csv`

## اليوم 2 ✓

- `src/ingestion/normalize.py` — توحيد schema + FIELD_MAP
- `src/ingestion/validate.py` — فحوصات جودة + تقرير
- `src/features/build.py` — 23 عمود ميزة (Beneish + إضافية)
- `src/ingestion/from_sheet.py` — دمج CSV يدوي
- `src/ingestion/run_all.py` — pipeline بأمر واحد
- `docs/api-contract.md` — عقد API لعضو 2

## اليوم 3 ✓

- `src/models/beneish.py` — `compute_m_score(current, prior)` + عتبات المؤشرات
- `src/models/scoring.py` — Risk Score مركّب (0–100) + 6 قواعد إشارات
- `src/models/persist.py` — SQLite (`scores`, `flags`)
- `src/models/run_beneish.py` — تشغيل + تقرير توزيع
- اختبار Enron 2000 في `tests/test_beneish.py`

## اليوم 4 ✓

- `src/models/anomaly.py` — Isolation Forest (per-sector)
- `src/models/xgb_train.py` — حقن تلاعب + XGBoost
- `src/models/explain.py` — SHAP + تفسير عربي
- `src/models/train_ml.py` — pipeline ML كامل
- `reports/model_eval.md` + `reports/shap_summary.png`

```bash
python -m src.models.train_ml      # تدريب IF + XGB + SHAP
python -m src.models.run_beneish   # إعادة حساب الدرجة المركّبة
```

**الدرجة المركّبة (معايرة يوم 5):**
`0.40·M-Score + 0.20·IF + 0.15·XGB + 0.25·Rules`

## اليوم 5 ✓

- `src/api/main.py` — FastAPI + Swagger `/docs`
- `src/api/schemas.py` + `src/api/service.py`
- `docs/scoring-rationale.md` — منطق المعايرة
- `docker-compose.yml` — api:8000 + web:3000
- `frontend/` — قائمة شركات + بطاقة تفاصيل (API حقيقي)

```bash
# Backend
uvicorn src.api.main:app --reload --port 8000

# Frontend (proxy → API)
cd frontend && npm run dev

# Docker
docker compose up --build
```

**Swagger:** http://localhost:8000/docs

## اليوم 6 ✓ — Dashboard

- **Market Overview:** Hero + donut chart + جدول + فلتر قطاع + فرز
- **صفحة الشركة:** Score ring 72pt + إشارات حمراء + Recharts (خطي + radar)
- Skeletons + empty states + error handling
- Dark mode + responsive mobile
- `frontend/vercel.json` للنشر

```bash
# Terminal 1
uvicorn src.api.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

**نشر Frontend (Vercel):**
```bash
cd frontend && npx vercel --prod
# عيّن VITE_API_URL=https://your-api.railway.app/api/v1
```

**نشر API (Railway/Render):** Dockerfile جاهز — `docker compose up api`

## الفريق

| العضو | الدور |
|-------|-------|
| المطور الخبير | المعمارية، البيانات، النماذج، API |
| عضو 2 | React Dashboard |
| عضو 3 | جمع بيانات يدوي (Google Sheet) |
| عضو 4 | العرض التقديمي والتوثيق |

## المرجع

خطة التطوير الكاملة: [`خطة_تطوير_رقيب.md`](./خطة_تطوير_رقيب.md)
