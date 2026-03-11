export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { name = "", phone = "", message = "" } = req.body || {};

        if (!phone) {
            return res.status(400).json({ error: "Телефон обязателен" });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            return res.status(500).json({ error: "Telegram credentials are not configured" });
        }

        const text = [
            "🛠 Новая заявка с сайта Дверной Доктор",
            "",
            `👤 Имя: ${name || "Не указано"}`,
            `📞 Телефон: ${phone}`,
            `📝 Проблема: ${message || "Не указана"}`
        ].join("\n");

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text
                })
            }
        );

        const telegramResult = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramResult.ok) {
            console.error("Telegram error:", telegramResult);
            return res.status(500).json({ error: "Failed to send Telegram message" });
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}