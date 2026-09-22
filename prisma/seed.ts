import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_TEXTS } from "../src/lib/texts";
import { DEFAULT_SETTINGS } from "../src/lib/i18n";
import { DEFAULT_BUTTONS } from "../src/lib/menu";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@tiu.uz").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, fullName: "Bosh administrator", role: "SUPERADMIN" },
  });
  console.log(`✅ Admin: ${email} / ${password}`);
}

async function seedSettings() {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`✅ Sozlamalar: ${Object.keys(DEFAULT_SETTINGS).length} ta`);
}

async function seedTexts() {
  for (const [key, entry] of Object.entries(DEFAULT_TEXTS)) {
    await prisma.botText.upsert({
      where: { key },
      update: { note: entry.note },
      create: { key, uz: entry.uz, ru: entry.ru, en: entry.en, note: entry.note },
    });
  }
  console.log(`✅ Bot matnlari: ${Object.keys(DEFAULT_TEXTS).length} ta`);
}

async function seedMenuButtons() {
  const existing = await prisma.menuButton.count();
  if (existing > 0) {
    console.log("↩️  Menyu tugmalari mavjud — o'tkazib yuborildi");
    return;
  }

  for (const button of DEFAULT_BUTTONS) {
    await prisma.menuButton.create({
      data: {
        labelUz: button.texts.uz,
        labelRu: button.texts.ru,
        labelEn: button.texts.en,
        type: "BUILTIN",
        action: button.action,
        row: button.row,
        sort: button.sort,
      },
    });
  }
  console.log(`✅ Menyu tugmalari: ${DEFAULT_BUTTONS.length} ta`);
}

const FACULTIES = [
  {
    code: "IT",
    nameUz: "Axborot texnologiyalari fakulteti",
    nameRu: "Факультет информационных технологий",
    nameEn: "Faculty of Information Technologies",
    sort: 1,
  },
  {
    code: "ECON",
    nameUz: "Iqtisodiyot va biznes fakulteti",
    nameRu: "Факультет экономики и бизнеса",
    nameEn: "Faculty of Economics and Business",
    sort: 2,
  },
  {
    code: "PHIL",
    nameUz: "Filologiya va tillarni o'qitish fakulteti",
    nameRu: "Факультет филологии и преподавания языков",
    nameEn: "Faculty of Philology and Language Teaching",
    sort: 3,
  },
  {
    code: "LAW",
    nameUz: "Yuridik fanlar fakulteti",
    nameRu: "Факультет юридических наук",
    nameEn: "Faculty of Law",
    sort: 4,
  },
];

async function seedFaculties() {
  const ids: Record<string, string> = {};
  for (const f of FACULTIES) {
    const row = await prisma.faculty.upsert({
      where: { code: f.code },
      update: f,
      create: f,
    });
    ids[f.code] = row.id;
  }
  console.log(`✅ Fakultetlar: ${FACULTIES.length} ta`);
  return ids;
}

async function seedStaff(facultyIds: Record<string, string>) {
  const it = facultyIds.IT;
  const staff = [
    {
      facultyId: it,
      role: "DEAN",
      fullName: "Aliyev Sardor Baxtiyorovich",
      positionUz: "Axborot texnologiyalari fakulteti dekani, t.f.n., dotsent",
      positionRu: "Декан факультета информационных технологий, к.т.н., доцент",
      positionEn: "Dean of the Faculty of IT, PhD, Associate Professor",
      phone: "+998 71 200-00-10",
      email: "dean.it@tiu.uz",
      telegram: "@tiu_it_dean",
      room: "A binosi, 301-xona",
      workHours: "Dush–Juma, 14:00–17:00",
      sort: 1,
    },
    {
      facultyId: it,
      role: "VICE_DEAN",
      fullName: "Karimova Nilufar Rustamovna",
      positionUz: "1-kurs dekan o'rinbosari",
      positionRu: "Заместитель декана по 1 курсу",
      positionEn: "Vice-dean for the 1st year",
      phone: "+998 71 200-00-11",
      email: "vicedean1.it@tiu.uz",
      telegram: "@tiu_it_vd1",
      room: "A binosi, 305-xona",
      workHours: "Dush–Juma, 09:00–17:00",
      course: 1,
      sort: 2,
    },
    {
      facultyId: it,
      role: "VICE_DEAN",
      fullName: "Toshmatov Jasur Olimovich",
      positionUz: "2-kurs dekan o'rinbosari",
      positionRu: "Заместитель декана по 2 курсу",
      positionEn: "Vice-dean for the 2nd year",
      phone: "+998 71 200-00-12",
      email: "vicedean2.it@tiu.uz",
      telegram: "@tiu_it_vd2",
      room: "A binosi, 306-xona",
      workHours: "Dush–Juma, 09:00–17:00",
      course: 2,
      sort: 3,
    },
    {
      facultyId: it,
      role: "DEPARTMENT",
      fullName: "Yusupova Dilnoza Alisherovna",
      positionUz: "«Dasturiy injiniring» kafedrasi mudiri",
      positionRu: "Заведующая кафедрой «Программная инженерия»",
      positionEn: "Head of the Software Engineering Department",
      phone: "+998 71 200-00-15",
      email: "se.dept@tiu.uz",
      telegram: "@tiu_se_dept",
      room: "B binosi, 210-xona",
      workHours: "Dush–Juma, 10:00–16:00",
      sort: 4,
    },
    {
      facultyId: it,
      role: "CURATOR",
      fullName: "Ergashev Bekzod Shavkatovich",
      positionUz: "Katta o'qituvchi, guruh murabbiysi",
      positionRu: "Старший преподаватель, куратор группы",
      positionEn: "Senior lecturer, group curator",
      phone: "+998 90 123-45-67",
      telegram: "@bekzod_curator",
      room: "B binosi, 115-xona",
      workHours: "Har kuni, 09:00–18:00",
      groupNames: "IF-101, IF-102",
      sort: 5,
    },
    {
      facultyId: it,
      role: "CURATOR",
      fullName: "Saidova Malika Farhodovna",
      positionUz: "O'qituvchi, guruh murabbiysi",
      positionRu: "Преподаватель, куратор группы",
      positionEn: "Lecturer, group curator",
      phone: "+998 90 765-43-21",
      telegram: "@malika_curator",
      room: "B binosi, 117-xona",
      workHours: "Har kuni, 09:00–18:00",
      groupNames: "IF-201, IF-202",
      sort: 6,
    },
  ];

  const existing = await prisma.facultyStaff.count();
  if (existing === 0) {
    await prisma.facultyStaff.createMany({ data: staff });
    console.log(`✅ Fakultet mas'ullari: ${staff.length} ta`);
  } else {
    console.log("↩️  Fakultet mas'ullari mavjud — o'tkazib yuborildi");
  }
}

const FAQ_DATA: {
  emoji: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  items: {
    questionUz: string;
    questionRu: string;
    questionEn: string;
    answerUz: string;
    answerRu: string;
    answerEn: string;
  }[];
}[] = [
  {
    emoji: "📚",
    titleUz: "O'quv jarayoni",
    titleRu: "Учебный процесс",
    titleEn: "Academic process",
    items: [
      {
        questionUz: "Dars jadvalini qayerdan ko'rishim mumkin?",
        questionRu: "Где посмотреть расписание занятий?",
        questionEn: "Where can I see the class timetable?",
        answerUz:
          "Dars jadvali <b>HEMIS</b> tizimida (hemis.tiu.uz) «Dars jadvali» bo'limida joylashgan.\n\nShuningdek, jadval har semestr boshida fakultet dekanati e'lonlar taxtasida va rasmiy Telegram kanalida e'lon qilinadi.",
        answerRu:
          "Расписание размещено в системе <b>HEMIS</b> (hemis.tiu.uz) в разделе «Расписание».\n\nТакже в начале каждого семестра оно публикуется на доске объявлений деканата и в официальном Telegram-канале.",
        answerEn:
          "The timetable is available in the <b>HEMIS</b> system (hemis.tiu.uz) under «Timetable».\n\nIt is also published on the dean's office notice board and the official Telegram channel at the start of each semester.",
      },
      {
        questionUz: "Darsga kelmaganlik (davomat) qanday hisoblanadi?",
        questionRu: "Как учитывается посещаемость занятий?",
        questionEn: "How is class attendance counted?",
        answerUz:
          "Har bir fan bo'yicha ajratilgan auditoriya soatlarining <b>25% dan ortig'i</b> sababsiz qoldirilsa, talaba shu fandan yakuniy nazoratga kiritilmaydi.\n\nSababli qoldirilgan darslar uchun <b>3 ish kuni ichida</b> tasdiqlovchi hujjat (tibbiy ma'lumotnoma va h.k.) dekanatga topshirilishi shart.",
        answerRu:
          "Если студент без уважительной причины пропускает более <b>25%</b> аудиторных часов по предмету, он не допускается к итоговому контролю.\n\nПодтверждающий документ (справка и т.п.) необходимо сдать в деканат в течение <b>3 рабочих дней</b>.",
        answerEn:
          "If more than <b>25%</b> of contact hours in a subject are missed without a valid reason, the student is not admitted to the final assessment.\n\nSupporting documents (medical certificate, etc.) must be submitted to the dean's office within <b>3 working days</b>.",
      },
      {
        questionUz: "Boshqa yo'nalishga yoki universitetga o'tish mumkinmi?",
        questionRu: "Можно ли перевестись на другое направление или в другой вуз?",
        questionEn: "Can I transfer to another programme or university?",
        answerUz:
          "Ha. O'tkazish (transfer) <b>yozgi va qishki ta'tillar davrida</b> amalga oshiriladi.\n\nBuning uchun:\n1. Rektor nomiga ariza\n2. Akademik ma'lumotnoma (transkript)\n3. Pasport nusxasi\n\nHujjatlar fakultet dekanatiga topshiriladi. Fanlar farqi bo'lsa, u belgilangan muddatda topshiriladi.",
        answerRu:
          "Да. Перевод осуществляется <b>в период зимних и летних каникул</b>.\n\nНеобходимо:\n1. Заявление на имя ректора\n2. Академическая справка (транскрипт)\n3. Копия паспорта\n\nДокументы сдаются в деканат. При наличии разницы в предметах её необходимо ликвидировать в установленный срок.",
        answerEn:
          "Yes. Transfers are processed <b>during the winter and summer breaks</b>.\n\nYou need:\n1. An application addressed to the Rector\n2. An academic transcript\n3. A copy of your passport\n\nSubmit the documents to the dean's office. Any curriculum difference must be cleared within the set deadline.",
      },
      {
        questionUz: "Akademik ta'til qanday olinadi?",
        questionRu: "Как оформить академический отпуск?",
        questionEn: "How do I take academic leave?",
        answerUz:
          "Akademik ta'til <b>sog'liq holati</b> yoki <b>harbiy xizmat</b> sababli beriladi.\n\nKerakli hujjatlar:\n• Rektor nomiga ariza\n• Tibbiy-mehnat ekspert komissiyasi (VTEK) xulosasi yoki harbiy chaqiruv qog'ozi\n\nTa'til odatda <b>1 yil</b> muddatga rasmiylashtiriladi.",
        answerRu:
          "Академический отпуск предоставляется по <b>состоянию здоровья</b> или в связи с <b>призывом на военную службу</b>.\n\nДокументы:\n• Заявление на имя ректора\n• Заключение ВТЭК или повестка\n\nОтпуск оформляется, как правило, на <b>1 год</b>.",
        answerEn:
          "Academic leave is granted for <b>health reasons</b> or <b>military service</b>.\n\nRequired documents:\n• Application to the Rector\n• Medical board conclusion or call-up papers\n\nLeave is normally granted for <b>1 year</b>.",
      },
    ],
  },
  {
    emoji: "💳",
    titleUz: "Kontrakt va to'lovlar",
    titleRu: "Контракт и оплата",
    titleEn: "Contract and payments",
    items: [
      {
        questionUz: "Kontrakt to'lovini qanday amalga oshiraman?",
        questionRu: "Как оплатить контракт?",
        questionEn: "How do I pay my tuition contract?",
        answerUz:
          "To'lovni quyidagi usullarda amalga oshirishingiz mumkin:\n\n💳 <b>Click, Payme, Uzum Bank</b> — «Ta'lim» bo'limidan universitetni tanlang\n🏦 <b>Bank orqali</b> — shartnomadagi rekvizitlar asosida\n🏢 <b>Buxgalteriya</b> — bevosita universitet kassasida\n\n⚠️ To'lov chekini saqlab qo'ying va buxgalteriyaga taqdim eting.",
        answerRu:
          "Оплату можно произвести:\n\n💳 <b>Click, Payme, Uzum Bank</b> — раздел «Образование», выберите университет\n🏦 <b>Через банк</b> — по реквизитам договора\n🏢 <b>Бухгалтерия</b> — в кассе университета\n\n⚠️ Сохраните чек и предоставьте его в бухгалтерию.",
        answerEn:
          "You can pay:\n\n💳 <b>Click, Payme, Uzum Bank</b> — «Education» section, select the university\n🏦 <b>By bank transfer</b> — using the contract details\n🏢 <b>Accounting office</b> — at the university cash desk\n\n⚠️ Keep the receipt and submit it to the accounting office.",
      },
      {
        questionUz: "Kontrakt to'lovini bo'lib-bo'lib to'lash mumkinmi?",
        questionRu: "Можно ли оплачивать контракт частями?",
        questionEn: "Can I pay the contract in instalments?",
        answerUz:
          "Ha. Shartnoma summasi odatda <b>2 qismga</b> bo'lib to'lanadi:\n• 1-qism — kuzgi semestr boshigacha\n• 2-qism — bahorgi semestr boshigacha\n\nModdiy qiyinchilik bo'lsa, rektor nomiga ariza bilan <b>to'lov muddatini uzaytirish</b> so'ralishi mumkin.",
        answerRu:
          "Да. Сумма договора обычно делится на <b>2 части</b>:\n• 1 часть — до начала осеннего семестра\n• 2 часть — до начала весеннего семестра\n\nПри материальных трудностях можно подать заявление на имя ректора об <b>отсрочке платежа</b>.",
        answerEn:
          "Yes. The contract is usually split into <b>2 instalments</b>:\n• 1st — before the autumn semester\n• 2nd — before the spring semester\n\nIn case of financial hardship, you may apply to the Rector for a <b>payment deferral</b>.",
      },
      {
        questionUz: "Kontrakt qarzdorligi bo'lsa nima bo'ladi?",
        questionRu: "Что будет при задолженности по контракту?",
        questionEn: "What happens if I have a contract debt?",
        answerUz:
          "Belgilangan muddatda to'lov amalga oshirilmasa:\n\n• Talaba <b>yakuniy nazoratlarga qo'yilmaydi</b>\n• HEMIS tizimida cheklov o'rnatiladi\n• Uzoq muddatli qarzdorlikda shartnoma bekor qilinishi mumkin\n\n💡 Joriy qarzdorligingizni botdagi <b>«📊 Status»</b> bo'limidan ko'rishingiz mumkin.",
        answerRu:
          "При неоплате в установленный срок:\n\n• Студент <b>не допускается к итоговому контролю</b>\n• В HEMIS устанавливается ограничение\n• При длительной задолженности договор может быть расторгнут\n\n💡 Текущую задолженность можно посмотреть в разделе <b>«📊 Статус»</b>.",
        answerEn:
          "If payment is not made on time:\n\n• The student is <b>not admitted to final assessments</b>\n• A restriction is applied in HEMIS\n• Long-term debt may lead to contract termination\n\n💡 Check your current balance in the <b>«📊 Status»</b> section.",
      },
    ],
  },
  {
    emoji: "📝",
    titleUz: "Imtihon va baholash",
    titleRu: "Экзамены и оценивание",
    titleEn: "Exams and assessment",
    items: [
      {
        questionUz: "Baholash tizimi qanday ishlaydi?",
        questionRu: "Как работает система оценивания?",
        questionEn: "How does the grading system work?",
        answerUz:
          "Baholash <b>100 ballik</b> tizimda olib boriladi:\n\n• Joriy nazorat (JN) — 40 ball\n• Oraliq nazorat (ON) — 20 ball\n• Yakuniy nazorat (YN) — 40 ball\n\n<b>O'zlashtirish:</b>\n86–100 — a'lo (5)\n71–85 — yaxshi (4)\n60–70 — qoniqarli (3)\n60 dan past — qoniqarsiz (2) ➜ qarzdorlik",
        answerRu:
          "Оценивание ведётся по <b>100-балльной</b> системе:\n\n• Текущий контроль — 40 баллов\n• Промежуточный контроль — 20 баллов\n• Итоговый контроль — 40 баллов\n\n<b>Шкала:</b>\n86–100 — отлично (5)\n71–85 — хорошо (4)\n60–70 — удовлетворительно (3)\nменее 60 — неудовлетворительно (2) ➜ задолженность",
        answerEn:
          "Assessment uses a <b>100-point</b> scale:\n\n• Continuous assessment — 40 points\n• Midterm — 20 points\n• Final — 40 points\n\n<b>Grades:</b>\n86–100 — excellent (5)\n71–85 — good (4)\n60–70 — satisfactory (3)\nbelow 60 — fail (2) ➜ subject debt",
      },
      {
        questionUz: "Qarzdor fanni qanday topshiraman?",
        questionRu: "Как закрыть академическую задолженность?",
        questionEn: "How do I clear a subject debt?",
        answerUz:
          "Qarzdor fanlar <b>qayta topshirish sessiyasida</b> (odatda semestr boshida) topshiriladi.\n\nTartibi:\n1. Dekanatdan <b>yo'llanma (napravleniye)</b> olasiz\n2. Belgilangan kunda fan o'qituvchisiga topshirasiz\n3. Natija HEMIS tizimiga kiritiladi\n\n⚠️ Ayrim hollarda qayta o'qish to'lovi talab etiladi.",
        answerRu:
          "Задолженности закрываются в <b>период пересдач</b> (обычно в начале семестра).\n\nПорядок:\n1. Получить <b>направление</b> в деканате\n2. Сдать предмет преподавателю в назначенный день\n3. Результат вносится в HEMIS\n\n⚠️ В некоторых случаях требуется оплата за повторное изучение.",
        answerEn:
          "Debts are cleared during the <b>re-sit session</b> (usually at the start of the semester).\n\nSteps:\n1. Get a <b>referral</b> from the dean's office\n2. Take the exam with the subject teacher on the set day\n3. The result is entered into HEMIS\n\n⚠️ A repeat-study fee may apply in some cases.",
      },
      {
        questionUz: "Nechta qarzdor fan bo'lsa kursdan kursga qolaman?",
        questionRu: "При скольких задолженностях оставляют на второй год?",
        questionEn: "How many debts lead to repeating the year?",
        answerUz:
          "Qoidaga ko'ra:\n\n• <b>1–2 ta</b> qarzdor fan — keyingi kursga shartli o'tkaziladi, qarz sessiyada yopiladi\n• <b>3 ta va undan ko'p</b> qarzdor fan — talaba <b>kursdan kursga qoldiriladi</b> (qayta o'qiydi)\n• Qarz o'z vaqtida yopilmasa — talaba safidan chiqarilishi mumkin\n\n💡 O'z holatingizni <b>«📊 Status»</b> bo'limidan tekshiring.",
        answerRu:
          "По правилам:\n\n• <b>1–2</b> задолженности — условный перевод на следующий курс с ликвидацией долга\n• <b>3 и более</b> — студент <b>остаётся на повторный курс</b>\n• При непогашении долга возможно отчисление\n\n💡 Проверьте своё состояние в разделе <b>«📊 Статус»</b>.",
        answerEn:
          "As a rule:\n\n• <b>1–2</b> debts — conditional progression, debts must be cleared\n• <b>3 or more</b> — the student <b>repeats the year</b>\n• Unresolved debts may lead to expulsion\n\n💡 Check your standing in the <b>«📊 Status»</b> section.",
      },
    ],
  },
  {
    emoji: "📄",
    titleUz: "Hujjatlar va ma'lumotnomalar",
    titleRu: "Документы и справки",
    titleEn: "Documents and certificates",
    items: [
      {
        questionUz: "Talabalik haqida ma'lumotnomani qanday olaman?",
        questionRu: "Как получить справку о том, что я студент?",
        questionEn: "How do I get a student status certificate?",
        answerUz:
          "Ma'lumotnoma <b>fakultet dekanatidan</b> olinadi.\n\n1. Dekanatga ariza yozasiz (yoki HEMIS orqali buyurtma berasiz)\n2. Ma'lumotnoma <b>1–2 ish kunida</b> tayyor bo'ladi\n3. Dekanat muhri va imzosi bilan topshiriladi\n\nMa'lumotnoma harbiy komissariat, bank va boshqa tashkilotlar uchun amal qiladi.",
        answerRu:
          "Справка выдаётся в <b>деканате факультета</b>.\n\n1. Напишите заявление (или закажите через HEMIS)\n2. Справка готовится <b>в течение 1–2 рабочих дней</b>\n3. Выдаётся с печатью и подписью деканата\n\nСправка действительна для военкомата, банков и других организаций.",
        answerEn:
          "The certificate is issued by the <b>faculty dean's office</b>.\n\n1. Submit a request (or order via HEMIS)\n2. It is prepared within <b>1–2 working days</b>\n3. Issued with the dean's office stamp and signature\n\nValid for the military office, banks and other institutions.",
      },
      {
        questionUz: "Talabalik guvohnomasini yo'qotsam nima qilaman?",
        questionRu: "Что делать, если я потерял студенческий билет?",
        questionEn: "What if I lose my student ID card?",
        answerUz:
          "1. Dekanat nomiga <b>yo'qotganlik to'g'risida ariza</b> yozasiz\n2. 3x4 o'lchamdagi <b>2 dona fotosurat</b> topshirasiz\n3. Dublikat rasmiylashtirish to'lovini amalga oshirasiz\n\nYangi guvohnoma odatda <b>5–7 ish kunida</b> tayyor bo'ladi.",
        answerRu:
          "1. Напишите <b>заявление об утере</b> на имя декана\n2. Сдайте <b>2 фотографии</b> 3x4\n3. Оплатите изготовление дубликата\n\nНовый билет готов обычно через <b>5–7 рабочих дней</b>.",
        answerEn:
          "1. Write a <b>loss report</b> addressed to the dean\n2. Provide <b>2 photos</b> (3x4)\n3. Pay the duplicate issuance fee\n\nThe new card is usually ready in <b>5–7 working days</b>.",
      },
    ],
  },
  {
    emoji: "🏠",
    titleUz: "Yotoqxona va talaba hayoti",
    titleRu: "Общежитие и студенческая жизнь",
    titleEn: "Dormitory and student life",
    items: [
      {
        questionUz: "Yotoqxonaga qanday joylashaman?",
        questionRu: "Как заселиться в общежитие?",
        questionEn: "How do I get a dormitory place?",
        answerUz:
          "Yotoqxona joylari <b>imtiyozli toifalar</b> va <b>uzoq hududlardan kelgan talabalar</b>ga birinchi navbatda beriladi.\n\nHujjatlar:\n• Ariza\n• Oila tarkibi haqida ma'lumotnoma\n• Tibbiy ko'rikdan o'tganlik varaqasi\n\nHujjatlar <b>avgust oyida</b> «Yoshlar bilan ishlash» bo'limiga topshiriladi.",
        answerRu:
          "Места в общежитии предоставляются в первую очередь <b>льготным категориям</b> и студентам из <b>отдалённых регионов</b>.\n\nДокументы:\n• Заявление\n• Справка о составе семьи\n• Медицинская справка\n\nДокументы сдаются в <b>августе</b> в отдел по работе с молодёжью.",
        answerEn:
          "Dormitory places are given first to <b>privileged categories</b> and students from <b>remote regions</b>.\n\nDocuments:\n• Application\n• Family composition certificate\n• Medical clearance\n\nSubmit in <b>August</b> to the Youth Affairs department.",
      },
      {
        questionUz: "To'garaklar va klublarga qanday qo'shilaman?",
        questionRu: "Как записаться в кружки и клубы?",
        questionEn: "How can I join clubs and societies?",
        answerUz:
          "TIU'da sport, IT, debat, volontyorlik, til klublari va ijodiy to'garaklar faoliyat yuritadi.\n\nRo'yxatdan o'tish uchun <b>«Yoshlar bilan ishlash» bo'limi</b>ga yoki guruh murabbiyingizga murojaat qiling.\n\nSemestr boshida <b>«Klublar yarmarkasi»</b> tashkil etiladi.",
        answerRu:
          "В TIU работают спортивные, IT, дебатные, волонтёрские, языковые клубы и творческие кружки.\n\nДля записи обратитесь в <b>отдел по работе с молодёжью</b> или к куратору группы.\n\nВ начале семестра проводится <b>«Ярмарка клубов»</b>.",
        answerEn:
          "TIU has sports, IT, debate, volunteering, language clubs and creative societies.\n\nTo join, contact the <b>Youth Affairs department</b> or your group curator.\n\nA <b>Clubs Fair</b> is held at the start of each semester.",
      },
    ],
  },
];

async function seedFaq() {
  const existing = await prisma.faqCategory.count();
  if (existing > 0) {
    console.log("↩️  FAQ mavjud — o'tkazib yuborildi");
    return;
  }

  let total = 0;
  for (const [index, cat] of FAQ_DATA.entries()) {
    const category = await prisma.faqCategory.create({
      data: {
        emoji: cat.emoji,
        titleUz: cat.titleUz,
        titleRu: cat.titleRu,
        titleEn: cat.titleEn,
        sort: index + 1,
      },
    });
    for (const [i, item] of cat.items.entries()) {
      await prisma.faq.create({
        data: { ...item, categoryId: category.id, sort: i + 1 },
      });
      total += 1;
    }
  }
  console.log(`✅ FAQ: ${FAQ_DATA.length} kategoriya, ${total} ta savol`);
}

const PROGRAMS = [
  {
    country: "Janubiy Koreya",
    flag: "🇰🇷",
    titleUz: "Double Degree — Woosong University",
    titleRu: "Двойной диплом — Woosong University",
    titleEn: "Double Degree — Woosong University",
    descriptionUz:
      "2+2 dasturi: dastlabki 2 yil TIU'da, keyingi 2 yil Janubiy Koreyada o'qiysiz. Bitiruvchilar <b>ikkita diplom</b> — TIU va Woosong University diplomini oladi.",
    descriptionRu:
      "Программа 2+2: первые 2 года в TIU, следующие 2 года в Южной Корее. Выпускники получают <b>два диплома</b> — TIU и Woosong University.",
    descriptionEn:
      "A 2+2 programme: two years at TIU, then two years in South Korea. Graduates receive <b>two diplomas</b> — from TIU and Woosong University.",
    universityName: "Woosong University, Daejeon",
    durationUz: "2 yil (3–4 kurs)",
    durationRu: "2 года (3–4 курс)",
    durationEn: "2 years (years 3–4)",
    requirementsUz:
      "• GPA 3.0 va undan yuqori\n• IELTS 5.5 yoki TOPIK 3\n• Akademik qarzdorlik bo'lmasligi\n• Kontrakt to'lovi to'liq amalga oshirilgan bo'lishi",
    requirementsRu:
      "• GPA от 3.0\n• IELTS 5.5 или TOPIK 3\n• Отсутствие академических задолженностей\n• Полная оплата контракта",
    requirementsEn:
      "• GPA 3.0 or higher\n• IELTS 5.5 or TOPIK 3\n• No academic debts\n• Tuition fully paid",
    deadline: "Har yili 15-mart va 15-oktyabr",
    contactInfo: "Xalqaro aloqalar bo'limi: +998 71 200-00-20",
    link: "https://tiu.uz",
    sort: 1,
  },
  {
    country: "Turkiya",
    flag: "🇹🇷",
    titleUz: "Mevlana almashinuv dasturi",
    titleRu: "Программа обмена «Мевлана»",
    titleEn: "Mevlana Exchange Programme",
    descriptionUz:
      "Turkiya universitetlarida <b>1 yoki 2 semestr</b> o'qish imkoniyati. Stipendiya, turar joy va yo'l xarajatlari qisman qoplanadi. Olingan kreditlar TIU'da to'liq tan olinadi.",
    descriptionRu:
      "Возможность отучиться <b>1 или 2 семестра</b> в вузах Турции. Частично покрываются стипендия, проживание и дорожные расходы. Кредиты полностью засчитываются в TIU.",
    descriptionEn:
      "Study <b>one or two semesters</b> at Turkish universities. Scholarship, accommodation and travel costs are partially covered. Credits are fully recognised at TIU.",
    universityName: "Ankara, Istanbul, Izmir universitetlari",
    durationUz: "1–2 semestr",
    durationRu: "1–2 семестра",
    durationEn: "1–2 semesters",
    requirementsUz: "• GPA 2.75+\n• Turk yoki ingliz tili bilimi (B1+)\n• 2-kurs va undan yuqori",
    requirementsRu: "• GPA 2.75+\n• Знание турецкого или английского (B1+)\n• 2 курс и выше",
    requirementsEn: "• GPA 2.75+\n• Turkish or English (B1+)\n• Year 2 or above",
    deadline: "Har yili 1-fevral",
    contactInfo: "Xalqaro aloqalar bo'limi: international@tiu.uz",
    link: "https://tiu.uz",
    sort: 2,
  },
  {
    country: "Yevropa Ittifoqi",
    flag: "🇪🇺",
    titleUz: "Erasmus+ (KA171) mobillik dasturi",
    titleRu: "Программа мобильности Erasmus+ (KA171)",
    titleEn: "Erasmus+ (KA171) Mobility Programme",
    descriptionUz:
      "Yevropa Ittifoqining eng nufuzli akademik mobillik dasturi. <b>To'liq grant</b> asosida Germaniya, Polsha, Italiya, Ispaniya universitetlarida bir semestr o'qish.",
    descriptionRu:
      "Самая престижная программа академической мобильности ЕС. Обучение один семестр в университетах Германии, Польши, Италии, Испании на <b>полном гранте</b>.",
    descriptionEn:
      "The EU's flagship academic mobility programme. Study one semester in Germany, Poland, Italy or Spain on a <b>full grant</b>.",
    universityName: "Hamkor Yevropa universitetlari",
    durationUz: "1 semestr (5 oy)",
    durationRu: "1 семестр (5 месяцев)",
    durationEn: "1 semester (5 months)",
    requirementsUz:
      "• GPA 3.5+\n• IELTS 6.0 / TOEFL 80\n• Motivatsion xat va CV\n• Ilmiy rahbar tavsiyanomasi",
    requirementsRu:
      "• GPA 3.5+\n• IELTS 6.0 / TOEFL 80\n• Мотивационное письмо и CV\n• Рекомендация научного руководителя",
    requirementsEn:
      "• GPA 3.5+\n• IELTS 6.0 / TOEFL 80\n• Motivation letter and CV\n• Supervisor's recommendation",
    deadline: "Har yili 20-dekabr",
    contactInfo: "Xalqaro aloqalar bo'limi: erasmus@tiu.uz",
    link: "https://erasmus-plus.ec.europa.eu",
    sort: 3,
  },
  {
    country: "Malayziya",
    flag: "🇲🇾",
    titleUz: "Yozgi maktab — Kuala Lumpur",
    titleRu: "Летняя школа — Куала-Лумпур",
    titleEn: "Summer School — Kuala Lumpur",
    descriptionUz:
      "3 haftalik intensiv yozgi maktab: <b>IT, biznes va startap</b> yo'nalishlari bo'yicha amaliy mashg'ulotlar, kompaniyalarga tashrif va sertifikat.",
    descriptionRu:
      "3-недельная интенсивная летняя школа: практические занятия по <b>IT, бизнесу и стартапам</b>, посещение компаний и сертификат.",
    descriptionEn:
      "A 3-week intensive summer school: hands-on sessions in <b>IT, business and startups</b>, company visits and a certificate.",
    universityName: "Asia Pacific University (APU)",
    durationUz: "3 hafta (iyul)",
    durationRu: "3 недели (июль)",
    durationEn: "3 weeks (July)",
    requirementsUz: "• Har qanday kurs talabasi\n• Ingliz tili B1+\n• Qarzdorlik bo'lmasligi",
    requirementsRu: "• Студенты любого курса\n• Английский B1+\n• Отсутствие задолженностей",
    requirementsEn: "• Students of any year\n• English B1+\n• No academic debts",
    deadline: "Har yili 1-may",
    contactInfo: "Xalqaro aloqalar bo'limi: +998 71 200-00-20",
    sort: 4,
  },
];

async function seedPrograms() {
  const existing = await prisma.studyAbroadProgram.count();
  if (existing > 0) {
    console.log("↩️  Chet el dasturlari mavjud — o'tkazib yuborildi");
    return;
  }
  await prisma.studyAbroadProgram.createMany({ data: PROGRAMS });
  console.log(`✅ Chet el dasturlari: ${PROGRAMS.length} ta`);
}

async function seedStudents(facultyIds: Record<string, string>) {
  const existing = await prisma.student.count();
  if (existing > 0) {
    console.log("↩️  Talabalar mavjud — o'tkazib yuborildi");
    return;
  }

  const students = [
    {
      passportSeries: "AA1234567",
      pinfl: "31234567890123",
      fullName: "Rahimov Aziz Bahodirovich",
      phone: "+998 90 111-22-33",
      facultyId: facultyIds.IT,
      program: "Dasturiy injiniring",
      course: 1,
      groupName: "IF-101",
      eduForm: "KUNDUZGI",
      eduType: "KONTRAKT",
      status: "STUDYING",
      debtSubjects: "[]",
      contractTotal: 18_000_000,
      contractPaid: 18_000_000,
      contractYear: "2025/2026 o'quv yili",
    },
    {
      passportSeries: "AB7654321",
      fullName: "Yusupova Zilola Akmalovna",
      phone: "+998 93 444-55-66",
      facultyId: facultyIds.IT,
      program: "Kompyuter injiniringi",
      course: 2,
      groupName: "IF-201",
      eduForm: "KUNDUZGI",
      eduType: "KONTRAKT",
      status: "DEBT_SUBJECTS",
      statusNote: "Qarzdorlikni 15-fevralgacha yopish talab etiladi.",
      debtSubjects: JSON.stringify([
        { name: "Diskret matematika", credit: 5, semester: 2 },
        { name: "Algoritmlar va ma'lumotlar tuzilmasi", credit: 6, semester: 3 },
      ]),
      contractTotal: 18_000_000,
      contractPaid: 9_000_000,
      contractYear: "2025/2026 o'quv yili",
    },
    {
      passportSeries: "AC1112223",
      fullName: "Nazarov Otabek Ulug'bekovich",
      phone: "+998 94 777-88-99",
      facultyId: facultyIds.IT,
      program: "Axborot xavfsizligi",
      course: 2,
      groupName: "IF-202",
      eduForm: "KUNDUZGI",
      eduType: "KONTRAKT",
      status: "THREE_DEBTS",
      statusNote: "3 ta fandan qarzdorlik — dekanatga murojaat qiling.",
      debtSubjects: JSON.stringify([
        { name: "Kriptografiya asoslari", credit: 5, semester: 3 },
        { name: "Kompyuter tarmoqlari", credit: 6, semester: 3 },
        { name: "Operatsion tizimlar", credit: 5, semester: 4 },
      ]),
      contractTotal: 18_000_000,
      contractPaid: 4_500_000,
      contractYear: "2025/2026 o'quv yili",
    },
    {
      passportSeries: "AD3334445",
      fullName: "Karimova Sevara Shuhratovna",
      facultyId: facultyIds.ECON,
      program: "Bank ishi va audit",
      course: 3,
      groupName: "IQ-301",
      eduForm: "KUNDUZGI",
      eduType: "GRANT",
      status: "STUDYING",
      debtSubjects: "[]",
      contractTotal: 0,
      contractPaid: 0,
      contractYear: "2025/2026 o'quv yili",
    },
    {
      passportSeries: "AE5556667",
      fullName: "Sobirov Jamshid Rustamovich",
      facultyId: facultyIds.ECON,
      program: "Iqtisodiyot",
      course: 2,
      groupName: "IQ-201",
      eduForm: "SIRTQI",
      eduType: "KONTRAKT",
      status: "REPEAT_YEAR",
      statusNote: "2025/2026 o'quv yilida 2-kursni qayta o'qiydi.",
      debtSubjects: JSON.stringify([
        { name: "Makroiqtisodiyot", credit: 6, semester: 3 },
        { name: "Statistika", credit: 5, semester: 3 },
        { name: "Moliya", credit: 5, semester: 4 },
        { name: "Buxgalteriya hisobi", credit: 6, semester: 4 },
      ]),
      contractTotal: 12_000_000,
      contractPaid: 3_000_000,
      contractYear: "2025/2026 o'quv yili",
    },
    {
      passportSeries: "AF7778889",
      fullName: "Islomov Doniyor Farhodovich",
      facultyId: facultyIds.LAW,
      program: "Yurisprudensiya",
      course: 4,
      groupName: "YU-401",
      eduForm: "KUNDUZGI",
      eduType: "KONTRAKT",
      status: "EXPELLED",
      statusNote: "Kontrakt to'lovi amalga oshirilmagani sababli chiqarilgan.",
      debtSubjects: "[]",
      contractTotal: 16_000_000,
      contractPaid: 0,
      contractYear: "2024/2025 o'quv yili",
      isActive: true,
    },
  ];

  await prisma.student.createMany({ data: students });
  console.log(`✅ Demo talabalar: ${students.length} ta`);
  console.log("   Sinov uchun pasport: AA1234567 (o'qimoqda), AC1112223 (3 ta qarz)");
}

async function main() {
  console.log("\n🌱 TIU bot ma'lumotlar bazasini to'ldirish...\n");
  await seedAdmin();
  await seedSettings();
  await seedTexts();
  await seedMenuButtons();
  const facultyIds = await seedFaculties();
  await seedStaff(facultyIds);
  await seedFaq();
  await seedPrograms();
  await seedStudents(facultyIds);
  console.log("\n✨ Tayyor!\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed xatosi:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
