document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".mini-form form");
    const revealItems = document.querySelectorAll(".reveal");
    const toastStack = document.getElementById("toastStack");
    const pageLoader = document.getElementById("pageLoader");
    const parallaxItems = document.querySelectorAll("[data-parallax]");

    function showToast(type, title, text) {
        if (!toastStack) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-text">${text}</div>
    `;

        toastStack.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("toast-hide");
            setTimeout(() => {
                toast.remove();
            }, 280);
        }, 3200);
    }

    if (pageLoader) {
        window.addEventListener("load", () => {
            setTimeout(() => {
                pageLoader.classList.add("is-hidden");
            }, 450);
        });
    }

    if (revealItems.length) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.14,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealItems.forEach((item) => observer.observe(item));
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion && parallaxItems.length) {
        let ticking = false;

        const updateParallax = () => {
            const viewportCenter = window.innerHeight / 2;

            parallaxItems.forEach((item) => {
                const strength = Number(item.dataset.parallax || 8);
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const offset = (itemCenter - viewportCenter) / window.innerHeight;

                const translateY = offset * strength * -1;
                item.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
            });

            ticking = false;
        };

        const requestParallax = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        updateParallax();
        window.addEventListener("scroll", requestParallax, { passive: true });
        window.addEventListener("resize", requestParallax);
    }

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
            showToast(
                "error",
                "Нужен телефон",
                "Укажи номер телефона, чтобы можно было связаться по заявке."
            );
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

            let result = {};
            try {
                result = await response.json();
            } catch (jsonError) {
                result = {};
            }

            if (!response.ok) {
                throw new Error(result.error || "Ошибка отправки формы");
            }

            showToast(
                "success",
                "Заявка отправлена",
                "Спасибо! Мы скоро свяжемся с вами."
            );

            form.reset();
        } catch (error) {
            console.error("Ошибка отправки формы:", error);

            showToast(
                "error",
                "Не удалось отправить",
                "Попробуйте ещё раз через минуту или напишите в мессенджер."
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Отправить заявку";
            }
        }
    });
});
