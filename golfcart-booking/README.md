# Golfbilsbokning – Yamaha Drive2

Bokningssystem för uthyrning av Yamaha Drive2 golfbilar. MVP med **manuellt
Swish-flöde**: kunden bokar och Swishar till ett nummer med en referenskod,
admin bekräftar betalningen och då släpps bilens upplåsningskod (kod till
nyckelskåpet) till kunden i appen.

## Så funkar flödet

1. Kunden skapar konto (e-post + lösenord) och bokar en ledig bil för ett
   pass (default 5 h). Bokningen blir `AWAITING_PAYMENT` och tidsluckan
   reserveras i 30 min (`hold_expires_at`).
2. Kunden ser: *"Swisha 500 kr till 070-… och skriv GB-XXXX i meddelandet"*.
3. Admin ser bokningen i kön **Väntar på betalning**, stämmer av mot
   Swish/banken och klickar **Markera som betald** → bokningen blir
   `CONFIRMED` och kundens app visar upplåsningskoden.
4. När passet är slut blir bokningen `COMPLETED` och bilen ledig igen.
   Obetalda bokningar vars hold gått ut blir `EXPIRED` automatiskt.

## Teknik

Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 +
shadcn/ui-komponenter · PostgreSQL + Prisma · Auth.js (NextAuth v5) · Zod ·
date-fns (`Europe/Stockholm`) · pnpm · Docker.

## Köra lokalt

Krav: Node 22+, pnpm, PostgreSQL (eller Docker).

```bash
pnpm install
cp .env.example .env        # fyll i DATABASE_URL och AUTH_SECRET
pnpm prisma migrate dev     # skapar schema + btree_gist-constraint
pnpm db:seed                # inställningar, admin, testkund, 6 bilar
pnpm dev
```

Seed-konton: `admin@example.com` / `admin1234` (styrs av `SEED_ADMIN_EMAIL`/
`SEED_ADMIN_PASSWORD`) samt testkunden `kund@example.com` / `kund1234`.
**Byt admin-lösenordet i produktion.**

Smoke-test av affärslogiken (kräver databas):

```bash
pnpm tsx --env-file=.env scripts/smoke-test.ts
```

## Köra med Docker

```bash
cp .env.example .env   # sätt POSTGRES_PASSWORD och AUTH_SECRET
docker compose up --build -d
```

Migrationer körs automatiskt vid appstart (`prisma migrate deploy`).
Seed körs mot containerns databas, t.ex. genom att tillfälligt exponera
db-porten (`ports: 5432:5432` på db-tjänsten) och köra
`DATABASE_URL=postgresql://golfcart:<lösenord>@localhost:5432/golfcart pnpm db:seed`.

Appen lyssnar på `127.0.0.1:3000` – tänkt att köras i en Proxmox LXC bakom
en reverse proxy (Caddy eller nginx) som sköter TLS, t.ex. Caddy:

```
boka.dindoman.se {
    reverse_proxy 127.0.0.1:3000
}
```

## Miljövariabler

Se `.env.example`. Viktigast:

| Variabel | Beskrivning |
| --- | --- |
| `DATABASE_URL` | PostgreSQL-anslutning |
| `AUTH_SECRET` | Sessionshemlighet (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | `true` bakom reverse proxy |
| `PAYMENT_PROVIDER` | `manual-swish` (default), `mock` (test), `swish` (Fas 2) |

Swish-nummer, pris, passlängd och hold-tid är **admininställningar** i UI:t
(Admin → Inställningar), inte miljövariabler.

## Arkitektur & viktiga affärsregler

- **Dubbelbokningsskydd på databasnivå:** `bookings` har en exclusion
  constraint (`btree_gist`) som förbjuder överlappande `AWAITING_PAYMENT`/
  `CONFIRMED`-bokningar per bil. Appkoden litar på den och översätter
  constraint-fel till användarvänliga meddelanden.
- **Statushärledning:** "uthyrd nu" = det finns en `CONFIRMED`-bokning som
  täcker `now()`. "Tillgänglig igen" = pågående boknings sluttid. Ingen cron:
  `refreshBookingStatuses()` körs lat före relevanta läsningar och flyttar
  utgångna holds → `EXPIRED` och passerade pass → `COMPLETED`.
- **Upplåsningskoden** exponeras aldrig i kundvyer/queries förrän bokningen
  är `CONFIRMED` (`unlock_code_released_at` sätts när admin markerar betald).
- **Rollskydd server-side:** alla admin-sidor och admin-actions anropar
  `requireAdmin()`; kundsidor `requireUser()`. Aldrig bara UI-skydd.

## Byta manuellt → automatiskt Swish (Fas 2)

Betalflödet ligger bakom `PaymentProvider`-interfacet i
`src/lib/payments/types.ts` med implementationerna `ManualSwishProvider`
(default) och `MockPaymentProvider`. För Swish Handel:

1. Teckna **Swish Handel-avtal** via banken och skaffa klientcertifikat
   (CSR signeras hos Swish). Kommunikationen sker med mutual TLS –
   certifikaten monteras som filer/secrets, checkas aldrig in.
2. Implementera `SwishPaymentProvider` bakom samma interface
   (e-commerce-flödet + QR först), registrera den i
   `src/lib/payments/index.ts` och sätt `PAYMENT_PROVIDER=swish`.
3. Callback-URL:en kräver **publik HTTPS på port 443**. Lita inte enbart på
   callbacken – hämta alltid slutstatus från Swish-API:t innan bokningen
   markeras betald. Testa mot Merchant Swish Simulator (MSS).
4. Behåll `manual-swish` som fallback för kunder som inte kan använda flödet.

## Byta enkel auth → BankID (Fas 3)

Identitetsverifieringen har ett förberett `IdentityProvider`-interface i
`src/lib/identity/types.ts` (+ `MockIdentityProvider` för dev). Rekommenderad
väg: en BankID-broker (Criipto/Signicat) som OpenID Connect-provider i
Auth.js (`src/auth.ts` – lägg till i `providers`), så slipper vi
certifikathantering. Endast BankID API v6 gäller (animerad QR/autostart-token,
ingen personnummerinmatning). Spara `bankid_subject` + namn, sätt
`bankid_verified = true`; lagra inte personnummer i klartext.

## Produktion – checklista

- [ ] Publik HTTPS-domän bakom Caddy/nginx (krävs även för Swish-callbacks i Fas 2)
- [ ] Starkt `AUTH_SECRET` + starkt databaslösenord
- [ ] Byt seed-adminens lösenord (eller sätt `SEED_ADMIN_*` innan seed)
- [ ] Sätt riktigt Swish-nummer och pris under Admin → Inställningar
- [ ] Backup av Postgres-volymen
- [ ] GDPR: persondata är minimal (namn, e-post, ev. telefon); radering av
      kund = anonymisera User-raden. Personnummer lagras inte.
      Upplåsningskoder och lösenord loggas aldrig.
