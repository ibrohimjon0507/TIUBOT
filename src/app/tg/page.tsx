import { TelegramAuth } from "./auth";

export const metadata = { title: "Telegram orqali kirish" };

/**
 * Telegram Mini App kirish nuqtasi.
 * SDK komponent ichida yuklanadi — `next/script` ning `beforeInteractive` strategiyasi
 * faqat root layout'da ishlaydi, sahifada e'tiborsiz qoldiriladi.
 */
export default function TelegramEntryPage() {
  return <TelegramAuth />;
}
