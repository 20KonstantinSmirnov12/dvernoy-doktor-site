document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".mini-form form");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nameInput = form.querySelector('input[type="text"]');
        const phoneInput = form.querySelector('input[type="tel"]');
        const messageInput = form.querySelector("textarea");
        const submitButton = form.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : "";
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!phone) {
            alert("Пожалуйста, укажите телефон.");
            return;
        }

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Отправляем...";
            }

            const response = await fetch("/api/send-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    phone,
                    message
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Ошибка отправки формы");
            }

            alert("Спасибо! Заявка отправлена. Мы скоро свяжемся с вами.");
            form.reset();
        } catch (error) {
            console.error("Ошибка отправки формы:", error);
            alert("Не удалось отправить заявку. Попробуйте ещё раз.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Отправить заявку";
            }
        }
    });
});