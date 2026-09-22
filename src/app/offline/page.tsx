export const metadata = { title: "Internet aloqasi yo'q" };

/** Tarmoq yo'q bo'lganda Service Worker shu sahifani ko'rsatadi */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-6 text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-2xl font-bold text-navy-950">
          T
        </span>
        <h1 className="text-[18px] font-semibold text-white">Internet aloqasi yo'q</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-navy-200">
          Sayt qurilmangizga yuklab olingan, lekin ma'lumotlarni ko'rsatish uchun internet
          kerak. Aloqa tiklangach sahifa o'zi ishlaydi.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-gold-400 px-5 py-2.5 text-[14px] font-medium text-navy-950"
        >
          Qayta urinish
        </a>
      </div>
    </main>
  );
}
