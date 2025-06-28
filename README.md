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

Pro detailnější informace viz složky `client/`, `server/`, `shared/`.