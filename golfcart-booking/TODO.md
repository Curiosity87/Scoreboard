# TODO / Changelog

## Fas 0 – Grund ✅ (2026-07-07)

- [x] Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui-komponenter (pnpm)
- [x] PostgreSQL + Prisma: User, Cart, Booking, Payment, Settings
- [x] Migration med `btree_gist` exclusion constraint (dubbelbokningsskydd på DB-nivå)
- [x] Seed: inställningar, admin, testkund, 6 bilar (Bil 6 under service)

## Fas 1 – Lanserbar MVP ✅ (2026-07-07)

- [x] Konto + inloggning med e-post/lösenord (Auth.js v5, bcrypt, JWT-sessioner)
- [x] Kundvy: billista med Ledig/Uthyrd/Under service + "tillgänglig igen"-tid
- [x] Bokningsflöde: AWAITING_PAYMENT + hold (30 min) + referenskod GB-XXXX
- [x] Swish-instruktioner (belopp, nummer, referens) på bokningssidan
- [x] `PaymentProvider`-interface + `ManualSwishProvider` + `MockPaymentProvider`
- [x] `IdentityProvider`-interface + `MockIdentityProvider` (för Fas 3)
- [x] Admin: dashboard med nyckeltal + "väntar på betalning"-kö + Markera som betald
- [x] Upplåsningskod släpps till kund vid CONFIRMED, syns för admin
- [x] Admin: bokningslista, manuell bokning, avbokning
- [x] Admin: bilar (lägg till/redigera/service/låskod) och inställningar (Swish-nr, pris, passlängd, hold)
- [x] Lat statusuppdatering: EXPIRED (hold slut) och COMPLETED (pass slut)
- [x] Strukturerad loggning av betald/avbokad
- [x] Docker: multi-stage Dockerfile + docker-compose (app + Postgres), migrate deploy vid start
- [x] Smoke-test av affärslogiken (`scripts/smoke-test.ts`, 17 checkar gröna)

### Kvar/medvetet utelämnat i Fas 1

- [ ] Swish-QR-kod på betalsidan (nice-to-have, Fas 4)
- [ ] E-post/SMS-notiser vid bekräftelse (Fas 4) – koden visas i appen,
      admin ser den för att kunna SMS:a manuellt
- [ ] Öppettidsbegränsning (antagande: bokning tillåten dygnet runt)
- [ ] Kund kan bara avboka obetalda bokningar; betalda avbokas av admin

## Fas 2 – Automatisk Swish (väntar på godkännande)

- [ ] `SwishPaymentProvider` (Swish Handel, mTLS, e-commerce + QR)
- [ ] Callback-endpoint (publik HTTPS) + statusverifiering mot API:t
- [ ] MSS-tester, behåll manuellt flöde som fallback

## Fas 3 – BankID (väntar på godkännande)

- [ ] BankID via broker (Criipto/Signicat) som Auth.js-provider
- [ ] `bankid_verified`/`bankid_subject` sätts vid verifiering

## Fas 4 – Statistik & puts

- [ ] Beläggningsgrad per bil, intäktsgrafer (recharts), populäraste tider
- [ ] Designfinish, fler tomtillstånd, ev. automatiska bekräftelser
