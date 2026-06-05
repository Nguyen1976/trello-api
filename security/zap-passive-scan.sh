#!/usr/bin/env bash
#
# OWASP ZAP passive scan (baseline) cho Trello-api.
#
# Passive scan = ZAP chỉ quan sát traffic (spider + thụ động), KHÔNG tấn công chủ động,
# nên an toàn để chạy trên môi trường dev/staging.
#
# Yêu cầu:
#   - Docker đã cài đặt và đang chạy
#   - API đang chạy và truy cập được tại $ZAP_TARGET (mặc định http://localhost:8017)
#
# Cách dùng:
#   cd Trello-api
#   npm run dev                       # terminal 1: chạy API
#   npm run security:zap              # terminal 2: chạy passive scan
#
# Tuỳ biến target:
#   ZAP_TARGET=http://localhost:8017 npm run security:zap
#
# Báo cáo HTML/JSON sẽ nằm trong Trello-api/reports/zap/.

set -euo pipefail

ZAP_TARGET="${ZAP_TARGET:-http://localhost:8017/v1/status}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPORT_DIR="${API_DIR}/reports/zap"
RULES_FILE="${SCRIPT_DIR}/.zap/rules.tsv"

mkdir -p "${REPORT_DIR}"

# host.docker.internal cho phép container ZAP gọi về API chạy trên host (macOS/Windows).
# Trên Linux thêm --network host và đổi target về localhost nếu cần.
DOCKER_TARGET="${ZAP_TARGET/localhost/host.docker.internal}"

echo "==> OWASP ZAP passive (baseline) scan"
echo "    Target : ${DOCKER_TARGET}"
echo "    Reports: ${REPORT_DIR}"

docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -v "${REPORT_DIR}:/zap/wrk:rw" \
  -v "${RULES_FILE}:/zap/wrk/rules.tsv:ro" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t "${DOCKER_TARGET}" \
  -c rules.tsv \
  -r zap-report.html \
  -J zap-report.json \
  -w zap-report.md \
  -I

# -I  : không trả exit code khác 0 dù có cảnh báo (passive findings không làm fail pipeline)
# -c  : file cấu hình rule (ignore/warn/fail)
# -r/-J/-w : xuất báo cáo HTML/JSON/Markdown

echo "==> Done. Mở ${REPORT_DIR}/zap-report.html để xem kết quả."
