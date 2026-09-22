import type { Faculty, FacultyStaff, Faq, Student, StudyAbroadProgram } from "@prisma/client";
import {
  EDU_FORM_LABELS,
  EDU_TYPE_LABELS,
  STAFF_ROLE_LABELS,
  STATUS_LABELS,
  formatMoney,
  parseDebtSubjects,
  type EduForm,
  type EduType,
  type Lang,
  type StaffRole,
  type StudentStatus,
} from "@/lib/constants";
import type { Translator } from "@/lib/i18n";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function localized<T extends Record<string, unknown>>(row: T, base: string, lang: Lang): string {
  const suffix = lang === "uz" ? "Uz" : lang === "ru" ? "Ru" : "En";
  const value = row[`${base}${suffix}`];
  if (typeof value === "string" && value.trim()) return value;
  const fallback = row[`${base}Uz`];
  return typeof fallback === "string" ? fallback : "";
}

export function facultyName(
  student: Student & { faculty: Faculty | null },
  lang: Lang,
): string {
  if (student.faculty) return localized(student.faculty, "name", lang);
  return student.facultyName ?? "—";
}

const DIVIDER = "─────────────────────";

/** 1-menyu: Status */
export function renderStatus(
  student: Student & { faculty: Faculty | null },
  tr: Translator,
): string {
  const lang = tr.lang;
  const status = (student.status as StudentStatus) ?? "STUDYING";
  const debts = parseDebtSubjects(student.debtSubjects);
  const contractDebt = Math.max(0, student.contractTotal - student.contractPaid);

  const lines: string[] = [];
  lines.push(tr.t("status_title"));
  lines.push(DIVIDER);
  lines.push(`👤 <b>${tr.t("lbl_fio")}:</b>\n     ${escapeHtml(student.fullName)}`);
  lines.push(`🏛 <b>${tr.t("lbl_faculty")}:</b>\n     ${escapeHtml(facultyName(student, lang))}`);
  lines.push(`📚 <b>${tr.t("lbl_program")}:</b>\n     ${escapeHtml(student.program)}`);
  lines.push(`🎯 <b>${tr.t("lbl_course")}:</b> ${student.course}`);
  lines.push(`👥 <b>${tr.t("lbl_group")}:</b> ${escapeHtml(student.groupName)}`);

  const eduForm = EDU_FORM_LABELS[student.eduForm as EduForm]?.[lang] ?? student.eduForm;
  const eduType = EDU_TYPE_LABELS[student.eduType as EduType]?.[lang] ?? student.eduType;
  lines.push(`🕘 <b>${tr.t("lbl_eduform")}:</b> ${escapeHtml(eduForm)} · ${escapeHtml(eduType)}`);

  lines.push(DIVIDER);
  lines.push(`📌 <b>${tr.t("lbl_state")}:</b>\n     ${STATUS_LABELS[status]?.[lang] ?? status}`);
  if (student.statusNote?.trim()) {
    lines.push(`     <i>${escapeHtml(student.statusNote.trim())}</i>`);
  }

  // Qarzdor fanlar
  lines.push(DIVIDER);
  if (debts.length === 0) {
    lines.push(`📕 <b>${tr.t("lbl_debts")}:</b>\n     ${tr.t("no_debts")}`);
  } else {
    const list = debts
      .map((d, i) => {
        const extra = [
          d.credit ? `${d.credit} kredit` : null,
          d.semester ? `${d.semester}-semestr` : null,
        ]
          .filter(Boolean)
          .join(", ");
        return `     ${i + 1}. ${escapeHtml(d.name)}${extra ? ` <i>(${escapeHtml(extra)})</i>` : ""}`;
      })
      .join("\n");
    lines.push(`📕 <b>${tr.t("lbl_debts")}</b> — ${debts.length} ta:\n${list}`);
  }

  // Kontrakt
  lines.push(DIVIDER);
  if (student.eduType === "GRANT") {
    lines.push(`💳 <b>${tr.t("lbl_contract")}:</b>\n     ${tr.t("grant_note")}`);
  } else if (contractDebt <= 0) {
    lines.push(`💳 <b>${tr.t("lbl_contract")}:</b>\n     ${tr.t("no_contract_debt")}`);
    if (student.contractTotal > 0) {
      lines.push(
        `     <i>${tr.t("lbl_contract_total")}: ${formatMoney(student.contractTotal)} · ` +
          `${tr.t("lbl_contract_paid")}: ${formatMoney(student.contractPaid)}</i>`,
      );
    }
  } else {
    lines.push(
      `💳 <b>${tr.t("lbl_contract")}:</b>\n     ` +
        tr.t("contract_debt_line", { amount: formatMoney(contractDebt) }),
    );
    lines.push(
      `     <i>${tr.t("lbl_contract_total")}: ${formatMoney(student.contractTotal)} · ` +
        `${tr.t("lbl_contract_paid")}: ${formatMoney(student.contractPaid)}</i>`,
    );
  }

  if (student.contractYear) {
    lines.push(`     <i>📅 ${escapeHtml(student.contractYear)}</i>`);
  }

  return lines.join("\n");
}

/** 2-menyu: FAQ javobi */
export function renderFaq(faq: Faq, tr: Translator): string {
  const q = localized(faq, "question", tr.lang);
  const a = localized(faq, "answer", tr.lang);
  return `❓ <b>${escapeHtml(q)}</b>\n${DIVIDER}\n\n${a}`;
}

/** 3-menyu: Chet el dasturi */
export function renderProgram(p: StudyAbroadProgram, tr: Translator): string {
  const lines: string[] = [];
  lines.push(`${p.flag} <b>${escapeHtml(localized(p, "title", tr.lang))}</b>`);
  lines.push(`<i>${escapeHtml(p.country)}</i>`);
  lines.push(DIVIDER);
  lines.push(localized(p, "description", tr.lang));

  if (p.universityName) {
    lines.push(`\n🏫 <b>${tr.t("lbl_university")}:</b> ${escapeHtml(p.universityName)}`);
  }
  const duration = localized(p, "duration", tr.lang);
  if (duration) lines.push(`⏳ <b>${tr.t("lbl_duration")}:</b> ${escapeHtml(duration)}`);

  const requirements = localized(p, "requirements", tr.lang);
  if (requirements) lines.push(`\n📋 <b>${tr.t("lbl_requirements")}:</b>\n${requirements}`);

  if (p.deadline) lines.push(`\n📅 <b>${tr.t("lbl_deadline")}:</b> ${escapeHtml(p.deadline)}`);
  if (p.contactInfo) lines.push(`📞 <b>${tr.t("lbl_contact")}:</b> ${escapeHtml(p.contactInfo)}`);

  return lines.join("\n");
}

/** 4-menyu: Mas'ul xodim kartasi */
export function renderStaff(staff: FacultyStaff, tr: Translator): string {
  const role = STAFF_ROLE_LABELS[staff.role as StaffRole]?.[tr.lang] ?? staff.role;
  const lines: string[] = [];
  lines.push(`${role}`);
  lines.push(DIVIDER);
  lines.push(`👤 <b>${escapeHtml(staff.fullName)}</b>`);

  const position = localized(staff, "position", tr.lang);
  if (position) lines.push(`💼 <b>${tr.t("lbl_position")}:</b> ${escapeHtml(position)}`);
  if (staff.groupNames) lines.push(`👥 <b>${tr.t("lbl_group")}:</b> ${escapeHtml(staff.groupNames)}`);
  if (staff.course) lines.push(`🎯 <b>${tr.t("lbl_course")}:</b> ${staff.course}`);

  lines.push("");
  if (staff.phone) lines.push(`📞 <b>${tr.t("lbl_phone")}:</b> ${escapeHtml(staff.phone)}`);
  if (staff.telegram) {
    const handle = staff.telegram.startsWith("@") ? staff.telegram : `@${staff.telegram}`;
    lines.push(`✈️ <b>Telegram:</b> ${escapeHtml(handle)}`);
  }
  if (staff.email) lines.push(`📧 <b>${tr.t("lbl_email")}:</b> ${escapeHtml(staff.email)}`);
  if (staff.room) lines.push(`🚪 <b>${tr.t("lbl_room")}:</b> ${escapeHtml(staff.room)}`);
  if (staff.workHours) lines.push(`🕘 <b>${tr.t("lbl_hours")}:</b> ${escapeHtml(staff.workHours)}`);

  return lines.join("\n");
}
