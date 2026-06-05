#!/usr/bin/env bash
#
# OWASP ZAP passive scan (baseline) cho Trello-api.
#
# Passive scan = ZAP chỉ quan sát traffic (spider + thụ động), KHÔNG tấn công chủ động,
# nên an toàn để chạy trên môi trường dev/staging.
#
# Yêu cầu:
#   - Docker đã cài đặt và đang chạy
#   - API đang chạy tại localhost:8017 (npm run dev)
#
# Cách dùng:
#   cd Trello-api
#   npm run dev                       # terminal 1
#   npm run security:zap              # terminal 2
#
# Báo cáo: Trello-api/reports/zap/zap-report.{html,json,md}

set -euo pipefail

ZAP_PROXY_PORT="${ZAP_PROXY_PORT:-18017}"
API_PORT="${ZAP_PROXY_TARGET_PORT:-8017}"
ZAP_TARGET_PATH="${ZAP_TARGET_PATH:-/v1/status}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPORT_DIR="${API_DIR}/reports/zap"
RULES_FILE="${SCRIPT_DIR}/.zap/rules.tsv"
PROXY_PID=""

cleanup() {
  if [[ -n "${PROXY_PID}" ]] && kill -0 "${PROXY_PID}" 2>/dev/null; then
    kill "${PROXY_PID}" 2>/dev/null || true
    wait "${PROXY_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

mkdir -p "${REPORT_DIR}"
cp "${RULES_FILE}" "${REPORT_DIR}/rules.tsv"

# Kiểm tra API trên host
if ! curl -sf "http://localhost:${API_PORT}${ZAP_TARGET_PATH}" >/dev/null; then
  echo "ERROR: API không phản hồi tại http://localhost:${API_PORT}${ZAP_TARGET_PATH}"
  echo "       Hãy chạy: cd Trello-api && npm run dev"
  exit 1
fi

# Proxy 0.0.0.0 để container ZAP (host.docker.internal) truy cập được
node "${API_DIR}/scripts/zap-api-proxy.js" &
PROXY_PID=$!
sleep 1

if ! curl -sf "http://127.0.0.1:${ZAP_PROXY_PORT}${ZAP_TARGET_PATH}" >/dev/null; then
  echo "ERROR: ZAP proxy không khởi động được trên port ${ZAP_PROXY_PORT}"
  exit 1
fi

DOCKER_TARGET="http://host.docker.internal:${ZAP_PROXY_PORT}${ZAP_TARGET_PATH}"

echo "==> OWASP ZAP passive (baseline) scan"
echo "    API    : http://localhost:${API_PORT}"
echo "    Proxy  : http://0.0.0.0:${ZAP_PROXY_PORT} (for Docker)"
echo "    Target : ${DOCKER_TARGET}"
echo "    Reports: ${REPORT_DIR}"

ZAP_EXIT=0
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -v "${REPORT_DIR}:/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t "${DOCKER_TARGET}" \
  -c rules.tsv \
  -r zap-report.html \
  -J zap-report.json \
  -w zap-report.md \
  -I || ZAP_EXIT=$?

# -I: exit 0 dù có WARN (chỉ FAIL mới làm pipeline đỏ; baseline thường WARN header)

if [[ -f "${REPORT_DIR}/zap-report.json" ]]; then
  FAIL_COUNT=$(node -e "
    const fs = require('fs');
    const p = process.argv[1];
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const sites = data.site || [];
    let fail = 0;
    for (const s of sites) {
      const alerts = [].concat(s.alerts || []);
      for (const a of alerts) {
        if (String(a.riskcode) === '3' || String(a.riskdesc || '').toLowerCase().startsWith('high')) fail++;
        if (String(a.riskcode) === '4' || String(a.riskdesc || '').toLowerCase().startsWith('critical')) fail++;
      }
    }
    console.log(fail);
  " "${REPORT_DIR}/zap-report.json")
  echo "==> ZAP high/critical alerts: ${FAIL_COUNT}"
  if [[ "${FAIL_COUNT}" != "0" ]]; then
    echo "FAIL: Có cảnh báo HIGH/CRITICAL trong báo cáo ZAP."
    exit 1
  fi
fi

if [[ "${ZAP_EXIT}" -ne 0 ]]; then
  echo "FAIL: zap-baseline.py exited with code ${ZAP_EXIT}"
  exit "${ZAP_EXIT}"
fi

echo "==> PASS. Mở ${REPORT_DIR}/zap-report.html để xem chi tiết."
