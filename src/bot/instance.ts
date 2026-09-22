import type { Bot } from "grammy";
import { createBot, type TiuContext } from "./bot";

const globalForBot = globalThis as unknown as { tiuBot?: Bot<TiuContext> };

/** Bir process ichida bitta bot nusxasi (webhook route uchun). */
export function getBot(): Bot<TiuContext> {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN .env faylida belgilanmagan.");

  if (!globalForBot.tiuBot) {
    globalForBot.tiuBot = createBot(token);
  }
  return globalForBot.tiuBot;
}

export const BOT_COMMANDS = [
  { command: "start", description: "Botni ishga tushirish / Запустить / Start" },
  { command: "menu", description: "Asosiy menyu / Главное меню / Main menu" },
  { command: "lang", description: "Tilni o'zgartirish / Сменить язык / Change language" },
  { command: "help", description: "Yordam / Помощь / Help" },
];
