# Instrukce pro Copilot

Tento soubor slouží k poskytování specifických instrukcí pro GitHub Copilot v rámci tohoto projektu.

## Pravidla a doporučení

1. **Dodržuj konvence projektu** – Respektuj existující styl kódu, pojmenovávání a strukturu složek.
2. **Komentuj složitý kód** – Pokud generuješ složitější logiku, přidej krátký komentář vysvětlující účel.
3. **Používej češtinu** – Komunikace a komentáře by měly být v češtině, pokud není uvedeno jinak.
4. **Bezpečnost** – Nevkládej citlivé údaje ani klíče přímo do kódu.
5. **Testování** – Pokud je to možné, generuj i odpovídající testy.
6. **Dokumentace** – Pokud přidáváš nové funkce, aktualizuj nebo vytvoř dokumentaci.

## Specifické instrukce

- Pokud je potřeba, rozšiř tento soubor o další pravidla dle potřeb projektu.


Struktura APlikace
Hlavní obrazovky (klient):

1. Přihlášení/registrace
2. Domovská stránka (přehled kol, rychlé akce, notifikace)
3. Přidání/úprava kola (evidence, komponenty, fotky)
4. Příjmový dotazník (interaktivní formulář, AI asistence, upload fotek)
5. Servisní kniha (historie servisů, fotodokumentace, poznámky, účtenky)
6. Poradenství a návody (foto-návody, videa, FAQ, chat s AI/servisákem)
7. Objednání servisu (rezervace termínu, výběr technika, kalkulace)
8. Věrnostní program (body, úrovně, odměny, výzvy)
9. Sklad dílů (evidence, upozornění, fotky)
10. Nastavení (profil, synchronizace, export dat)

Uživatelské flow (klient):

- Přihlášení → Domovská stránka → Výběr kola → Příjmový dotazník → AI návrh příčiny → Rezervace servisu → Notifikace → Servisní kniha → Věrnostní program → Poradenství/návody → Sklad dílů → Nastavení

Hlavní obrazovky (servisní technik):

- Přihlášení/registrace
- Přehled objednávek a servisů
- Detail zakázky (dotazník, fotky, historie)
- Komunikace s klientem (chat)
- Správa klientů a kol
- Statistiky a věrnostní program


Prioritní vývoj

- Frontend: React (web) + React Native (mobil), UI framework (např. MUI, Tailwind), zelený design, animace (Lottie)
- Backend: Node.js (Express/NestJS), REST API nebo GraphQL
- Databáze: MongoDB (servisní kniha, uživatelé, kola, díly, věrnostní body)

Další vývoj

- AI: integrace s OpenAI API (návrhy příčin, chat, personalizace)
- Cloud storage: fotky, videa (např. AWS S3)
- Notifikace: Firebase/OneSignal
- Integrace: Strava API, počasí (OpenWeatherMap)
- Autentizace: OAuth2, možnost přihlášení přes Google/Apple