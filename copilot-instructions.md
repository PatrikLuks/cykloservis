# Copilot-instructions: Cykloservis – nejlepší možná strategie a zadání

## 📱 Specifikace funkcí aplikace pro správu cykloservisu

### 🚀 Funkce aplikace

1. **Výběr mechanika před vstupem**
   - Před použitím aplikace musí zákazník zvolit konkrétního mechanika.
   - Mechanik je přiřazen ke konkrétnímu kolu a jeho servisním úkonům.
2. **Navedení kola**
   - Mechanik zadává stav kola a použité součástky.
   - Volné textové pole pro zadání informací.
   - 🔄 Priorita: jednoduchost – minimalizovat počet kroků a výběrů.
3. **Stav kola**
   - Stavové možnosti:
     - ✅ Je v pořádku → ANO
     - ❌ Není v pořádku → NE
4. **Záznam kilometrů**
   - Zákazník zadává počet najetých kilometrů.
   - 🎯 Cíl: motivace k pravidelné údržbě
   - Lze napojit na odměňovací systém.
5. **Typy servisu**
   - Sjednocená terminologie typů servisu:
     - 🔧 Úvodní servis
     - 🔧 Komplexní servis
6. **Přidání kola**
   - Provádí pouze mechanici.
   - Mechanik přidává kolo do systému.
7. **Kalendář a časování**
   - Záznam data přidání kola.
   - Záznam času, kdy mechanik:
     - Začal pracovat
     - Kolik času opravě věnoval
   - 🕒 Možnost přidání času:
     - Ručně
     - Automaticky přes časovač
8. **Rychlý servis (Quick Fix)**
   - Možnost označit servis jako "Rychlo fix"
9. **Verze aplikace**
   - Lite verze:
     - Obsahuje pouze základní funkce.
     - Používá se např. v partnerském provozu s omezenými funkcemi.

---

## 🔥 Nejlepší strategie pro vedení projektu

### 1. Doménový model a architektura
- Navrhni entity: Uživatel, Mechanik, Kolo, Servisní úkon, Typ servisu, Záznam km, Časování, QuickFix, Odměny.
- Jasně odděl role (zákazník, mechanik, admin) a jejich práva.
- Všechny entity a API endpointy dokumentuj (OpenAPI/Swagger).
- Modularizuj: oddělený frontend, backend, sdílené typy (monorepo, shared types).

### 2. Implementace klíčových funkcí (prioritizace)
1. Výběr mechanika a přidání kola (nejdříve základní workflow).
2. Stav kola, typy servisu, záznam kilometrů (vše s důrazem na UX a jednoduchost).
3. Kalendář, časování, Quick Fix, odměny.
4. Lite verze a feature flags.

### 3. UX a UI
- Minimalizuj počet kroků, vše navrhuj pro rychlé použití.
- Optimalizuj pro mobilní zařízení.
- Notifikace a motivace (odměny, připomínky servisu).

### 4. Testování a robustnost
- Pokryj klíčové scénáře jednotkovými, integračními a E2E testy.
- Ověřuj validaci vstupů, autentizaci, autorizaci, audit logy.
- Pravidelně refaktoruj a zvyšuj pokrytí testy.

### 5. Nasazení, monitoring, dokumentace
- CI/CD pipeline pro build, testy a nasazení.
- Monitoring chyb, výkonu a uživatelského chování.
- Dokumentace pro uživatele i vývojáře.

### 6. Iterativní vývoj
- Každou funkci implementuj v malých, testovatelných krocích.
- Průběžně validuj s uživateli a upravuj podle zpětné vazby.
- Udržuj backlog a roadmapu podle priorit a reálných potřeb provozu.

---

## 🏆 Cíl
Vytvořit robustní, bezpečnou, uživatelsky přívětivou a snadno rozšiřitelnou platformu pro cykloservis, která bude splňovat aktuální i budoucí potřeby zákazníků, mechaniků i provozovatelů.