# Trello API (Express + MongoDB) — Tổng quan kiểm thử

Backend Node.js/Express + MongoDB. Tài liệu chi tiết: [../docs/TEST_PLAN.md](../docs/TEST_PLAN.md).

## Tổng quan

| Loại test | Kỹ thuật | Số lượng | Thư mục |
|-----------|----------|----------|---------|
| Unit | White-box (branch, BVA, EP, mock) | 70 test | `src/tests/unit/` |
| Integration | Black-box API qua HTTP | 83 test / 10 file | `src/tests/integration/` |
| Fuzz | Property-based (fast-check) | 9 property (300–1000 runs) | `src/tests/fuzz/` |
| **Tổng tự động** | | **162 test** | |

- **Coverage:** 100% statements / branches / functions / lines trên 8 file trọng yếu (`utils/*`, `middlewares/authMiddleware.js`, `validations/*`).
- **Mutation score:** 97.92% (Stryker, mutate 3 file `src/utils/*`).
- **Passive security:** 7 ca `TC-SEC-PASSIVE-*` (kiểu OWASP ZAP passive) trong `integration/security.passive.integration.test.js`.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm test` | Chạy unit + integration + fuzz |
| `npm run test:unit` | Chỉ unit (white-box) |
| `npm run test:integration` | Chỉ integration (Supertest) |
| `npm run test:fuzz` | Fuzz với fast-check |
| `npm run test:coverage` | Báo cáo coverage HTML trong `coverage/` |
| `npm run test:watch` | Chạy lại khi sửa file |
| `npm run test:mutation` | Mutation testing (Stryker) → `reports/mutation/mutation.html` |
| `npm run lint` | Phân tích tĩnh (ESLint) |
| `npm run security:zap` | Passive scan bằng OWASP ZAP (script `security/`) |

## Cấu trúc test

```
src/tests/
├── unit/          # White-box: authUtils, boardUtils, cardUtils, authMiddleware, Joi validations
├── integration/   # Black-box API: auth/board/column/card/invitation + security.passive
├── fuzz/          # Property-based: auth, board, card, validation
├── helpers/       # integrationHelpers.js (app, register, login, cookie)
├── setup.js       # MongoDB in-memory (mongodb-memory-server), dọn DB sau mỗi test
└── setup.env.js   # Gán JWT secrets cho môi trường test
```

## Phương pháp

- **White-box:** test theo nhánh code (`if/else`, `try/catch`), có comment nhánh trong test; đo bằng coverage.
- **Black-box:** gọi API thật qua Supertest, chỉ quan tâm input → response (status/body/header). Không cần `.env` thật — DB chạy in-memory, email được mock.
- **Fuzz:** sinh input ngẫu nhiên hàng trăm–nghìn lần, kiểm tra contract của hàm (không crash, throw/return đúng).
- **Mutation:** cố ý sửa hỏng code (mutant) để kiểm tra test có "giết" được lỗi — đánh giá chất lượng test.

## Công cụ

Jest · Supertest · mongodb-memory-server · fast-check · Stryker · babel-jest · ESLint.
