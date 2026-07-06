# استطلاع مصادر البيانات — مشروع رقيب
> آخر تحديث: 6 يوليو 2026

## القرار النهائي

| الأولوية | المصدر | الاستخدام |
|----------|--------|-----------|
| **أساسي** | `yfinance` | جلب القوائم المالية الثلاث (دخل، مركز مالي، تدفقات) كـ DataFrame |
| **احتياطي 1** | `argaam.com` | scraping جداول HTML للشركات الناقصة |
| **احتياطي 2** | Google Sheet (عضو 3) | إدخال يدوي للشركات التي فشل جلبها |
| **مرجعي** | `saudiexchange.sa` | التحقق من الأرقام والإفصاحات الرسمية |

---

## 1. yfinance (المصدر الأساسي)

```python
import yfinance as yf
t = yf.Ticker("2222.SR")
t.financials      # قائمة الدخل
t.balance_sheet   # المركز المالي
t.cashflow        # التدفقات النقدية
```

**المميزات:**
- بيانات جاهزة كـ pandas DataFrame
- يدعم `.SR` suffix للسوق السعودي
- ثلاث قوائم مالية دفعة واحدة
- لا يحتاج scraping

**العيوب:**
- قد ينقص بيانات لبعض الشركات الصغيرة (10–20%)
- الأعمدة = سنوات مالية (الأحدث أولاً)
- أسماء البنود بالإنجليزية — نحتاج mapping موحّد
- تأخير محتمل عن الإفصاحات الرسمية

**الاختبار:** شغّل `python -m src.ingestion.fetch_yf` — النتائج في `data/raw/` والفاشلة في `data/failed.txt`

---

## 2. saudiexchange.sa (تداول)

**الملاحظات:**
- الإفصاحات المالية غالباً **PDF** وليست HTML منظمة
- لا يوجد API عام واضح للقوائم المالية
- مفيد للتحقق اليدوي وليس للجلب الآلي bulk
- Network tab: طلبات XHR محدودة، معظم المحتوى server-rendered

**القرار:** مرجع للتحقق فقط، ليس مصدر جلب أساسي.

---

## 3. argaam.com (أرقام)

**الملاحظات:**
- صفحات الشركات تحتوي جداول مالية HTML نظيفة
- URL pattern: `https://www.argaam.com/ar/company/companyoverview/XXXX`
- أسهل للـ scraping من تداول
- يحتاج `requests` + `BeautifulSoup`
- قد يتطلب headers مناسبة لتجنب الحظر

**القرار:** مصدر احتياطي — نبنيه في اليوم 2–3 إذا تجاوز فشل yfinance 20%.

---

## 4. mapping البنود المالية (yfinance → Beneish)

| Beneish يحتاج | yfinance (balance_sheet / financials) |
|---------------|---------------------------------------|
| Receivables | Accounts Receivable |
| Sales / Revenue | Total Revenue |
| COGS | Cost Of Revenue |
| Total Assets | Total Assets |
| Current Assets | Current Assets |
| PP&E | Net PPE / Property Plant Equipment |
| SGA | Selling General And Administration |
| Total Debt | Total Debt |
| Depreciation | Depreciation (cashflow) |
| Net Income | Net Income |
| Operating Cash Flow | Operating Cash Flow |

---

## 5. خطة Fallback

```
yfinance → نجح؟ → data/raw/{ticker}/*.parquet
         → فشل؟ → data/failed.txt → عضو 3 يملأ Google Sheet
                              → ETL يدوي → data/interim/
```
