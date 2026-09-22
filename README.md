# TIU — Telegram bot + Admin panel

Toshkent Xalqaro Universiteti (TIU) talabalari uchun uch tilli Telegram bot va uni to'liq
boshqaradigan veb admin panel.

---

## Imkoniyatlar

### Telegram bot

| Bosqich | Tavsif |
| --- | --- |
| `/start` | 🇺🇿 O'zbek · 🇷🇺 Русский · 🇬🇧 English — til tanlash |
| Tasdiqlash | Pasport seriyasi (`AA1234567`) yoki JSHSHIR (14 raqam) bo'yicha talabani aniqlash |
| Topilmasa | «Universitetdagi mas'ul xodim bilan bog'laning» + murojaat qoldirish tugmasi |
| Topilsa | Salomlashish va **inline** asosiy menyu |

**Asosiy menyu — ekranning pastidagi doimiy klaviatura** (tugmalar admin paneldan boshqariladi):

1. **📊 Status** — F.I.O · Fakultet · Ta'lim yo'nalishi · Kursi · Guruhi · Ta'lim shakli ·
   **Holati** (o'qimoqda / qarzdor fanlar / 3 ta fandan qarzdor / kursdan kursga qolgan /
   talaba safidan chiqarilgan / akademik ta'til / bitirgan) · qarzdor fanlar ro'yxati ·
   **kontrakt qarzdorligi**
2. **❓ Savol-javoblar** — kategoriyalar → savollar → javob (admin paneldan to'liq boshqariladi)
3. **🌍 Chet mamlakatlarda o'qish** — xalqaro dasturlar, talablar, muddatlar, havola
4. **👥 Fakultet mas'ullari bilan bog'lanish** — Guruh murabbiysi (Kurator) ·
   Kurs dekan o'rinbosari · Mutaxassislik kafedra moduli · Fakultet dekani —
   **shu yerning o'zidan xodimga xabar yozish** mumkin

Kurator talabaning **guruhi** bo'yicha, dekan o'rinbosari **kursi** bo'yicha avtomatik tanlanadi.

### Mas'ulga xabar yozish oqimi

```
Talaba → xodim kartasi → «✉️ Xabar yozish» → matn yuboradi
   ↓
Topikli guruhdagi shu xodimning mavzusiga tushadi (talaba ma'lumotlari bilan)
   ↓
Xodim xabarga reply qiladi → javob to'g'ridan-to'g'ri talabaga boradi
   ↓
Butun yozishma admin paneldagi «💬 Mas'ul xabarlari» bo'limida ko'rinadi
```

Admin paneldan ham javob yozish mumkin — u ham xodim nomidan talabaga yetib boradi.

### Telegram Mini App

Admin panelni Telegram ichida ochish mumkin: botda `/admin` → «🖥 Admin panelni ochish».
Ulanish veb paneldagi **Sozlamalar → Telegram ulanishi** bo'limidagi 6 xonali kod orqali
amalga oshiriladi. Mini App uchun `PUBLIC_URL` **https** bo'lishi shart.

### Admin panel

- **Boshqaruv paneli** — ko'rsatkichlar, talabalar holati taqsimoti, jonli faoliyat oqimi
- **Talabalar** — qidiruv, filtrlar, CRUD, CSV import, «botda qanday ko'rinadi» jonli ko'rinishi
- **Fakultet va mas'ullar** — fakultetlar va 4 ta rol bo'yicha xodimlar
- **Savol-javoblar** — kategoriyalar va savollar (UZ/RU/EN)
- **Chet elda o'qish** — dasturlar (UZ/RU/EN)
- **Mas'ul xabarlari** — talaba ↔ xodim yozishmalari, paneldan javob yozish
- **Murojaatlar** — pasporti topilmaganlarning so'rovlari, botdan javob yuborish
- **Xabar yuborish** — ommaviy xabar (barcha / fakultet / kurs / guruh / holat bo'yicha)
- **Bot foydalanuvchilari** — tasdiqlash holati, bloklash, tasdiqni bekor qilish
- **Menyu tugmalari** — botning pastki klaviaturasini tahrirlash, yangi tugma qo'shish
- **Bot matnlari** — botdagi **har bir xabar** uch tilda tahrirlanadi
- **Sozlamalar** — universitet ma'lumotlari, mas'ullar guruhi, Telegram ulanishi, webhook,
  administrator akkauntlari

### Menyu tugmalari turlari

| Tur | Nima qiladi |
| --- | --- |
| **Tizim bo'limi** | Botning tayyor bo'limini ochadi (Status, FAQ, Chet el, Mas'ullar, Til, Yordam) |
| **Matn chiqaradi** | Siz yozgan matnni yuboradi — e'lon, manzil, ish vaqti |
| **Matn + havola** | Matn yuboradi va ostida «Batafsil» tugmasi chiqadi |
| **Mini ilova** | Telegram ichida veb sahifani ochadi (https) |

Har bir tugmaga qator (`row`) va qatordagi o'rin (`sort`) beriladi — bir xil qatordagi
tugmalar yonma-yon joylashadi.

---

## Texnologiyalar

- **Next.js 16** (App Router, Server Actions) + **React 19**
- **Tailwind CSS v4**
- **Prisma** + SQLite (ishlab chiqish) / PostgreSQL (server)
- **grammY** — Telegram Bot API
- **jose** + **bcryptjs** — admin autentifikatsiya (JWT, httpOnly cookie)

---

## O'rnatish

```bash
npm install
cp .env.example .env     # qiymatlarni to'ldiring
npm run setup            # baza + boshlang'ich ma'lumotlar
```

### `.env`

```env
DATABASE_URL="file:./dev.db"
BOT_TOKEN="123456:AA..."                 # @BotFather dan
AUTH_SECRET="kamida-32-belgidan-iborat-tasodifiy-satr"
TELEGRAM_WEBHOOK_SECRET="tasodifiy-satr"
PUBLIC_URL="https://bot.tiu.uz"
SEED_ADMIN_EMAIL="admin@tiu.uz"
SEED_ADMIN_PASSWORD="Admin123!"
```

> ⚠️ Birinchi kirishdan keyin **Sozlamalar → Parolni o'zgartirish** orqali parolni almashtiring.

### Ishga tushirish

```bash
npm run dev     # admin panel  → http://localhost:3000
npm run bot     # Telegram bot → polling rejimi
```

Ikkalasi alohida terminalda ishlaydi.

---

### Domensiz sinash (Telegram Mini App uchun)

Telegram Mini App `localhost` bilan ishlamaydi — **https** manzil kerak. Domen sotib olmasdan
sinash uchun tunnel ishlating:

```bash
npm run dev       # 1-terminal
npm run tunnel    # 2-terminal — https://xxx.trycloudflare.com manzilini beradi
```

So'ng `.env` dagi `PUBLIC_URL` ni o'sha manzilga yozing va **dev server hamda botni qayta ishga
tushiring** (ular `.env` ni faqat startda o'qiydi).

> ⚠️ Tunnel yopilib qayta ochilsa, manzil o'zgaradi — `PUBLIC_URL` ni yangilash kerak bo'ladi.

### Mas'ullar guruhini sozlash

1. Telegram'da **supergruppa** yarating va sozlamalardan **Topics** ni yoqing
2. Botni guruhga qo'shib, **administrator** qiling («Manage topics» huquqi bilan)
3. Guruh ID'sini oling (masalan `@userinfobot` orqali) — `-100...` ko'rinishida
4. Admin panel → **Sozlamalar → Mas'ullar guruhi ID** maydoniga kiriting

Har bir mas'ul xodim uchun alohida mavzu avtomatik ochiladi.
Guruh sozlanmagan bo'lsa ham xabarlar yo'qolmaydi — ular admin panelda ko'rinaveradi.

---

## Joylashtirilgan (production)

| | |
| --- | --- |
| **Admin panel** | https://tiubot.vercel.app |
| **Bot** | [@tiustudentbot](https://t.me/tiustudentbot) |
| **Baza** | Neon PostgreSQL (Vercel Marketplace) |
| **Repozitoriya** | https://github.com/ibrohimjon0507/TIUBOT |

`main` ga push qilinsa — Vercel avtomatik qayta deploy qiladi.

Productionda bot **webhook** orqali ishlaydi (`/api/telegram`), polling kerak emas.
Webhook so'rovlari `TELEGRAM_WEBHOOK_SECRET` bilan tekshiriladi — kalitsiz so'rov 401 qaytaradi.

### Muhim: lokal ishlash va production bitta bazadan foydalanadi

`.env` dagi `DATABASE_URL` Neon'ga qaragan, ya'ni `npm run dev` productiondagi ma'lumotlarni
o'zgartiradi. Alohida sinov bazasi kerak bo'lsa — Neon'da **branch** yarating va lokal
`DATABASE_URL` ni o'shanga qarating.

> ⚠️ Webhook o'rnatilgan bo'lsa, lokal `npm run bot` (polling) ishlamaydi — Telegram ikkalasini
> bir vaqtda qo'llab-quvvatlamaydi. Lokal sinash uchun avval webhook'ni o'chiring
> (Sozlamalar → «Webhook'ni o'chirish»), sinab bo'lgach qayta o'rnating.

---

## Unumdorlik

### Ma'lumotlar bazasi

- **PgBouncer moslashuvi** — `src/lib/db.ts` ulanish satriga `pgbouncer=true` qo'shadi.
  Busiz Prisma Neon pooler bilan yuklama ostida `prepared statement "s0" already exists`
  xatosini beradi.
- **58 ta indeks** — filtr, tartiblash va bog'lanishlar bo'yicha (`prisma/schema.prisma`).
- **6 ta trigram (GIN) indeksi** — matnli qidiruv uchun (`prisma/search-indexes.sql`).
  Sxema o'zgarsa qayta qo'llang: `npm run db:search-indexes`.
- **Cold start bilan kurash** — Neon bepul rejada 5 daqiqa bo'sh tursa uxlaydi;
  uyg'onish 5–20 soniya oladi. Ikki bosqichli himoya:
  1. `connect_timeout=30`, `pool_timeout=20` — uyg'onishni kutadi
  2. Prisma kengaytmasi `P1001` / `P1017` / `P2024` xatolarida **3 martagacha
     qayta uriniladi** (1s, 2s kutish bilan). Bu xatolarda so'rov bajarilmagan,
     shuning uchun takrorlash xavfsiz — ikki marta yozib qo'yilmaydi.

  Natijada foydalanuvchi xato ko'rmaydi, faqat birinchi so'rov sekinroq bo'ladi.
- **Kesh** — bot matnlari va menyu tugmalari 2 daqiqa keshlanadi, shu sababli
  har bir bot so'rovida bazaga kamroq murojaat qilinadi.

### Qidiruv algoritmi (`src/lib/search.ts`)

So'rov so'zlarga bo'linadi; **har bir so'z** maydonlardan **kamida bittasida** uchrashi shart:

- tartib muhim emas — «rahimov IF-101» va «IF-101 rahimov» bir xil natija beradi
- katta-kichik harf farqlanmaydi
- o'zbek apostroflarining barcha ko'rinishlari (`oʻ o‘ o’ o\``) bitta belgiga keltiriladi
- pasport/JSHSHIR avtomatik normallashtiriladi (`aa 123 45 67` → `AA1234567`)

### Sinov natijasi

60 ta parallel webhook so'rovi — **60/60 muvaffaqiyatli**, o'rtacha 205 ms, barcha yozuvlar
bazaga tushgan.

### Hozirgi reja va cheklovlar

Loyiha **bepul** rejalarda ishlaydi: Vercel Hobby + Neon Free.

| Cheklov | Ta'siri | Yechim (kerak bo'lganda) |
| --- | --- | --- |
| Neon 5 daqiqadan keyin uxlaydi | Tanaffusdan keyingi 1-so'rov 5–20 s | Neon pullik rejasida scale-to-zero o'chiriladi |
| Vercel Hobby cron: 1 marta/kun | Bazani issiq ushlab turib bo'lmaydi | Vercel Pro |
| Hobby shartlari tijoriy foydalanishga ruxsat bermaydi | Rasmiy ishga tushirishda muammo | Vercel Pro (~$20/oy) |

Barqaror yuqori yuklama (doimiy 1000 faol foydalanuvchi) rejalashtirilsa — yuqoridagi
ikki obunani yoqish kerak. Bugungi sozlamalar bepul rejada maksimal barqarorlikni beradi.

## PWA — qurilmaga o'rnatish

Sayt birinchi ochilganda **service worker** (`public/sw.js`) statik fayllarni qurilmaga
yuklab qo'yadi. Foydalanuvchi buni sezmaydi, lekin keyingi ochilishlar sezilarli tez bo'ladi.

| Nima | Qayerdan |
| --- | --- |
| Statik fayllar (JS/CSS/shrift/ikonka) | qurilmadan — darhol |
| Sahifalar va ma'lumotlar | har doim serverdan — doim yangi |
| `/api/*` | hech qachon keshlanmaydi |

**Avtomatik yangilanish:** yangi versiya chiqarilsa, service worker uni fonda yuklab,
kutmasdan almashtiradi va sahifa jimgina yangilanadi. Ya'ni biz funksiya qo'shsak yoki
olib tashlasak — foydalanuvchida ham o'zgaradi, hech narsa qilishi shart emas.

**Maxfiylik:** admin sahifalarining HTML javoblari keshlanmaydi — umumiy qurilmada
boshqa odam ko'rib qolmaydi. Sayt `robots: noindex` bilan qidiruv tizimlaridan yopilgan.

Telefon brauzerida «Add to Home Screen» orqali alohida ilova sifatida o'rnatish mumkin.

---

## O'z serveringizda (muqobil)

```bash
npm run build
npm start
```

So'ng admin panel → **Sozlamalar → Telegram ulanishi → Webhook o'rnatish**.
Webhook manzili: `https://<domen>/api/telegram`

Webhook rejimida `npm run bot` kerak emas — bot Next.js server ichida ishlaydi.

### PostgreSQL ga o'tish

`prisma/schema.prisma` faylida:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

so'ng `npx prisma db push && npm run db:seed`.

---

## Sinov ma'lumotlari

Seed quyidagi demo talabalarni yaratadi:

| Pasport | Talaba | Holati |
| --- | --- | --- |
| `AA1234567` | Rahimov Aziz | O'qimoqda, qarzi yo'q |
| `AB7654321` | Yusupova Zilola | 2 ta qarzdor fan + kontrakt qarzi |
| `AC1112223` | Nazarov Otabek | 3 ta fandan qarzdor |
| `AD3334445` | Karimova Sevara | Grant asosida |
| `AE5556667` | Sobirov Jamshid | Kursdan kursga qolgan |
| `AF7778889` | Islomov Doniyor | Talaba safidan chiqarilgan |

Admin: `admin@tiu.uz` / `Admin123!`

---

## Loyiha tuzilmasi

```
prisma/
  schema.prisma          ma'lumotlar bazasi sxemasi
  seed.ts                boshlang'ich ma'lumotlar
src/
  bot/
    bot.ts               bot mantiqi (barcha handler'lar)
    keyboards.ts         inline klaviaturalar
    views.ts             xabar matnlarini shakllantirish
    polling.ts           lokal ishga tushirish
    instance.ts          webhook uchun singleton
  lib/
    constants.ts         holatlar, rollar, formatlash
    texts.ts             botning standart matnlari (3 til)
    i18n.ts              matnlarni DB'dan yuklash + kesh
    auth.ts              admin sessiyasi
    db.ts                Prisma klienti
  app/
    (admin)/             himoyalangan admin sahifalari
    actions/             server action'lar
    api/telegram/        webhook endpoint
    login/               kirish sahifasi
  components/            UI komponentlari
```

---

## Foydali buyruqlar

| Buyruq | Tavsif |
| --- | --- |
| `npm run dev` | Admin panelni ishga tushirish |
| `npm run bot` | Botni polling rejimida ishga tushirish |
| `npm run db:studio` | Prisma Studio — bazani ko'rish |
| `npm run db:seed` | Boshlang'ich ma'lumotlarni qayta yuklash |
| `npm run db:push` | Sxema o'zgarishini bazaga qo'llash |
