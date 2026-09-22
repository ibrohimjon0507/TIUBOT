import Script from "next/script";
import { TelegramAuth } from "./auth";

export const metadata = { title: "Telegram orqali kirish" };

export default function TelegramEntryPage() {
  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <TelegramAuth />
    </>
  );
}
