import type { Lang } from "./constants";

export type TextEntry = {
  uz: string;
  ru: string;
  en: string;
  note: string;
};

/**
 * Botning barcha matnlari. Admin paneldan tahrirlanadi (BotText jadvali).
 * DB'da yo'q bo'lsa — shu yerdagi standart qiymat ishlatiladi.
 */
export const DEFAULT_TEXTS = {
  choose_lang: {
    uz: "🎓 <b>Toshkent Xalqaro Universiteti (TIU)</b>ning rasmiy botiga xush kelibsiz!\n\nIltimos, muloqot tilini tanlang:",
    ru: "🎓 Добро пожаловать в официальный бот <b>Ташкентского Международного Университета (TIU)</b>!\n\nПожалуйста, выберите язык общения:",
    en: "🎓 Welcome to the official bot of <b>Tashkent International University (TIU)</b>!\n\nPlease choose your language:",
    note: "/start bosilganda til tanlash oynasi",
  },

  ask_passport: {
    uz: "🔐 <b>Shaxsni tasdiqlash</b>\n\nTizimdan foydalanish uchun pasport seriya va raqamingizni yuboring.\n\n📝 Namuna: <code>AA1234567</code>\n💡 JSHSHIR (14 raqam) orqali ham kirishingiz mumkin.",
    ru: "🔐 <b>Подтверждение личности</b>\n\nДля доступа к системе отправьте серию и номер паспорта.\n\n📝 Пример: <code>AA1234567</code>\n💡 Также можно войти по ПИНФЛ (14 цифр).",
    en: "🔐 <b>Identity verification</b>\n\nTo use the system, send your passport series and number.\n\n📝 Example: <code>AA1234567</code>\n💡 You may also use your PINFL (14 digits).",
    note: "Pasport so'rash matni",
  },

  passport_invalid: {
    uz: "❗️ Pasport seriyasi noto'g'ri formatda kiritildi.\n\nTo'g'ri format: 2 ta harf + 7 ta raqam — <code>AA1234567</code>\nYoki JSHSHIR — 14 ta raqam.\n\nIltimos, qayta urinib ko'ring:",
    ru: "❗️ Неверный формат паспорта.\n\nПравильный формат: 2 буквы + 7 цифр — <code>AA1234567</code>\nИли ПИНФЛ — 14 цифр.\n\nПожалуйста, попробуйте ещё раз:",
    en: "❗️ Invalid passport format.\n\nCorrect format: 2 letters + 7 digits — <code>AA1234567</code>\nOr PINFL — 14 digits.\n\nPlease try again:",
    note: "Format xato bo'lganda",
  },

  passport_not_found: {
    uz: "🚫 <b>Ma'lumot topilmadi</b>\n\n<code>{passport}</code> seriyali pasport universitet bazasida ro'yxatdan o'tmagan.\n\nIltimos, <b>universitetdagi mas'ul xodim bilan bog'laning</b> — ma'lumotlaringiz tekshirilib, bazaga kiritiladi.\n\n📞 Qabul bo'limi: {support_phone}\n📍 Manzil: {support_address}",
    ru: "🚫 <b>Данные не найдены</b>\n\nПаспорт <code>{passport}</code> не зарегистрирован в базе университета.\n\nПожалуйста, <b>свяжитесь с ответственным сотрудником университета</b> — ваши данные будут проверены и внесены в базу.\n\n📞 Приёмная: {support_phone}\n📍 Адрес: {support_address}",
    en: "🚫 <b>No record found</b>\n\nPassport <code>{passport}</code> is not registered in the university database.\n\nPlease <b>contact the responsible officer at the university</b> — your details will be verified and added.\n\n📞 Office: {support_phone}\n📍 Address: {support_address}",
    note: "Pasport bazada topilmaganda. {passport}, {support_phone}, {support_address}",
  },

  passport_found: {
    uz: "✅ <b>Shaxsingiz tasdiqlandi!</b>\n\nXush kelibsiz, <b>{name}</b>!\n\nQuyidagi menyulardan kerakli bo'limni tanlang 👇",
    ru: "✅ <b>Личность подтверждена!</b>\n\nДобро пожаловать, <b>{name}</b>!\n\nВыберите нужный раздел из меню ниже 👇",
    en: "✅ <b>Identity confirmed!</b>\n\nWelcome, <b>{name}</b>!\n\nPlease choose a section from the menu below 👇",
    note: "Muvaffaqiyatli tasdiqlash. {name}",
  },

  main_menu: {
    uz: "🏠 <b>Asosiy menyu</b>\n\n<b>{name}</b>\n{faculty} · {course}-kurs · {group}\n\nKerakli bo'limni tanlang 👇",
    ru: "🏠 <b>Главное меню</b>\n\n<b>{name}</b>\n{faculty} · {course} курс · {group}\n\nВыберите нужный раздел 👇",
    en: "🏠 <b>Main menu</b>\n\n<b>{name}</b>\n{faculty} · Year {course} · {group}\n\nChoose a section 👇",
    note: "Asosiy menyu sarlavhasi. {name}, {faculty}, {course}, {group}",
  },

  // ── Tugmalar ──
  btn_status: { uz: "📊 Status", ru: "📊 Статус", en: "📊 Status", note: "1-menyu tugmasi" },
  btn_faq: {
    uz: "❓ Savol-javoblar",
    ru: "❓ Вопросы и ответы",
    en: "❓ Q&A",
    note: "2-menyu tugmasi",
  },
  btn_abroad: {
    uz: "🌍 Chet mamlakatlarda o'qish",
    ru: "🌍 Обучение за рубежом",
    en: "🌍 Study abroad",
    note: "3-menyu tugmasi",
  },
  btn_contacts: {
    uz: "👥 Fakultet mas'ullari bilan bog'lanish",
    ru: "👥 Связь с ответственными факультета",
    en: "👥 Contact faculty officials",
    note: "4-menyu tugmasi",
  },
  btn_lang: { uz: "🌐 Tilni o'zgartirish", ru: "🌐 Сменить язык", en: "🌐 Change language", note: "" },
  btn_back: { uz: "◀️ Orqaga", ru: "◀️ Назад", en: "◀️ Back", note: "" },
  btn_home: { uz: "🏠 Asosiy menyu", ru: "🏠 Главное меню", en: "🏠 Main menu", note: "" },
  btn_support: {
    uz: "✉️ Mas'ul xodimga murojaat",
    ru: "✉️ Обращение к сотруднику",
    en: "✉️ Contact an officer",
    note: "",
  },
  btn_retry: { uz: "🔄 Qayta urinish", ru: "🔄 Попробовать снова", en: "🔄 Try again", note: "" },

  // ── Status bo'limi ──
  status_title: {
    uz: "📊 <b>TALABA MA'LUMOTLARI</b>",
    ru: "📊 <b>ДАННЫЕ СТУДЕНТА</b>",
    en: "📊 <b>STUDENT INFORMATION</b>",
    note: "Status sahifasi sarlavhasi",
  },
  lbl_fio: { uz: "F.I.O", ru: "Ф.И.О", en: "Full name", note: "" },
  lbl_faculty: { uz: "Fakultet", ru: "Факультет", en: "Faculty", note: "" },
  lbl_program: { uz: "Ta'lim yo'nalishi", ru: "Направление образования", en: "Programme", note: "" },
  lbl_course: { uz: "Kursi", ru: "Курс", en: "Year", note: "" },
  lbl_group: { uz: "Guruhi", ru: "Группа", en: "Group", note: "" },
  lbl_eduform: { uz: "Ta'lim shakli", ru: "Форма обучения", en: "Study form", note: "" },
  lbl_state: { uz: "Holati", ru: "Состояние", en: "Standing", note: "" },
  lbl_debts: { uz: "Qarzdor fanlar", ru: "Задолженности", en: "Subject debts", note: "" },
  lbl_contract: { uz: "Kontrakt qarzdorligi", ru: "Задолженность по контракту", en: "Contract debt", note: "" },
  lbl_contract_total: { uz: "Shartnoma summasi", ru: "Сумма договора", en: "Contract total", note: "" },
  lbl_contract_paid: { uz: "To'langan", ru: "Оплачено", en: "Paid", note: "" },

  no_debts: {
    uz: "✅ Qarzdor fanlar yo'q",
    ru: "✅ Задолженностей нет",
    en: "✅ No subject debts",
    note: "",
  },
  no_contract_debt: {
    uz: "✅ Kontrakt qarzdorligi yo'q",
    ru: "✅ Задолженности по контракту нет",
    en: "✅ No contract debt",
    note: "",
  },
  contract_debt_line: {
    uz: "❗️ <b>{amount} so'm</b> qarzdorlik mavjud",
    ru: "❗️ Имеется задолженность: <b>{amount} сум</b>",
    en: "❗️ Outstanding balance: <b>{amount} UZS</b>",
    note: "{amount}",
  },
  grant_note: {
    uz: "🎖 Grant asosida o'qiysiz — kontrakt to'lovi talab etilmaydi.",
    ru: "🎖 Вы обучаетесь на гранте — оплата контракта не требуется.",
    en: "🎖 You study on a state grant — no contract payment required.",
    note: "",
  },

  // ── FAQ ──
  faq_title: {
    uz: "❓ <b>SAVOL-JAVOBLAR</b>\n\nQiziqtirgan bo'limni tanlang:",
    ru: "❓ <b>ВОПРОСЫ И ОТВЕТЫ</b>\n\nВыберите интересующий раздел:",
    en: "❓ <b>QUESTIONS & ANSWERS</b>\n\nChoose a section:",
    note: "",
  },
  faq_pick_question: {
    uz: "Savolni tanlang:",
    ru: "Выберите вопрос:",
    en: "Choose a question:",
    note: "",
  },
  faq_empty: {
    uz: "📭 Hozircha savol-javoblar qo'shilmagan.",
    ru: "📭 Вопросы и ответы пока не добавлены.",
    en: "📭 No questions have been added yet.",
    note: "",
  },

  // ── Chet el ──
  abroad_title: {
    uz: "🌍 <b>CHET MAMLAKATLARDA O'QISH</b>\n\nTIU xalqaro hamkorlik dasturlari. Batafsil ma'lumot uchun dasturni tanlang:",
    ru: "🌍 <b>ОБУЧЕНИЕ ЗА РУБЕЖОМ</b>\n\nПрограммы международного сотрудничества TIU. Выберите программу для подробностей:",
    en: "🌍 <b>STUDY ABROAD</b>\n\nTIU international cooperation programmes. Select one for details:",
    note: "",
  },
  abroad_empty: {
    uz: "📭 Hozircha faol dasturlar mavjud emas.",
    ru: "📭 Активных программ пока нет.",
    en: "📭 No active programmes at the moment.",
    note: "",
  },
  lbl_university: { uz: "Universitet", ru: "Университет", en: "University", note: "" },
  lbl_duration: { uz: "Davomiyligi", ru: "Длительность", en: "Duration", note: "" },
  lbl_requirements: { uz: "Talablar", ru: "Требования", en: "Requirements", note: "" },
  lbl_deadline: { uz: "Ariza muddati", ru: "Срок подачи", en: "Application deadline", note: "" },
  lbl_contact: { uz: "Bog'lanish", ru: "Контакты", en: "Contact", note: "" },
  btn_link: { uz: "🔗 Batafsil", ru: "🔗 Подробнее", en: "🔗 Learn more", note: "" },

  // ── Fakultet mas'ullari ──
  contacts_title: {
    uz: "👥 <b>FAKULTET MAS'ULLARI</b>\n\n🏛 {faculty}\n\nKim bilan bog'lanmoqchisiz?",
    ru: "👥 <b>ОТВЕТСТВЕННЫЕ ФАКУЛЬТЕТА</b>\n\n🏛 {faculty}\n\nС кем вы хотите связаться?",
    en: "👥 <b>FACULTY OFFICIALS</b>\n\n🏛 {faculty}\n\nWho would you like to contact?",
    note: "{faculty}",
  },
  contacts_empty: {
    uz: "📭 Bu bo'lim uchun mas'ul xodim hali biriktirilmagan.\n\nIltimos, fakultet dekanati bilan bog'laning.",
    ru: "📭 Ответственный сотрудник для этого раздела пока не назначен.\n\nПожалуйста, обратитесь в деканат факультета.",
    en: "📭 No officer has been assigned to this section yet.\n\nPlease contact the faculty dean's office.",
    note: "",
  },
  lbl_position: { uz: "Lavozimi", ru: "Должность", en: "Position", note: "" },
  lbl_phone: { uz: "Telefon", ru: "Телефон", en: "Phone", note: "" },
  lbl_email: { uz: "E-mail", ru: "E-mail", en: "E-mail", note: "" },
  lbl_room: { uz: "Xona", ru: "Кабинет", en: "Room", note: "" },
  lbl_hours: { uz: "Qabul vaqti", ru: "Приёмные часы", en: "Office hours", note: "" },

  // ── Mas'ulga xabar yozish ──
  btn_write_message: {
    uz: "✉️ Xabar yozish",
    ru: "✉️ Написать сообщение",
    en: "✉️ Write a message",
    note: "Xodim kartasidagi tugma",
  },
  staff_msg_ask: {
    uz: "✍️ <b>{staff}</b>ga xabaringizni yozing.\n\nSavolingizni aniq va to'liq bayon qiling — javob shu bot orqali keladi.\n\n❌ Bekor qilish uchun /menu buyrug'ini yuboring.",
    ru: "✍️ Напишите сообщение для <b>{staff}</b>.\n\nИзложите вопрос чётко и полно — ответ придёт через этот бот.\n\n❌ Для отмены отправьте /menu.",
    en: "✍️ Write your message to <b>{staff}</b>.\n\nState your question clearly — the reply will arrive through this bot.\n\n❌ Send /menu to cancel.",
    note: "{staff} — xodim F.I.O",
  },
  staff_msg_sent: {
    uz: "✅ Xabaringiz <b>{staff}</b>ga yuborildi.\n\nJavob tayyor bo'lgach, shu bot orqali xabar olasiz.",
    ru: "✅ Ваше сообщение отправлено <b>{staff}</b>.\n\nОтвет придёт через этот бот.",
    en: "✅ Your message has been sent to <b>{staff}</b>.\n\nYou will receive the reply through this bot.",
    note: "{staff}",
  },
  staff_msg_failed: {
    uz: "⚠️ Xabarni yuborib bo'lmadi. Iltimos, birozdan so'ng qayta urinib ko'ring yoki xodimning telefon raqamiga qo'ng'iroq qiling.",
    ru: "⚠️ Не удалось отправить сообщение. Попробуйте позже или позвоните по указанному номеру.",
    en: "⚠️ The message could not be sent. Please try again later or call the phone number provided.",
    note: "",
  },
  staff_reply: {
    uz: "📩 <b>{staff}</b> javob berdi:\n\n{text}",
    ru: "📩 <b>{staff}</b> ответил(а):\n\n{text}",
    en: "📩 <b>{staff}</b> replied:\n\n{text}",
    note: "{staff}, {text}",
  },

  // ── Support ──
  support_ask: {
    uz: "✉️ Murojaatingizni yozib qoldiring — mas'ul xodim tez orada siz bilan bog'lanadi.\n\nIsmingiz, telefon raqamingiz va muammoni yozing:",
    ru: "✉️ Опишите ваше обращение — ответственный сотрудник свяжется с вами.\n\nУкажите имя, телефон и суть вопроса:",
    en: "✉️ Describe your request — an officer will contact you shortly.\n\nInclude your name, phone number and the issue:",
    note: "",
  },
  support_done: {
    uz: "✅ Murojaatingiz qabul qilindi!\n\nMas'ul xodim tez orada siz bilan bog'lanadi. Sabringiz uchun rahmat.",
    ru: "✅ Ваше обращение принято!\n\nОтветственный сотрудник свяжется с вами в ближайшее время. Спасибо за ожидание.",
    en: "✅ Your request has been received!\n\nAn officer will contact you shortly. Thank you for your patience.",
    note: "",
  },

  // ── Umumiy ──
  lang_changed: {
    uz: "✅ Til o'zgartirildi.",
    ru: "✅ Язык изменён.",
    en: "✅ Language changed.",
    note: "",
  },
  error_generic: {
    uz: "⚠️ Xatolik yuz berdi. Iltimos, biroz kutib qayta urinib ko'ring yoki /start buyrug'ini yuboring.",
    ru: "⚠️ Произошла ошибка. Подождите немного и попробуйте снова или отправьте /start.",
    en: "⚠️ Something went wrong. Please wait a moment and try again, or send /start.",
    note: "",
  },
  session_expired: {
    uz: "🔐 Sessiya tugadi. Iltimos, /start buyrug'i orqali qayta kiring.",
    ru: "🔐 Сессия истекла. Пожалуйста, войдите заново через /start.",
    en: "🔐 Session expired. Please start again with /start.",
    note: "",
  },
  blocked: {
    uz: "⛔️ Sizning botdan foydalanish imkoniyatingiz cheklangan. Universitet mas'ul xodimi bilan bog'laning.",
    ru: "⛔️ Ваш доступ к боту ограничен. Свяжитесь с ответственным сотрудником университета.",
    en: "⛔️ Your access to the bot is restricted. Please contact the responsible university officer.",
    note: "",
  },
  help: {
    uz: "ℹ️ <b>Yordam</b>\n\n/start — botni qayta ishga tushirish\n/menu — asosiy menyu\n/lang — tilni o'zgartirish\n/help — ushbu yordam\n\nQuyidagi tugmalar orqali kerakli bo'limni oching.\n\n📞 Savollar uchun: {support_phone}\n🕘 {support_working_hours}",
    ru: "ℹ️ <b>Помощь</b>\n\n/start — перезапустить бота\n/menu — главное меню\n/lang — сменить язык\n/help — эта справка\n\nИспользуйте кнопки ниже для навигации.\n\n📞 По вопросам: {support_phone}\n🕘 {support_working_hours}",
    en: "ℹ️ <b>Help</b>\n\n/start — restart the bot\n/menu — main menu\n/lang — change language\n/help — this help\n\nUse the buttons below to navigate.\n\n📞 Questions: {support_phone}\n🕘 {support_working_hours}",
    note: "{support_phone}, {support_working_hours}",
  },
  unknown_command: {
    uz: "🤔 Buyruq tushunarsiz. Quyidagi tugmalardan birini tanlang yoki /menu yuboring.",
    ru: "🤔 Команда не распознана. Выберите кнопку ниже или отправьте /menu.",
    en: "🤔 Command not recognised. Use a button below or send /menu.",
    note: "",
  },

  // ── Admin (Telegram Mini App) ──
  admin_welcome: {
    uz: "🛠 <b>Boshqaruv paneli</b>\n\nSalom, {name}! Quyidagi tugma orqali admin panelni Telegram ichida oching.",
    ru: "🛠 <b>Панель управления</b>\n\nЗдравствуйте, {name}! Откройте админ-панель прямо в Telegram.",
    en: "🛠 <b>Admin panel</b>\n\nHello, {name}! Open the admin panel right inside Telegram.",
    note: "{name}",
  },
  admin_open_btn: {
    uz: "🖥 Admin panelni ochish",
    ru: "🖥 Открыть админ-панель",
    en: "🖥 Open admin panel",
    note: "",
  },
  admin_link_ask: {
    uz: "🔐 Telegram akkauntingiz admin panelga ulanmagan.\n\nVeb paneldagi <b>Sozlamalar → Telegram ulanishi</b> bo'limidan 6 xonali kodni oling va shu yerga yuboring:",
    ru: "🔐 Ваш Telegram не привязан к админ-панели.\n\nПолучите 6-значный код в разделе <b>Настройки → Подключение Telegram</b> и отправьте его сюда:",
    en: "🔐 Your Telegram account is not linked to the admin panel.\n\nGet the 6-digit code from <b>Settings → Telegram connection</b> and send it here:",
    note: "",
  },
  admin_linked: {
    uz: "✅ Telegram akkauntingiz <b>{name}</b> nomiga ulandi.\n\nEndi /admin buyrug'i orqali panelni ochishingiz mumkin.",
    ru: "✅ Ваш Telegram привязан к аккаунту <b>{name}</b>.\n\nТеперь панель доступна по команде /admin.",
    en: "✅ Your Telegram is linked to <b>{name}</b>.\n\nUse /admin to open the panel.",
    note: "{name}",
  },
  admin_link_invalid: {
    uz: "❌ Kod noto'g'ri yoki muddati tugagan. Veb paneldan yangi kod oling.",
    ru: "❌ Код неверен или просрочен. Получите новый код в веб-панели.",
    en: "❌ The code is invalid or expired. Generate a new one in the web panel.",
    note: "",
  },
} satisfies Record<string, TextEntry>;

export type TextKey = keyof typeof DEFAULT_TEXTS;

export function defaultText(key: TextKey, lang: Lang): string {
  return DEFAULT_TEXTS[key][lang];
}
