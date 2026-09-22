/**
 * Lokal ishga tushirish: `npm run bot`
 * Telegram'dan long-polling orqali yangilanishlarni oladi.
 */
import "dotenv/config";
import { GrammyError } from "grammy";
import { createBot } from "./bot";
import { BOT_COMMANDS } from "./instance";

async function main() {
  const token = process.env.BOT_TOKEN;
  if (!token || token.includes("your-bot-token")) {
    console.error("\n❌ BOT_TOKEN .env faylida belgilanmagan.");
    console.error("   @BotFather dan token oling va .env ga yozing:\n");
    console.error('   BOT_TOKEN="123456:AA..."\n');
    process.exit(1);
  }

  const bot = createBot(token);

  // Webhook qolgan bo'lsa — o'chiramiz (polling bilan birga ishlamaydi)
  await bot.api.deleteWebhook({ drop_pending_updates: false }).catch(() => {});
  await bot.api.setMyCommands(BOT_COMMANDS).catch(() => {});

  const me = await bot.api.getMe();
  console.log(`\n🤖 Bot ishga tushdi: @${me.username}`);
  console.log("   To'xtatish uchun: Ctrl+C\n");

  let stopping = false;
  const stop = () => {
    stopping = true;
    return bot.stop();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  // Admin paneldan webhook o'rnatilsa polling 409 bilan uziladi —
  // webhook'ni olib tashlab, qayta ulanamiz (lokal ishlab chiqish rejimi).
  for (let attempt = 1; attempt <= 5 && !stopping; attempt += 1) {
    try {
      await bot.start({
        allowed_updates: ["message", "callback_query"],
        onStart: () => console.log("✅ Polling faol..."),
      });
      return;
    } catch (error) {
      const conflict =
        error instanceof GrammyError &&
        error.error_code === 409 &&
        /setWebhook/i.test(error.description);

      if (!conflict || stopping) throw error;

      console.warn(
        `\n⚠️  Webhook o'rnatilgani sababli polling uzildi (${attempt}/5).\n` +
          "   Webhook o'chirilib, qayta ulanmoqda…\n",
      );
      await bot.api.deleteWebhook({ drop_pending_updates: false }).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

main().catch((error) => {
  console.error("❌ Botni ishga tushirishda xato:", error);
  process.exit(1);
});
