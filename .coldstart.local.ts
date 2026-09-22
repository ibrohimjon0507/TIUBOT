import "dotenv/config";
const secret = process.env.TELEGRAM_WEBHOOK_SECRET!;
const wait = 7 * 60 * 1000;

const update = {
  update_id: 777001,
  message: {
    message_id: 1,
    date: Math.floor(Date.now() / 1000),
    chat: { id: 888000111, type: "private" },
    from: { id: 888000111, is_bot: false, first_name: "ColdTest" },
    text: "/start",
    entities: [{ type: "bot_command", offset: 0, length: 6 }],
  },
};

(async () => {
  console.log(`⏳ Neon uxlashi uchun ${wait / 60000} daqiqa kutilmoqda...`);
  await new Promise((r) => setTimeout(r, wait));

  const t0 = Date.now();
  const res = await fetch("https://tiubot.vercel.app/api/telegram", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": secret },
    body: JSON.stringify(update),
  });
  const ms = Date.now() - t0;
  console.log(`❄️  Cold start so'rovi: ${res.status} — ${ms}ms`);

  const { prisma } = await import("./src/lib/db");
  const u = await prisma.botUser.findUnique({ where: { telegramId: "888000111" } });
  console.log(u ? `✅ Bazaga yozildi (step=${u.step}) — cold start yengib o'tildi` : "❌ Yozilmadi");
  if (u) {
    await prisma.activityLog.deleteMany({ where: { botUserId: u.id } });
    await prisma.botUser.delete({ where: { id: u.id } });
    console.log("🧹 tozalandi");
  }
  await prisma.$disconnect();
})();
