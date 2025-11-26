# Deskripsyon Konplè Pwojè "Winning Code Lab"

Ou gen yon pwojè ki gen anpil potansyèl, ki òganize tankou yon "monorepo" (plizyè pwojè nan yon sèl repozitwa). Li divize an de gwo pati:

## 1. Aplikasyon prensipal la (`web-app/`)
Sa a se kè pwojè a. Se yon aplikasyon entènèt modèn, dinamik, e konplè ki bati ak teknoloji pèfòman.

### Teknoloji :
*   **Next.js (ak React)**: Yon platfòm (framework) React ki trè popilè pou bati sit entènèt rapid ak referansman (SEO) fasil.
*   **TypeScript**: Yon vèsyon JavaScript ki gen tipaj, sa ki rann kòd la pi solid ak pi fasil pou jere.
*   **Tailwind CSS**: Pou kreye yon konsepsyon (design) modèn epi pèsonalize san w pa ekri anpil kòd CSS.
*   **Supabase SSR**: Entegrasyon pafè ak Supabase pou jere otantifikasyon ak done itilizatè yo bò sèvè a.

### Fonksyonalite kle :
*   **Multi-lang**: Sit la disponib nan plizyè lang (Anglè, Panyòl, Franse, ak Kreyòl), jan dosye `messages/` yo ak estrikti `[locale]` nan URL yo montre sa.
*   **Sistèm Otantifikasyon**: Itilizatè yo ka kreye kont (`/register`) epi konekte (`/login`).
*   **Pòtay Kliyan (`/client`)**: Yon espas prive kote kliyan ou yo ka konekte pou yo wè pwojè yo, fakti yo, voye mesaj, epi jwenn aksè a dosye yo.
*   **Panno Administratè (`/admin`)**: Yon seksyon pou ou menm (oswa administratè) pou jere tout aspè platfòm nan: kliyan, pwojè, fakti, itilizatè, elatriye.
*   **Pòtay pou Ekip (`/team`)**: Yon espas pou manm ekip ou a jere travay yo, mesaj, ak lòt aktivite entèn yo.
*   **Lòt Paj**: Paj piblik tankou blog, services, projects, about, elatriye.

## 2. Backend ak Baz Done (Supabase)
Pwojè a itilize Supabase kòm sèvis "Backend-as-a-Service" (BaaS). Sa vle di Supabase jere tout bagay ki dèyè sèn nan.

*   **Baz Done**: Tout done aplikasyon an (itilizatè, pwojè, pòs blog, sèvis, mesaj) estoke nan yon baz done PostgreSQL jere pa Supabase. Dosye `migrations/` yo genyen tout estrikti tab yo.
*   **Otantifikasyon**: Supabase jere enskripsyon, koneksyon, ak sekirite aksè itilizatè yo.
*   **Fonksyon Serverless (`supabase/functions/`)**: Ou genyen fonksyon espesyalize k ap woule sou sèvè Supabase yo, tankou:
    *   `contact-form-handler`: Pou jere mesaj ki soti nan fòm kontak la.
    *   `generate-signed-urls`: Pou kreye lyen sekirize pou telechaje fichye.
    *   `scheduled-cleanup`: Pou fè netwayaj otomatik sou baz done a.

## 3. Sit Estatik (nan Rasin Pwojè a)
Dosye tankou `index.html`, `about.html`, `script.js`, elatriye, ki nan rasin pwojè a, sanble se yon premye vèsyon sit la. Li se yon sit estatik senp. Akòz nouvo aplikasyon Next.js la, sit sa a ka konsidere kòm demode oswa itilize pou yon lòt rezon. Se aplikasyon `web-app/` la ki vrè motè pwojè a kounye a.
