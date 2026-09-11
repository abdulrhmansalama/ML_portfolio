document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initActiveLink();
  initReveal();
  initHeroNetwork();
  initContactForm();
  initCertificateModal();
  initImageLightbox();
  initFooterYear();
});

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
}

function initActiveLink() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.12, rootMargin:"0px 0px -35px 0px"});
  items.forEach(el => observer.observe(el));
}

function initHeroNetwork() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width=0, height=0, nodes=[], pulses=[];
  const accent = "47,217,196";
  const resize = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = r.width; height = r.height;
    canvas.width = width*dpr; canvas.height = height*dpr;
    canvas.style.width = width+"px"; canvas.style.height = height+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.max(28, Math.min(82, Math.floor(width*height/10500)));
    nodes = Array.from({length:count}, () => ({
      x:Math.random()*width, y:Math.random()*height,
      vx:(Math.random()-.5)*.34, vy:(Math.random()-.5)*.34,
      r:Math.random()*1.7+.8
    }));
    pulses = Array.from({length:7}, () => ({i:Math.floor(Math.random()*count), life:Math.random()}));
  };
  let t=0;
  function step() {
    t += .01;
    ctx.clearRect(0,0,width,height);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x<0 || n.x>width) n.vx *= -1;
      if (n.y<0 || n.y>height) n.vy *= -1;
    }
    for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
      const a=nodes[i], b=nodes[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
      if (dist<145) {
        ctx.strokeStyle=`rgba(${accent},${.20*(1-dist/145)})`;
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
    for (const n of nodes) {
      ctx.fillStyle=`rgba(${accent},.62)`;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    }
    for (const p of pulses) {
      const n=nodes[p.i]; if (!n) continue;
      p.life += .012;
      if (p.life>1) { p.life=0; p.i=Math.floor(Math.random()*nodes.length); }
      const radius=8+p.life*28;
      ctx.strokeStyle=`rgba(${accent},${.24*(1-p.life)})`;
      ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(n.x,n.y,radius,0,Math.PI*2); ctx.stroke();
    }
    if (!reduced) requestAnimationFrame(step);
  }
  resize();
  window.addEventListener("resize", resize);
  step();
}

function initCertificateModal() {
  const modal = document.getElementById("cert-modal");
  if (!modal) return;
  const title = modal.querySelector("[data-modal-title]");
  const issuer = modal.querySelector("[data-modal-issuer]");
  const image = modal.querySelector("[data-modal-image]");
  const desc = modal.querySelector("[data-modal-desc]");
  const learn = modal.querySelector("[data-modal-learn]");
  const tags = modal.querySelector("[data-modal-tags]");
  const achievement = modal.querySelector("[data-achievement]");
  const achievementImage = modal.querySelector("[data-achievement-image]");
  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  };
  document.querySelectorAll(".cert-card").forEach(card => {
    card.addEventListener("click", () => {
      title.textContent = card.dataset.title;
      issuer.textContent = card.dataset.issuer;
      image.src = card.dataset.image;
      image.alt = card.dataset.title + " certificate";
      desc.textContent = card.dataset.desc;
      learn.innerHTML = (card.dataset.learn || "").split("|").filter(Boolean).map(x => `<li>${x}</li>`).join("");
      tags.innerHTML = (card.dataset.skills || "").split("|").filter(Boolean).map(x => `<span class="tag">${x}</span>`).join("");
      if (card.dataset.achievement) {
        achievement.hidden = false;
        achievementImage.src = card.dataset.achievement;
        achievementImage.alt = card.dataset.achievementAlt || "Achievement photo";
      } else {
        achievement.hidden = true;
        achievementImage.removeAttribute("src");
      }
      modal.classList.add("open");
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
    });
  });
  modal.querySelector(".modal-close").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });
}

function initImageLightbox() {
  const box = document.getElementById("image-lightbox");
  if (!box) return;
  const img = box.querySelector("img");
  const close = () => { box.classList.remove("open"); box.setAttribute("aria-hidden","true"); document.body.style.overflow=""; };
  document.querySelectorAll("[data-lightbox]").forEach(el => el.addEventListener("click", () => {
    img.src = el.src; img.alt = el.alt || "Project image";
    box.classList.add("open"); box.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
  }));
  box.addEventListener("click", close);
  document.addEventListener("keydown", e => { if(e.key==="Escape" && box.classList.contains("open")) close(); });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name=form.name.value.trim(), email=form.email.value.trim(), message=form.message.value.trim();
    const subject=encodeURIComponent(`Portfolio contact — ${name || "New message"}`);
    const body=encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href=`mailto:abdulrhman.m.salama@gmail.com?subject=${subject}&body=${body}`;
  });
}

function initFooterYear() {
  const el=document.getElementById("year");
  if(el) el.textContent=new Date().getFullYear();
}
