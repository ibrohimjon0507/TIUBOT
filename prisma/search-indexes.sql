-- Tezkor matnli qidiruv uchun trigram indekslari.
-- Prisma sxemasida ifodalab bo'lmaydi, shuning uchun alohida SQL sifatida qo'llanadi:
--   npm run db:search-indexes
--
-- pg_trgm ILIKE '%...%' so'rovlarini indeks orqali bajarishga imkon beradi —
-- katta bazada ham qidiruv tez ishlaydi.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Talabalar
CREATE INDEX IF NOT EXISTS student_fullname_trgm
  ON "Student" USING GIN ("fullName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_group_trgm
  ON "Student" USING GIN ("groupName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_program_trgm
  ON "Student" USING GIN ("program" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS student_passport_trgm
  ON "Student" USING GIN ("passportSeries" gin_trgm_ops);

-- Bot foydalanuvchilari
CREATE INDEX IF NOT EXISTS botuser_username_trgm
  ON "BotUser" USING GIN ("username" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS botuser_firstname_trgm
  ON "BotUser" USING GIN ("firstName" gin_trgm_ops);

-- Rejalashtiruvchi yangi indekslardan foydalanishi uchun statistika yangilanadi
ANALYZE "Student";
ANALYZE "BotUser";
