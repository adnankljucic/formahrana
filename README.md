# Plan ishrane

Statična, mobile-first Next.js aplikacija za 30-dnevni plan ishrane
(27.08.2026. – 25.09.2026.) i vodič kroz pripremu u fritezi na vrući zrak.

## Stack

- Next.js 15 (App Router) · TypeScript
- Tailwind CSS v4
- Bez baze, backenda i autentikacije — svi podaci su statični iz JSON-a
- Stanje korisnika (čekirani obroci, voda, vaganja) u `localStorage` (uvijek u `try/catch`)
- Bez vanjskih UI biblioteka; ikone su inline SVG
- PWA (`manifest.webmanifest`, ikone), bez service workera

## Ekrani

- `/` — preusmjeri na današnji dan
- `/dan/[n]` — glavni ekran dana (obroci, friteza + tajmer, voda)
- `/dani` — pregled svih 30 dana
- `/friteza` — tabela postavki friteze
- `/pravila` — pravila, suplementi, zamjene
- `/napredak` — vaganje (graf) i slike forme

## Podaci

- `src/data/plan.json` — svih 30 dana (Prilog A)
- `src/data/fryer.json` — postavke friteze (Prilog B)

## Lokalni razvoj

```bash
npm install
npm run build   # mora proći bez grešaka i TypeScript upozorenja
npm run dev     # http://localhost:3000 — provjeri na telefonu preko lokalne mreže
```

## Deploy na Vercel

Nema env varijabli. Dvije opcije:

**Preko dashboarda (preporučeno):**
1. Otvori https://vercel.com/adnankljucic → **Add New… → Project**
2. Import GitHub repozitorija ovog projekta
3. Framework se automatski prepozna kao Next.js — klikni **Deploy**

**Preko CLI-ja:**
```bash
npx vercel --prod
```
