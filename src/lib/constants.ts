export const LANGS = ["uz", "ru", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  uz: "🇺🇿 O'zbek tili",
  ru: "🇷🇺 Русский язык",
  en: "🇬🇧 English",
};

/** Talaba holati */
export const STUDENT_STATUSES = [
  "STUDYING",
  "DEBT_SUBJECTS",
  "THREE_DEBTS",
  "REPEAT_YEAR",
  "EXPELLED",
  "ACADEMIC_LEAVE",
  "GRADUATED",
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STATUS_LABELS: Record<StudentStatus, Record<Lang, string>> = {
  STUDYING: {
    uz: "✅ O'qimoqdasiz",
    ru: "✅ Вы обучаетесь",
    en: "✅ Currently studying",
  },
  DEBT_SUBJECTS: {
    uz: "⚠️ Qarzdor fanlaringiz mavjud",
    ru: "⚠️ У вас есть академические задолженности",
    en: "⚠️ You have subject debts",
  },
  THREE_DEBTS: {
    uz: "🚫 3 ta fandan qarzdorsiz",
    ru: "🚫 Задолженность по 3 предметам",
    en: "🚫 You have 3 subject debts",
  },
  REPEAT_YEAR: {
    uz: "🔁 Kursdan kursga qolgansiz",
    ru: "🔁 Оставлены на повторный курс",
    en: "🔁 Retained in the same year",
  },
  EXPELLED: {
    uz: "❌ Talaba safidan chiqarilgansiz",
    ru: "❌ Отчислены из числа студентов",
    en: "❌ Expelled from the student body",
  },
  ACADEMIC_LEAVE: {
    uz: "⏸ Akademik ta'tildasiz",
    ru: "⏸ В академическом отпуске",
    en: "⏸ On academic leave",
  },
  GRADUATED: {
    uz: "🎓 Bitirgansiz",
    ru: "🎓 Выпускник",
    en: "🎓 Graduated",
  },
};

/** Admin panel uchun qisqa o'zbekcha nom */
export const STATUS_ADMIN_LABELS: Record<StudentStatus, string> = {
  STUDYING: "O'qimoqda",
  DEBT_SUBJECTS: "Qarzdor fanlar",
  THREE_DEBTS: "3 ta fandan qarzdor",
  REPEAT_YEAR: "Kursdan kursga qolgan",
  EXPELLED: "Talaba safidan chiqarilgan",
  ACADEMIC_LEAVE: "Akademik ta'til",
  GRADUATED: "Bitirgan",
};

export const STATUS_COLORS: Record<StudentStatus, string> = {
  STUDYING: "ok",
  DEBT_SUBJECTS: "warn",
  THREE_DEBTS: "danger",
  REPEAT_YEAR: "danger",
  EXPELLED: "danger",
  ACADEMIC_LEAVE: "muted",
  GRADUATED: "info",
};

/** Ta'lim shakli */
export const EDU_FORMS = ["KUNDUZGI", "SIRTQI", "KECHKI", "MASOFAVIY"] as const;
export type EduForm = (typeof EDU_FORMS)[number];

export const EDU_FORM_LABELS: Record<EduForm, Record<Lang, string>> = {
  KUNDUZGI: { uz: "Kunduzgi", ru: "Очная", en: "Full-time" },
  SIRTQI: { uz: "Sirtqi", ru: "Заочная", en: "Extramural" },
  KECHKI: { uz: "Kechki", ru: "Вечерняя", en: "Evening" },
  MASOFAVIY: { uz: "Masofaviy", ru: "Дистанционная", en: "Distance" },
};

/** To'lov shakli */
export const EDU_TYPES = ["KONTRAKT", "GRANT"] as const;
export type EduType = (typeof EDU_TYPES)[number];

export const EDU_TYPE_LABELS: Record<EduType, Record<Lang, string>> = {
  KONTRAKT: { uz: "Kontrakt", ru: "Контракт", en: "Contract" },
  GRANT: { uz: "Grant (davlat)", ru: "Грант (бюджет)", en: "Grant (state)" },
};

/** Fakultet mas'ullari */
export const STAFF_ROLES = ["CURATOR", "VICE_DEAN", "DEPARTMENT", "DEAN"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE_LABELS: Record<StaffRole, Record<Lang, string>> = {
  CURATOR: {
    uz: "👨‍🏫 Guruh murabbiysi (Kurator)",
    ru: "👨‍🏫 Куратор группы",
    en: "👨‍🏫 Group curator",
  },
  VICE_DEAN: {
    uz: "👔 Kurs dekan o'rinbosari",
    ru: "👔 Заместитель декана по курсу",
    en: "👔 Vice-dean of the year",
  },
  DEPARTMENT: {
    uz: "🏛 Mutaxassislik kafedra moduli",
    ru: "🏛 Модуль профильной кафедры",
    en: "🏛 Specialty department module",
  },
  DEAN: {
    uz: "🎓 Fakultet dekani",
    ru: "🎓 Декан факультета",
    en: "🎓 Dean of the faculty",
  },
};

export const STAFF_ROLE_ADMIN_LABELS: Record<StaffRole, string> = {
  CURATOR: "Guruh murabbiysi (Kurator)",
  VICE_DEAN: "Kurs dekan o'rinbosari",
  DEPARTMENT: "Mutaxassislik kafedra moduli",
  DEAN: "Fakultet dekani",
};

export const ADMIN_ROLES = ["SUPERADMIN", "ADMIN", "MODERATOR"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPERADMIN: "Super admin",
  ADMIN: "Administrator",
  MODERATOR: "Moderator",
};

export const TICKET_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED"] as const;
export const TICKET_STATUS_LABELS: Record<string, string> = {
  NEW: "Yangi",
  IN_PROGRESS: "Ko'rib chiqilmoqda",
  RESOLVED: "Hal qilindi",
};

export type DebtSubject = {
  name: string;
  credit?: number;
  semester?: number;
};

export function parseDebtSubjects(raw: string | null | undefined): DebtSubject[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s): DebtSubject | null => {
        if (typeof s === "string") return { name: s };
        if (s && typeof s.name === "string") {
          return {
            name: s.name,
            credit: typeof s.credit === "number" ? s.credit : undefined,
            semester: typeof s.semester === "number" ? s.semester : undefined,
          };
        }
        return null;
      })
      .filter((s): s is DebtSubject => s !== null);
  } catch {
    return [];
  }
}

/** "AA 1234567" -> "AA1234567" */
export function normalizePassport(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

/** O'zbekiston pasport seriyasi: 2 harf + 7 raqam. JSHSHIR: 14 raqam. */
export function isValidPassport(value: string): boolean {
  const v = normalizePassport(value);
  return /^[A-Z]{2}\d{7}$/.test(v) || /^\d{14}$/.test(v);
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })
    .format(Math.round(amount))
    .replace(/ /g, " ");
}
