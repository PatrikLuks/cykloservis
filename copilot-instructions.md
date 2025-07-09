# Copilot Instructions for Cykloservis Project

## Kontext projektu
Tento projekt je návrh a vývoj moderní webové/mobilní aplikace pro servisní techniky kol a jejich klienty. Cílem je maximální uživatelský komfort, jednoduchost, gamifikace a AI asistence. Zadání, požadavky a technické detaily jsou popsány v souborech `chatgpt.txt`, `prompt.txt`, `technologie.txt` a `zadaniWord.txt`.

## Hlavní principy a požadavky

- **Uživatelské role:** Klient a servisní technik, každý má vlastní tok aplikací a funkce.
- **Funkce pro klienta:**
  - Registrace/přihlášení (OAuth2: Google, Apple)
  - Evidence více kol, přidání kola, fotky, komponenty
  - Interaktivní příjmový dotazník s AI asistencí (návrh příčiny závady)
  - Rezervace servisu, výběr technika, kalkulace ceny
  - Servisní kniha (historie, fotky, účtenky, poznámky)
  - Věrnostní program (body, úrovně, výměna za slevy, výzvy)
  - Poradenství (foto/video návody, AI chat, FAQ)
  - Komunikace s technikem (chat, zasílání fotek)
  - Doporučení oblečení dle počasí (OpenWeatherMap API)
  - Propojení se Strava API (import kilometráže)
- **Funkce pro technika:**
  - Správa profilu, přehled zakázek, evidence kol a klientů
  - Zadání stavu kola, komponent, fotky
  - Záznam času opravy (manuálně i časovačem)
  - Možnost "Rychlo fix" záznamu
  - Statistiky (čas práce, počet zakázek, hodnocení)
  - Komunikace s klientem (chat)

## Technologický stack
- **Frontend:** React (web), React Native (mobil), TailwindCSS, MUI, Lottie
- **Backend:** Node.js + Express/NestJS, REST API nebo GraphQL
- **Databáze:** MongoDB (NoSQL, dynamická pole)
- **Cloud:** Cloudinary/AWS S3 (fotky, videa), Firebase/OneSignal (notifikace)
- **AI:** OpenAI API (NLP, asistence, návrhy), OpenWeatherMap API, Strava API
- **Autentizace:** OAuth2 (Google, Apple)

## Design a UX
- Hlavní barva: zelená (svěží, důvěryhodná)
- Styl: jednoduchý, přehledný, hravé prvky (animace, gamifikace)
- UI: velká tlačítka, intuitivní navigace, vše na pár kliknutí

## Databázový model (zjednodušeně)
- Users, Bikes, Components, ServiceRequests, LoyaltyPoints, Messages (viz `chatgpt.txt`)

## MVP a roadmapa
- MVP: Webová aplikace, základní evidence, rezervace, chat, notifikace
- Další verze: AI asistence, věrnostní program, mobilní appka, integrace Strava/počasí, pokročilé AI návrhy

## Specifika z `zadaniWord.txt`
- Výběr mechanika před vstupem
- Mechanik zadává stav kola a komponent
- Stav kola: ANO/NE
- Záznam kilometrů (motivace k údržbě, napojení na odměny)
- Typy servisu: úvodní, komplexní, rychlo fix
- Záznam času oprav (manuálně i časovačem)
- Lite verze: základní funkce, omezené možnosti

## Další doporučení
- Vždy preferuj jednoduchost, přehlednost a minimum kroků pro uživatele
- Všechny klíčové funkce a obrazovky musí být v souladu s požadavky v textech projektu
- Při návrhu a vývoji respektuj gamifikaci, AI asistenci a zelený design

---

Tento soubor shrnuje zadání a klíčové principy projektu. Při generování kódu, návrhů nebo dokumentace vždy vycházej z těchto instrukcí a obsahu přiložených TXT souborů.
