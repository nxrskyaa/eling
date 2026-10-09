/* Eling landing — i18n trilingual, demo chat animasi, reveal on scroll. */

const STR = {
  id: {
    nav_demo: "Demo", nav_how: "Cara kerja", nav_cta: "Chat di Telegram",
    hero_eyebrow: "Walrus Session 8 · Chatbots That Remember",
    hero_h1: "Bot yang <mark>tidak pernah lupa</mark>.",
    hero_sub: "Eling adalah teman AI di Telegram yang mengingat segalanya tentangmu — lintas sesi, lintas device. Otaknya Gemini, ingatannya Walrus Memory.",
    hero_cta1: "Chat di Telegram", hero_cta2: "Lihat demo",
    hero_note: "Gratis · Langsung jalan · 3 bahasa 🇮🇩🇬🇧🇨🇳",
    chip1: "alergi kacang", chip2: "deadline 9 Okt", chip3: "suka kopi tubruk",
    demo_title: "Coba bedakan.", demo_sub: "Percakapan yang sama, dua hasil berbeda.",
    demo_without: "Tanpa ingatan", demo_with: "Dengan Eling",
    demo_online: "online · ingat segalanya",
    demo_day1: "Hari 1", demo_day2: "7 hari kemudian",
    steps_title: "Cara merakit ingatan", steps_sub: "Empat langkah, kayak buku instruksi.",
    wall_title: "Dinding ingatan",
    wall_sub: "Setiap fakta jadi satu brick. Makin sering cerita, makin tinggi temboknya.",
    wall_cta: "Mulai bangun dindingmu",
    hack_title: "Dibuat untuk hackathon",
    hack_event: "Acara", hack_prize: "Total hadiah", hack_stack: "Teknologi", hack_lang: "Bahasa",
    footer_tag: "bot yang tidak pernah lupa.",
  },
  en: {
    nav_demo: "Demo", nav_how: "How it works", nav_cta: "Chat on Telegram",
    hero_eyebrow: "Walrus Session 8 · Chatbots That Remember",
    hero_h1: "The bot that <mark>never forgets</mark>.",
    hero_sub: "Eling is an AI friend on Telegram that remembers everything about you — across sessions, across devices. Brain: Gemini, memory: Walrus Memory.",
    hero_cta1: "Chat on Telegram", hero_cta2: "See the demo",
    hero_note: "Free · Works instantly · 3 languages 🇮🇩🇬🇧🇨🇳",
    chip1: "allergic to peanuts", chip2: "deadline Oct 9", chip3: "loves tubruk coffee",
    demo_title: "Spot the difference.", demo_sub: "The same conversation, two different outcomes.",
    demo_without: "Without memory", demo_with: "With Eling",
    demo_online: "online · remembers everything",
    demo_day1: "Day 1", demo_day2: "7 days later",
    steps_title: "How memory gets built", steps_sub: "Four steps, like an instruction booklet.",
    wall_title: "The memory wall",
    wall_sub: "Every fact becomes one brick. The more you share, the taller the wall.",
    wall_cta: "Start building your wall",
    hack_title: "Built for a hackathon",
    hack_event: "Event", hack_prize: "Prize pool", hack_stack: "Stack", hack_lang: "Languages",
    footer_tag: "the bot that never forgets.",
  },
  zh: {
    nav_demo: "演示", nav_how: "工作原理", nav_cta: "在 Telegram 上聊天",
    hero_eyebrow: "Walrus Session 8 · Chatbots That Remember",
    hero_h1: "<mark>永远不会忘记</mark>的机器人。",
    hero_sub: "Eling 是 Telegram 上的 AI 朋友，记得关于你的一切——跨会话、跨设备。大脑是 Gemini，记忆是 Walrus Memory。",
    hero_cta1: "在 Telegram 上聊天", hero_cta2: "查看演示",
    hero_note: "免费 · 即开即用 · 3 种语言 🇮🇩🇬🇧🇨🇳",
    chip1: "对花生过敏", chip2: "截止 10 月 9 日", chip3: "喜欢 tubruk 咖啡",
    demo_title: "看出区别。", demo_sub: "同样的对话，两种不同的结果。",
    demo_without: "没有记忆", demo_with: "有 Eling",
    demo_online: "在线 · 记得一切",
    demo_day1: "第 1 天", demo_day2: "7 天后",
    steps_title: "记忆是如何构建的", steps_sub: "四个步骤，像说明书一样。",
    wall_title: "记忆墙",
    wall_sub: "每个事实都变成一块积木。分享得越多，墙就越高。",
    wall_cta: "开始建造你的墙",
    hack_title: "为黑客松而建",
    hack_event: "活动", hack_prize: "总奖金", hack_stack: "技术栈", hack_lang: "语言",
    footer_tag: "永远不会忘记的机器人。",
  },
};

const STEPS = {
  id: [
    { t: "💬 Kamu chat", d: "Ngobrol biasa di Telegram, kayak ke teman." },
    { t: "🔍 Eling mengingat", d: "Sebelum menjawab, dia mencari ingatanmu di Walrus Memory." },
    { t: "🧠 Gemini menjawab", d: "Jawaban disusun dengan ingatanmu sebagai konteks." },
    { t: "💾 Fakta baru disimpan", d: "Hal penting otomatis dicatat, terenkripsi di Walrus." },
  ],
  en: [
    { t: "💬 You chat", d: "Just chat on Telegram, like with a friend." },
    { t: "🔍 Eling recalls", d: "Before replying, it searches your memories in Walrus Memory." },
    { t: "🧠 Gemini replies", d: "The reply is composed using your memories as context." },
    { t: "💾 New facts saved", d: "Important things are auto-saved, encrypted on Walrus." },
  ],
  zh: [
    { t: "💬 你聊天", d: "在 Telegram 上像和朋友一样聊天。" },
    { t: "🔍 Eling 回忆", d: "在回答之前，它先在 Walrus Memory 中搜索你的记忆。" },
    { t: "🧠 Gemini 回答", d: "回答会结合你的记忆作为上下文。" },
    { t: "💾 保存新的事实", d: "重要的事情会自动保存，在 Walrus 上加密存储。" },
  ],
};

const WALL = {
  id: ["☕ suka kopi tubruk", "🥜 alergi kacang", "📅 deadline 9 Okt", "😎 nama: NXR", "⛰️ suka mendaki", "🐱 kucing: Momo", "🎮 suka game balap", "📚 lagi belajar Mandarin"],
  en: ["☕ loves tubruk coffee", "🥜 allergic to peanuts", "📅 deadline Oct 9", "😎 name: NXR", "⛰️ loves hiking", "🐱 cat: Momo", "🎮 loves racing games", "📚 learning Mandarin"],
  zh: ["☕ 喜欢 tubruk 咖啡", "🥜 对花生过敏", "📅 截止 10 月 9 日", "😎 名字：NXR", "⛰️ 喜欢登山", "🐱 猫：Momo", "🎮 喜欢赛车游戏", "📚 正在学中文"],
};

const DEMO = {
  id: {
    without: [
      { day: "demo_day1" },
      { from: "user", text: "Eling, inget ya: aku alergi kacang." },
      { from: "bot", text: "Oke, noted! 📝" },
      { day: "demo_day2" },
      { from: "user", text: "Makanan apa yang aman buatku?" },
      { from: "bot", text: "Hmm, aku nggak tahu kamu alergi apa. Ceritain dong! 😅" },
    ],
    with: [
      { day: "demo_day1" },
      { from: "user", text: "Eling, inget ya: aku alergi kacang." },
      { from: "bot", text: "Noted! Aku ingat baik-baik 🧠" },
      { chip: "🥜 alergi kacang" },
      { day: "demo_day2" },
      { from: "user", text: "Makanan apa yang aman buatku?" },
      { from: "bot", text: "Jangan kacang! Kamu alergi kacang — masih kuingat dari minggu lalu 😉" },
      { chip: "🥜 alergi kacang · diingat 7 hari lalu" },
    ],
  },
  en: {
    without: [
      { day: "demo_day1" },
      { from: "user", text: "Eling, remember: I'm allergic to peanuts." },
      { from: "bot", text: "Okay, noted! 📝" },
      { day: "demo_day2" },
      { from: "user", text: "What food is safe for me?" },
      { from: "bot", text: "Hmm, I don't know what you're allergic to. Tell me! 😅" },
    ],
    with: [
      { day: "demo_day1" },
      { from: "user", text: "Eling, remember: I'm allergic to peanuts." },
      { from: "bot", text: "Noted! I'll remember it well 🧠" },
      { chip: "🥜 allergic to peanuts" },
      { day: "demo_day2" },
      { from: "user", text: "What food is safe for me?" },
      { from: "bot", text: "No peanuts! You're allergic — I still remember from last week 😉" },
      { chip: "🥜 allergic to peanuts · remembered 7 days ago" },
    ],
  },
  zh: {
    without: [
      { day: "demo_day1" },
      { from: "user", text: "Eling，记住：我对花生过敏。" },
      { from: "bot", text: "好的，记下了！📝" },
      { day: "demo_day2" },
      { from: "user", text: "什么食物对我是安全的？" },
      { from: "bot", text: "嗯，我不知道你对什么过敏。告诉我吧！😅" },
    ],
    with: [
      { day: "demo_day1" },
      { from: "user", text: "Eling，记住：我对花生过敏。" },
      { from: "bot", text: "记下了！我会好好记住 🧠" },
      { chip: "🥜 对花生过敏" },
      { day: "demo_day2" },
      { from: "user", text: "什么食物对我是安全的？" },
      { from: "bot", text: "别吃花生！你对花生过敏——我还记得上周你说的 😉" },
      { chip: "🥜 对花生过敏 · 7 天前记住的" },
    ],
  },
};

let lang = localStorage.getItem("eling-lang") || "id";
if (!STR[lang]) lang = "id";
let demoMode = "with";
let demoToken = 0;
let wallRevealed = false;

const t = (key) => (STR[lang] && STR[lang][key]) || STR.id[key] || key;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function renderSteps() {
  const ol = document.getElementById("steps-list");
  ol.innerHTML = "";
  STEPS[lang].forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "reveal in";
    li.innerHTML = `<span class="step-num">${i + 1}</span><h3></h3><p></p>`;
    li.querySelector("h3").textContent = s.t;
    li.querySelector("p").textContent = s.d;
    ol.appendChild(li);
  });
}

function renderWall() {
  const wall = document.getElementById("brick-wall");
  wall.innerHTML = "";
  WALL[lang].forEach((b) => {
    const d = document.createElement("div");
    d.className = "mem-brick" + (wallRevealed ? " in" : "");
    d.textContent = b;
    wall.appendChild(d);
  });
}

function applyLang(l) {
  lang = STR[l] ? l : "id";
  localStorage.setItem("eling-lang", lang);
  document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll(".lang-pill").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  renderSteps();
  renderWall();
  playDemo(demoMode);
}

function addMsg(box, cls, text) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.textContent = text;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}
function addChip(box, text) {
  const d = document.createElement("div");
  d.className = "mem-chip";
  d.textContent = text;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}
function addDay(box, key) {
  const d = document.createElement("div");
  d.className = "chat-day";
  d.textContent = t(key);
  box.appendChild(d);
}

async function playDemo(mode) {
  demoMode = mode;
  const my = ++demoToken;
  const box = document.getElementById("chat-messages");
  box.innerHTML = "";
  document.querySelectorAll(".toggle-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  await wait(350);
  for (const item of DEMO[lang][mode]) {
    if (my !== demoToken) return; // dibatalkan: mode/bahasa diganti
    if (item.day) { addDay(box, item.day); await wait(500); continue; }
    if (item.chip) { await wait(350); addChip(box, item.chip); await wait(450); continue; }
    if (item.from === "bot") {
      const tp = addMsg(box, "bot typing", "•••");
      await wait(800);
      if (my !== demoToken) return;
      tp.remove();
    } else {
      await wait(450);
    }
    addMsg(box, item.from, item.text);
    await wait(650);
  }
}

/* reveal on scroll */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
    if (e.target.id === "brick-wall" || e.target.classList.contains("brick-wall")) {
      wallRevealed = true;
      document.querySelectorAll(".mem-brick").forEach((b, i) => {
        setTimeout(() => b.classList.add("in"), i * 110);
      });
    }
  });
}, { threshold: 0.15 });

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-pill").forEach((b) =>
    b.addEventListener("click", () => applyLang(b.dataset.lang))
  );
  document.querySelectorAll(".toggle-btn").forEach((b) =>
    b.addEventListener("click", () => playDemo(b.dataset.mode))
  );
  applyLang(lang);
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  io.observe(document.getElementById("brick-wall"));
  // auto-play demo saat terlihat pertama kali
  const chatCard = document.querySelector(".chat-card");
  const dio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { playDemo(demoMode); dio.disconnect(); } });
  }, { threshold: 0.3 });
  dio.observe(chatCard);
});
