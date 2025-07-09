# cykloservis

## Rychlé spuštění

1. Ujisti se, že máš nainstalované závislosti v `/server` i `/client`:
   ```sh
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```
2. Spusť celý projekt jedním příkazem z kořenové složky:
   ```sh
   ./start.sh
   ```

Tímto se spustí backend i frontend paralelně.

---

## Vývojářské tipy

- Pro build, lint a testy používej CI skripty a příkazy v package.json.
- ESLint je nastaven pro typově bezpečné a stylistické kontroly (viz `client/eslint.config.js`).
- Pro rozšíření pravidel viz komentáře v `client/README.md`.
- Pro testování backendu používej `npm test` v adresáři `server`.
- Pro audit logy a monitoring klíčových akcí je použit middleware v `server/middleware/auditMiddleware.ts`.

---

Pro detailnější informace viz složky `client/`, `server/`, `shared/`.