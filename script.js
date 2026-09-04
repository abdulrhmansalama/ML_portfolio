/* =========================================================
   Abdulrhman Salama — Portfolio
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initActiveLink();
    initReveal();
    initHeroNetwork();
    initContactForm();
    initFooterYear();
});

/* ---------- Mobile nav toggle ---------- */
function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => links.classList.remove("open"))
    );
}

/* ---------- Highlight current page in nav ---------- */
function initActiveLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((a) => {
        const href = a.getAttribute("href");
        if (href === path || (path === "" && href === "index.html")) {
            a.classList.add("active");
        }
    });
}

/* ---------- Scroll reveal (single restrained pattern) ---------- */
function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
}

/* ---------- Hero background: drifting node network ----------
   Subtle, low-opacity, AI/graph motif. Skips animation loop
   entirely when the user prefers reduced motion. */
function initHeroNetwork() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let width, height, nodes;
    const NODE_COUNT_DIVISOR = 14000; // more space per node = sparser field
    const LINK_DIST = 130;
    const accent = "47, 217, 196";

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        const count = Math.max(18, Math.min(60, Math.floor((width * height) / NODE_COUNT_DIVISOR)));
        nodes = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.6 + 0.8,
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
        }

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.strokeStyle = `rgba(${accent}, ${0.18 * (1 - dist / LINK_DIST)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        for (const n of nodes) {
            ctx.fillStyle = `rgba(${accent}, 0.65)`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!prefersReduced) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReduced) {
        step(); // draw a single static frame, no loop
    } else {
        requestAnimationFrame(step);
    }
}

/* ---------- Contact form: hands off to the user's mail client ---------- */
function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();

        const subject = encodeURIComponent(`Portfolio contact — ${name || "New message"}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:abdulrhman.m.salama@gmail.com?subject=${subject}&body=${body}`;
    });
}

/* ---------- Footer year ---------- */
function initFooterYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
}