import type { Api } from "grammy";
import type { BotUser, Faculty, FacultyStaff, Student } from "@prisma/client";
import { prisma } from "@/lib/db";
import { loadDictionary } from "@/lib/i18n";
import { STAFF_ROLE_ADMIN_LABELS, type StaffRole } from "@/lib/constants";
import { escapeHtml } from "./views";

/** Topikli guruh ID'si (Sozlamalar → support_group_id) */
export async function getSupportGroupId(): Promise<string | null> {
  const { settings } = await loadDictionary();
  const value = (settings.support_group_id ?? "").trim();
  return value || null;
}

/**
 * Xodim uchun guruhda alohida mavzu (forum topic) ochadi.
 * Guruhda mavzular yoqilmagan bo'lsa — null qaytaradi, xabar umumiy oqimga tushadi.
 */
async function ensureStaffTopic(
  api: Api,
  groupId: string,
  staff: FacultyStaff & { faculty?: Faculty | null },
): Promise<number | null> {
  if (staff.topicId) return staff.topicId;

  const roleLabel = STAFF_ROLE_ADMIN_LABELS[staff.role as StaffRole] ?? staff.role;
  const name = `${roleLabel} — ${staff.fullName}`.slice(0, 128);

  try {
    const topic = await api.createForumTopic(groupId, name);
    await prisma.facultyStaff.update({
      where: { id: staff.id },
      data: { topicId: topic.message_thread_id },
    });
    return topic.message_thread_id;
  } catch {
    // Guruh forum emas yoki bot huquqi yetarli emas
    return null;
  }
}

function studentHeader(
  student: (Student & { faculty: Faculty | null }) | null,
  botUser: BotUser,
): string {
  const lines: string[] = [];
  if (student) {
    lines.push(`👤 <b>${escapeHtml(student.fullName)}</b>`);
    lines.push(
      `🏛 ${escapeHtml(student.faculty?.nameUz ?? student.facultyName ?? "—")} · ` +
        `${student.course}-kurs · ${escapeHtml(student.groupName)}`,
    );
    lines.push(`🆔 <code>${escapeHtml(student.passportSeries)}</code>`);
  } else {
    const name = [botUser.firstName, botUser.lastName].filter(Boolean).join(" ");
    lines.push(`👤 <b>${escapeHtml(name || "Noma'lum foydalanuvchi")}</b>`);
  }
  if (botUser.username) lines.push(`✈️ @${escapeHtml(botUser.username)}`);
  return lines.join("\n");
}

/**
 * Talabaning xabarini mas'ul xodimning mavzusiga yuboradi va bazaga yozadi.
 * Xodim guruhda shu xabarga <b>reply</b> qilsa — javob talabaga yetib boradi.
 */
export async function sendMessageToStaff(
  api: Api,
  options: {
    staff: FacultyStaff & { faculty?: Faculty | null };
    botUser: BotUser;
    student: (Student & { faculty: Faculty | null }) | null;
    text: string;
  },
): Promise<{ delivered: boolean }> {
  const { staff, botUser, student, text } = options;

  const record = await prisma.staffMessage.create({
    data: {
      staffId: staff.id,
      botUserId: botUser.id,
      studentId: student?.id ?? null,
      direction: "IN",
      text: text.slice(0, 4000),
    },
  });

  const groupId = await getSupportGroupId();
  if (!groupId) return { delivered: false };

  const threadId = await ensureStaffTopic(api, groupId, staff);

  const body =
    `📨 <b>Yangi murojaat</b>\n\n` +
    `${studentHeader(student, botUser)}\n\n` +
    `💬 <i>Xabar:</i>\n${escapeHtml(text)}\n\n` +
    `<i>↩️ Javob berish uchun shu xabarga reply qiling.</i>`;

  try {
    const sent = await api.sendMessage(groupId, body, {
      parse_mode: "HTML",
      ...(threadId ? { message_thread_id: threadId } : {}),
    });

    await prisma.staffMessage.update({
      where: { id: record.id },
      data: { groupMessageId: sent.message_id, groupThreadId: threadId ?? null },
    });
    return { delivered: true };
  } catch (error) {
    console.error("[staff-chat] guruhga yuborilmadi:", error);
    return { delivered: false };
  }
}

/** Admin paneldan yuborilgan javobni yozib qo'yish */
export async function recordOutgoing(options: {
  staffId: string | null;
  botUserId: string | null;
  studentId: string | null;
  text: string;
  replierName?: string;
}) {
  return prisma.staffMessage.create({
    data: {
      staffId: options.staffId,
      botUserId: options.botUserId,
      studentId: options.studentId,
      direction: "OUT",
      text: options.text.slice(0, 4000),
      replierName: options.replierName ?? null,
      isRead: true,
    },
  });
}
