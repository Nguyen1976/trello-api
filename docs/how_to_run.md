# API
cd Trello-api
npm test              # unit + integration + fuzz
npm run test:unit
npm run test:integration
npm run test:fuzz
npm run test:mutation
npm run test:coverage
# Web
cd Trello-web
npm test              # RTL + validators
npm run test:e2e      # Selenium (cần FE + BE + .env E2E_*)