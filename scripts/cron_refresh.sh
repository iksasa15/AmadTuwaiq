#!/usr/bin/env bash
# جدولة أسبوعية — أضف إلى crontab:
# 0 6 * * 0 /path/to/AmadTuwaiq/scripts/cron_refresh.sh >> /tmp/raqeeb-refresh.log 2>&1

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source .venv/bin/activate
python -m src.refresh --skip-fetch
