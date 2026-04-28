
import { useState, useEffect } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // faqat 9 ta raqam
  const [message, setMessage] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  // ⏱ timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // ✅ PHONE INPUT (TO‘G‘RI VARIANT)
  const handlePhone = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    // faqat 9 ta raqam (998siz)
    value = value.slice(0, 9);

    setPhone(value);
  };

  // ✅ FORMAT (FAKAT KO‘RINISH UCHUN)
  const formatPhone = (value) => {
    if (!value) return "";

    const part1 = value.slice(0, 2);
    const part2 = value.slice(2, 5);
    const part3 = value.slice(5, 7);
    const part4 = value.slice(7, 9);

    return `+998 ${part1} ${part2} ${part3} ${part4}`.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPhoneError("");
    setSuccess("");

    // 🚨 COOLDOWN CHECK
    if (cooldown > 0) {
      setPhoneError(`Iltimos ${cooldown} soniya kuting`);
      return;
    }

    // ✅ VALIDATION (9 TA RAQAM)
    if (!/^\d{9}$/.test(phone)) {
      setPhoneError("Telefon 9 ta raqam bo‘lishi kerak");
      return;
    }

    const TOKEN = import.meta.env.VITE_BOT_TOKEN;
    const CHAT_ID = import.meta.env.VITE_CHAT_ID;

    const time = new Date().toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const text = `
📩 Yangi Shikoyat

👤 Ism: ${name}
📞 Telefon: +998${phone}
💬 Shikoyat: ${message}

🕒 ${time}
`;

    try {
      setLoading(true);

      const res = await fetch(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text,
          }),
        },
      );

      const data = await res.json();
      if (!data.ok) throw new Error(data.description);

      setSuccess("Yuborildi ✅");

      // 🔥 COOLDOWN START
      setCooldown(120);

      setName("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setSuccess("Xatolik ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white p-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mt-20 mb-10">
        <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-bold mb-3">Biz haqimizda</h2>
          <p className="text-gray-400">
            Biz mijozlar fikrini qadrlaymiz. Har qanday shikoyat tezkor ko‘rib
            chiqiladi.
          </p>
        </div>

        <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-800 ">
          <h2 className="text-2xl font-bold mb-3">Bizni shu yerlarda toping</h2>
          <p className="text-gray-400">📍:</p>
          <p className="text-gray-400">📞:</p>
          <p className="text-gray-400">📷 Instagram:</p>
          <p className="text-gray-400">✈️ Telegram:</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-gray-900/70 border border-gray-800">
        <h1 className="text-xl font-bold mb-4">Shikoyat yuborish</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Ism"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
          />

          <input
            type="tel"
            placeholder="+998 00 000 00 00"
            value={formatPhone(phone)}
            onChange={handlePhone}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
          />

          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}

          <textarea
            placeholder="Shikoyat"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 h-32 rounded-xl bg-gray-800 border border-gray-700"
          />

          <button
            disabled={loading || cooldown > 0}
            className="w-full p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl"
          >
            {loading
              ? "Yuborilmoqda..."
              : cooldown > 0
                ? `Kuting ${cooldown}s`
                : "Jo'natish"}
          </button>

          {success && <p className="text-green-400 text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
}
