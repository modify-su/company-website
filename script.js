/* ===========================
   script.js — NexGen Solutions
   =========================== */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
  checkBackToTop();
});

// ===== ACTIVE NAV LINK =====
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
}

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  const spans = hamburger.querySelectorAll('span');
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

// ===== PARTICLE CANVAS =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '#7c3aed' : '#3b82f6';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 80; i++) particles.push(new Particle());
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 120) * 0.12;
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  animFrame = requestAnimationFrame(animate);
}
initParticles();
animate();

// ===== COUNTER ANIMATION =====
let counted = false;
function animateCounters() {
  if (counted) return;
  const heroSection = document.getElementById('home');
  if (!heroSection) return;
  const rect = heroSection.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < window.innerHeight) {
    counted = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target) || 0;
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, 16);
    });
  }
}
window.addEventListener('scroll', animateCounters);
animateCounters();

// ===== AOS (ANIMATE ON SCROLL) =====
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('animate'), delay);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}
initAOS();

// ===== TESTIMONIALS SLIDER =====
const track = document.getElementById('testimTrack');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;
let autoSlide;

if (track && dotsContainer) {
  const cards = track.querySelectorAll('.testimonial-card');
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `สไลด์ ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
}

function goTo(n) {
  if (!track) return;
  const cardsCount = track.querySelectorAll('.testimonial-card').length;
  if (!cardsCount) return;
  currentSlide = (n + cardsCount) % cardsCount;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  if (dotsContainer) {
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => { goTo(currentSlide - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(currentSlide + 1); resetAuto(); });
}

function startAuto() { autoSlide = setInterval(() => goTo(currentSlide + 1), 5000); }
function resetAuto() { clearInterval(autoSlide); startAuto(); }
startAuto();

// ===== PORTFOLIO FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    portfolioItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.style.opacity = show ? '1' : '0';
      item.style.transform = show ? 'scale(1)' : 'scale(0.9)';
      item.style.pointerEvents = show ? 'all' : 'none';
      item.style.transition = 'all 0.4s ease';
    });
  });
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>กำลังส่ง...</span>';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
    contactForm.reset();
    formSuccess.classList.add('show');
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  }, 1500);
});

// ===== NEWSLETTER FORM =====
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('newsletterEmail');
  const btn = newsletterForm.querySelector('button');
  btn.textContent = '✓';
  btn.style.background = '#10b981';
  setTimeout(() => {
    btn.textContent = '→';
    btn.style.background = '';
    input.value = '';
  }, 2000);
});

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
function checkBackToTop() {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SMOOTH HOVER CARD TILT =====
document.querySelectorAll('.service-card, .team-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transformStyle = '';
  });
});

// ===== CURSOR GLOW EFFECT =====
const cursorGlow = document.createElement('div');
cursorGlow.style.cssText = `
  position: fixed; pointer-events: none; z-index: 9999;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: left 0.15s ease, top 0.15s ease;
`;
document.body.appendChild(cursorGlow);
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

console.log('%c🚀 NexGen Solutions', 'color: #7c3aed; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with ❤️ by NexGen Dev Team', 'color: #3b82f6; font-size: 12px;');

/* ============================================================
   ADMIN DATA SYNC — Reads from localStorage (set by admin panel)
   ============================================================ */
const SITE_KEY = 'nxg_site_data';

function getSiteData() {
  try {
    const s = localStorage.getItem(SITE_KEY);
    if(s) return JSON.parse(s);
    return window.CONFIG_DATA || null;
  } catch(e) { return window.CONFIG_DATA || null; }
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function grad(s,e) { return `linear-gradient(135deg,${s} 0%,${e} 100%)`; }

// --- Apply Logo ---
function applyLogo(logo) {
  if(!logo) return;
  document.querySelectorAll('.nav-logo').forEach(el => {
    if(logo.image) {
      el.innerHTML = `<img src="${logo.image}" style="height:36px;max-width:140px;object-fit:contain;"><span class="logo-text" style="margin-left:10px">${esc(logo.text)}<span class="logo-accent">${esc(logo.accent)}</span></span>`;
    } else {
      const firstChar = (logo.text||'N')[0];
      el.querySelector('.logo-text') && (el.querySelector('.logo-text').innerHTML = `${esc(logo.text)}<span class="logo-accent">${esc(logo.accent)}</span>`);
    }
  });
  document.title = `${logo.text}${logo.accent} | บริษัทเทคโนโลยีชั้นนำ`;
}

// --- Apply Hero ---
function applyHero(hero) {
  if(!hero) return;
  const badge = document.querySelector('.hero-badge span:last-child');
  if(badge) badge.textContent = hero.badge||'';
  const title = document.querySelector('.hero-title');
  if(title) title.innerHTML = `${esc(hero.title1||'')}<br/><span class="gradient-text">${esc(hero.title2||'')}</span><br/>${esc(hero.title3||'')}`;
  const sub = document.querySelector('.hero-subtitle');
  if(sub) sub.innerHTML = (hero.subtitle||'').replace(/\n/g,'<br/>');
  const btns = document.querySelectorAll('.hero-actions .btn');
  if(btns[0] && hero.cta1) btns[0].querySelector('span') && (btns[0].querySelector('span').textContent = hero.cta1);
  if(btns[1] && hero.cta2) btns[1].querySelector('span') && (btns[1].querySelector('span').textContent = hero.cta2);
  // Stats
  if(hero.stats && hero.stats.length) {
    const statsEl = document.querySelector('.hero-stats');
    if(statsEl) {
      statsEl.innerHTML = hero.stats.map((s,i) => `
        ${i>0?'<div class="stat-divider"></div>':''}
        <div class="stat">
          <span class="stat-num" data-target="${s.num}">0</span><span class="stat-unit">${esc(s.unit)}</span>
          <span class="stat-label">${esc(s.label)}</span>
        </div>`).join('');
      // Re-run counter
      counted = false;
      animateCounters();
    }
  }
}

// --- Apply About ---
function applyAbout(about) {
  if(!about) return;
  const section = document.getElementById('about');
  const container = document.querySelector('#about .container');
  const grid = document.querySelector('.about-grid');
  const content = document.querySelector('.about-content');

  if(section) {
    // 1. Text Alignment
    const align = about.textAlign || 'left';
    section.style.textAlign = align;
    if(content) content.style.textAlign = align;

    // 2. Layout Direction & Column Ratio
    if(grid) {
      if(about.layout === 'vertical') {
        grid.style.gridTemplateColumns = '1fr';
        grid.style.gap = '40px';
      } else {
        grid.style.gap = '48px';
        if(about.colRatio === 'wide') {
          grid.style.gridTemplateColumns = '1fr 1.6fr';
        } else if(about.colRatio === 'extra-wide') {
          grid.style.gridTemplateColumns = '1fr 2.2fr';
        } else if(about.colRatio === 'equal') {
          grid.style.gridTemplateColumns = '1fr 1fr';
        } else {
          grid.style.gridTemplateColumns = '1.5fr 1fr'; // 60% ภาพ / 40% ข้อความ
        }
      }
    }

    // 3. Container Width (Standard / Wide / Full Width)
    if(container) {
      if(about.containerWidth === 'wide') {
        container.style.maxWidth = '1400px';
        container.style.width = '95%';
      } else if(about.containerWidth === 'full') {
        container.style.maxWidth = '100%';
        container.style.width = '100%';
        container.style.paddingLeft = '40px';
        container.style.paddingRight = '40px';
      } else {
        container.style.maxWidth = '';
        container.style.width = '';
        container.style.paddingLeft = '';
        container.style.paddingRight = '';
      }
    }

    // 4. Font Size
    if(content) {
      if(about.fontSize === 'large') {
        content.style.fontSize = '1.1rem';
      } else if(about.fontSize === 'xlarge') {
        content.style.fontSize = '1.25rem';
      } else {
        content.style.fontSize = '';
      }
    }
  }

  const titleEl = document.querySelector('.about-content .section-title');
  if(titleEl) titleEl.innerHTML = `${esc(about.title||'')}<br/><span class="gradient-text">นวัตกรรมดิจิทัล</span>`;
  const descEl = document.querySelector('.about-desc');
  if(descEl) descEl.textContent = about.desc||'';
  if(about.image) {
    const img = document.querySelector('.about-img');
    if(img) img.src = about.image;
  }
  const award = document.querySelector('.about-card-1 strong');
  if(award && about.award) award.textContent = about.award;
  const countries = document.querySelector('.about-card-2 strong');
  if(countries && about.countries) countries.nextSibling && (document.querySelector('.about-card-2 span').textContent = `${about.countries} ประเทศ`);
  if(about.features && about.features.length) {
    const featContainer = document.querySelector('.about-features');
    if(featContainer) {
      const align = about.textAlign || 'left';
      featContainer.innerHTML = about.features.map(f => `
        <div class="feature-item" style="${align==='center'?'justify-content:center;text-align:center;':''}">
          <div class="feature-icon">✓</div>
          <div style="${align==='center'?'text-align:center;':''}"><strong>${esc(f.title)}</strong><p>${esc(f.desc)}</p></div>
        </div>`).join('');
    }
  }
}

// --- Apply Services / News PR ---
function applyServices(services) {
  if(!services || !services.length) return;
  const grid = document.querySelector('.services-grid');
  if(!grid) return;
  window._newsItemsData = services;

  const defaultImgs = ['tech_banner_1.jpg', 'tech_banner_2.jpg', 'about_team.jpg'];

  grid.innerHTML = services.map((s, idx) => {
    const imgSrc = s.image || defaultImgs[idx % defaultImgs.length];
    return `
    <div class="news-card" onclick="openNewsModal('${s.id}')">
      <div class="news-card-img-wrap">
        <img src="${imgSrc}" alt="${esc(s.title)}" class="news-card-img" />
        ${s.featured ? '<span class="news-card-badge">ข่าวสำคัญ</span>' : ''}
      </div>
      <div class="news-card-body">
        <h3 class="news-card-title">${esc(s.title)}</h3>
        <div class="news-card-footer">
          <span class="news-card-date">${esc(s.date || '06 ส.ค. 2569')}</span>
          <button class="news-card-share" onclick="event.stopPropagation(); shareNewsCard('${esc(s.title)}')" title="แชร์ข่าว">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function shareNewsCard(title) {
  if (navigator.share) {
    navigator.share({ title: title, url: window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('คัดลอกลิงก์ข่าวประชาสัมพันธ์เรียบร้อยแล้ว!');
  }
}

// News Modal Handler
function openNewsModal(id) {
  const items = window._newsItemsData || [];
  const s = items.find(x => x.id === id);
  if(!s) return;

  let overlay = document.getElementById('newsDetailOverlay');
  if(!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'newsDetailOverlay';
    overlay.className = 'news-detail-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="news-detail-card">
      <button class="news-detail-close" onclick="closeNewsModal()">✕</button>
      <div class="news-detail-header">
        <span class="news-detail-tag">ข่าวสารประชาสัมพันธ์</span>
        ${s.date ? `<span class="news-detail-date">📅 ${esc(s.date)}</span>` : ''}
        <h2 class="news-detail-title">${esc(s.title)}</h2>
      </div>
      <div class="news-detail-body">
        ${s.image ? `
          <div class="news-detail-img-box">
            <img src="${s.image}" alt="${esc(s.title)}" class="news-detail-img">
          </div>
        ` : ''}
        
        <div class="news-detail-text">
          <p style="font-size:1.05rem;font-weight:600;color:var(--text);margin-bottom:16px">${esc(s.desc)}</p>
          ${s.fullText ? `<div class="news-full-body">${esc(s.fullText).replace(/\n/g, '<br/>')}</div>` : ''}
        </div>

        ${(s.features && s.features.length) ? `
          <div class="news-detail-highlights">
            <h4>📌 ประเด็นสำคัญ / รายละเอียดเพิ่มเติม</h4>
            <ul>
              ${s.features.map(f => `<li>✓ ${esc(f)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${s.pdfUrl ? `
          <div class="news-detail-pdf-box">
            <div class="pdf-icon">📄</div>
            <div class="pdf-info">
              <strong>เอกสารแนบประกอบข่าว (PDF)</strong>
              <span>${esc(s.pdfName || 'ดาวน์โหลดรายงานข่าวสาร_ฉบับเต็ม.pdf')}</span>
            </div>
            <a href="${s.pdfUrl}" download="${esc(s.pdfName || 'document.pdf')}" class="btn-download-pdf" target="_blank">
              <span>ดาวน์โหลด PDF</span>
              <span>↓</span>
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  overlay.onclick = (e) => {
    if(e.target === overlay) closeNewsModal();
  };
}

function closeNewsModal() {
  const overlay = document.getElementById('newsDetailOverlay');
  if(overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// --- Apply Portfolio ---
function applyPortfolio(portfolio, categories) {
  if(!portfolio || !portfolio.length) return;
  // Update filter buttons
  if(categories && categories.length) {
    const filterEl = document.querySelector('.portfolio-filter');
    if(filterEl) {
      filterEl.innerHTML = categories.map((c,i) =>
        `<button class="filter-btn ${i===0?'active':''}" data-filter="${esc(c.value)}">${esc(c.name)}</button>`
      ).join('');
    }
  }
  // Update portfolio grid
  const grid = document.querySelector('.portfolio-grid');
  if(!grid) return;
  grid.innerHTML = portfolio.map(p => {
    const bg = `background:${grad(p.gradStart,p.gradEnd)};`;
    return `
      <div class="portfolio-item ${p.large?'large':''}" data-category="${esc(p.category)}">
        <div class="portfolio-img" style="${bg}">
          ${p.image
            ? `<img src="${p.image}" alt="${esc(p.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;transition:transform .5s" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="p-icon" style="display:none">${esc(p.icon||'🎯')}</div>`
            : `<div class="p-icon">${esc(p.icon||'🎯')}</div>`}
          <div class="portfolio-overlay">
            <h4>${esc(p.title)}</h4>
            <p>${esc(p.tech)}</p>
            <a href="${p.image||'#'}" target="_blank" class="portfolio-link" onclick="if(this.getAttribute('href')==='#') event.preventDefault();">ดูรูปภาพขยาย →</a>
          </div>
        </div>
      </div>`;
  }).join('');
  // Re-attach filter events
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.portfolio-item').forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.opacity = show ? '1' : '0';
        item.style.transform = show ? 'scale(1)' : 'scale(0.9)';
        item.style.pointerEvents = show ? 'all' : 'none';
        item.style.transition = 'all 0.4s ease';
      });
    });
  });
}

// --- Apply Team ---
function applyTeam(team) {
  if(!team || !team.length) return;
  const grid = document.querySelector('.team-grid');
  if(!grid) return;
  grid.innerHTML = team.map(t => `
    <div class="team-card">
      <div class="team-avatar" style="background:${grad(t.gradStart,t.gradEnd)}">
        ${t.image
          ? `<img src="${t.image}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
          : `<span>${esc(t.avatar||t.name[0])}</span>`}
      </div>
      <h4>${esc(t.name)}</h4>
      <p class="team-role">${esc(t.role)}</p>
      <p class="team-bio">${esc(t.bio)}</p>
      <div class="team-socials"><a href="#">in</a><a href="#">𝕏</a></div>
    </div>`).join('');
  // Re-apply tilt
  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// --- Apply Testimonials ---
function applyTestimonials(testimonials) {
  if(!testimonials || !testimonials.length) return;
  const track = document.getElementById('testimTrack');
  if(!track) return;
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="stars">${'★'.repeat(Math.min(5,t.rating||5))}</div>
      <p>"${esc(t.text)}"</p>
      <div class="testimonial-author">
        <div class="author-avatar" style="background:${grad(t.gradStart,t.gradEnd)}">${esc(t.initial||t.author[0])}</div>
        <div><strong>${esc(t.author)}</strong><span>${esc(t.position)}</span></div>
      </div>
    </div>`).join('');
  // Re-init slider dots
  const dotsEl = document.getElementById('sliderDots');
  if(dotsEl) {
    dotsEl.innerHTML = '';
    testimonials.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i===0?' active':'');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }
}
// --- Apply Gallery (อัลบั้มภาพผลงาน & กิจกรรม) ---
function applyGallery(gallery) {
  const grid = document.getElementById('galleryGrid');
  if(!grid) return;
  
  const defaultItems = [
    {
      id: 'g1',
      title: 'ภาพกิจกรรมและผลงาน AWARIN ING. (Google Photos Album)',
      date: '06 ส.ค. 2569',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczP1h58K3_xupCE5yvN_AD58ZgFW_ywMgZazVIOslpuZt72mzCrFaoHlUaGQGVT1EuPLhMkAQeAEJOrE-fQ-2yQwtoEGB3xWd2nlzNYnZw0Pk08yHWcF=w1200',
      desc: 'อัลบั้มภาพกิจกรรมและการทำงานส่งเสริมนวัตกรรมดิจิทัลดึงตรงจาก Google Photos Album',
      externalUrl: 'https://photos.app.goo.gl/58LAS8aZPES9GAjf9',
      photos: [
        'https://lh3.googleusercontent.com/pw/AP1GczP1h58K3_xupCE5yvN_AD58ZgFW_ywMgZazVIOslpuZt72mzCrFaoHlUaGQGVT1EuPLhMkAQeAEJOrE-fQ-2yQwtoEGB3xWd2nlzNYnZw0Pk08yHWcF=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczObXng0Yo38-a6Yrtpn-GXJ2dKQbATviiA4hjV06uRMMCXknAiKOWvPh0J3dwuirLezu3FSa1EIYergSjldCOSMJ1acf6MP2YWh-dopLxIsB2SHyl4o=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczOIkU2rsiWGEcsPmsNnM-lpI-S5DKIYOa4oPA_QNnaXtKIf75BdkqQ99jQUbjgdU9CRCaCHxHbaPkvZey8eTVcqWhofLVUMxefURbWIbozYfzJYtj87=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczNcffzZyHoZN53hVBN9MQTL5eXsGSgSjO2sUt95pkl0iLc-fOjsHrLuGTnK-5JSX5sQ1rLoOTPgj_dA6aG-aysRm0gAPbeLHvyZwLxoXKc3_Y8cA5az=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczOx61eQsq-mbmEwONgyoZEa6K0jU8uGkq1OrzF0JrH4H_Xgo3N03CgVZYHHVC8Zn-7QDHL7IMNtZlkTdG9mkhgTfCqj-eXaTIfk8VL_63lRA8ar_R2m=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczNYnxMRx2WkTcshEo0mpgLLkyvHJ913M6zfY98XuRWvKZnCTpCx9cONsjhFEIVI_LzJtPUdYtbmgSq_KrYizEjDtIj9ksAYKZuaJA29A34jxhzoSD8D=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczOerUVuCufvjwyu2VxnO0u_CyTIgx4M--dJKoDKp5SU1FiDUDUzawAOW6rpVzLhqxmv5LZx76xxolNGSqGbHhnIf0YGxwXMyfdeqvQUBvNi8thtP-kq=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczOjGNzNp_rbJt7I8QBkXxDfXGOliGUD9T13cZUynxx2thD_E1IprIJTr43tW7Qk7PCbFNYAAc67NIpvZa0OJ54XDA2bBFD3eS-DzL2SKixDQ82jOy8A=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczOT5Vt0x2kYjcX5LHSPEnZd0qwcTra_3LMvL2FSCmQomw0_Vi6SwWXq-0b7SL0fbKm80DO6TNfmvWETqgdLN7fWTO_o3OXXc4s9fIKWeaLsVdi5JZXH=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczNK7VrjKwn1kFCfqzOLvNxq5ujCtYf2yRY7JOayNkywLouvKnIlr8JppZ99AlPotF5zz6Lx718GbjU7dbgsXfoV90QJR1bHfUCEWtud3q59BEiC_VR5=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczO-Mc4lDRI8s69HBmMJdRv8BbVvzT3-UWNwCu_hLmPgF_XzuUYz-I9GDXp5lbET_7TK-Q00_DgXrvzmfxCF8uCmQosQFdCvmDqQQKM7Xqfvo0TmhHfK=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczPfHFgh5hevXlmpQuleEDseMBLJixSOdLnTRXKIaHNus2-n1uvAWz40wEgjWZsj01N6m4gBlKU5jiacoyANSJ5lbUBXQhwlsYoY3TYjTNMoVNy2dhXe=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczOtpZFw-a9K1nUNEz2-4Bn3ctbdCUwS1B7n0qUfH7-Av9w4eAY55P4LPpztp-blnYTFqQL0lRMF-Tbnz3WwGwGdtMz7d_Ti9Eu4T3shQMH7ImQ176ah=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczPeddoZjyYhVDlrGpI8UXMBsayDAKC3uPBgq3zu7w_Bc7stJ5JEz2VDwVsdc0s3UBm1YabWk9zxh2JSHIjH9IVX7nDmBNWsA4kdLXVQ4BWH-0uSl9dk=w1200',
        'https://lh3.googleusercontent.com/pw/AP1GczMv0wId9YoYLceUK7GBW_cRT-HTZ4ZuPmyCj6GDm91qp-dUn6uovkdQCtO-fqjHmsCSNwka3pLrRmopdDCt9B0iAICHlr3yj0UDGT2LJjS7kJiXHJHD=w1200'
      ]
    },
    {
      id: 'g2',
      title: 'งานแสดงเทคโนโลยีและนวัตกรรมอาหารสัตว์แห่งชาติ',
      date: '05 ส.ค. 2569',
      image: 'tech_banner_2.jpg',
      desc: 'ภาพการเข้าร่วมจัดแสดงบูธผลงานนวัตกรรมอาหารสัตว์แปรรูปและเทคโนโลยีการผลิตในระดับภูมิภาค',
      photos: ['tech_banner_2.jpg', 'about_team.jpg', 'tech_banner_1.jpg']
    },
    {
      id: 'g3',
      title: 'ภาพทีมงานและการลงพื้นที่ปฏิบัติงานชุมชนจริง',
      date: '01 ส.ค. 2569',
      image: 'about_team.jpg',
      desc: 'ทีมงานผู้เชี่ยวชาญร่วมพัฒนาระบบและทดสอบการใช้งานจริงร่วมกับเกษตรกรในพื้นที่อย่างใกล้ชิด',
      photos: ['about_team.jpg', 'tech_banner_1.jpg', 'tech_banner_2.jpg']
    }
  ];

  const items = (gallery && gallery.length) ? gallery : defaultItems;
  window._galleryData = items;

  grid.innerHTML = items.map((item, idx) => {
    const photos = (item.photos && item.photos.length) ? item.photos : [item.image || 'tech_banner_1.jpg'];
    const cover = item.image || photos[0];
    const photoCount = photos.length;

    return `
    <div class="gallery-card" onclick="openAlbumModal(${idx})">
      <div class="gallery-img-box">
        <img src="${cover}" referrerpolicy="no-referrer" alt="${esc(item.title||'อัลบั้มภาพผลงาน')}" class="gallery-img" loading="lazy" />
        <span class="album-badge-count">📷 ${photoCount} ภาพ</span>
        <div class="gallery-overlay-icon">
          <span style="font-size:0.95rem;font-weight:700">เปิดดูอัลบั้มภาพ (${photoCount} รูป) →</span>
        </div>
      </div>
      <div class="gallery-card-info">
        <h4>${esc(item.title || 'อัลบั้มภาพผลงาน')}</h4>
        <div class="gallery-card-meta">
          ${item.date ? `<span>📅 ${esc(item.date)}</span>` : ''}
          <span style="color:var(--primary);font-weight:600">ดูรูปทั้งหมด (${photoCount}) →</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// Album Modal Handler (เปิดหน้าดูอัลบั้มรวมรูปภาพ)
let currentAlbumPhotos = [];
let currentPhotoIdx = 0;

function openAlbumModal(idx) {
  const items = window._galleryData || [];
  const item = items[idx];
  if(!item) return;

  const photos = (item.photos && item.photos.length) ? item.photos : [item.image || 'tech_banner_1.jpg'];
  currentAlbumPhotos = photos;
  const extUrl = item.externalUrl || 'https://photos.app.goo.gl/58LAS8aZPES9GAjf9';

  // Display max 7 photos in preview grid + 1 "ดูเพิ่มเติม" card
  const MAX_PREVIEW = 7;
  const showPhotos = photos.slice(0, MAX_PREVIEW);
  const remainingCount = photos.length > MAX_PREVIEW ? (photos.length - MAX_PREVIEW) : 0;

  let overlay = document.getElementById('albumDetailOverlay');
  if(!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'albumDetailOverlay';
    overlay.className = 'news-detail-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="news-detail-card" style="max-width:920px;padding:32px">
      <button class="news-detail-close" onclick="closeAlbumModal()">✕</button>

      <div class="news-detail-header" style="margin-bottom:20px">
        <span class="news-detail-tag">📁 อัลบั้มภาพผลงาน</span>
        ${item.date ? `<span class="news-detail-date">📅 ${esc(item.date)}</span>` : ''}
        <span class="album-total-count">📷 รวมทั้งหมด ${photos.length} รูป</span>
        <h2 class="news-detail-title" style="margin-top:10px">${esc(item.title || 'อัลบั้มภาพผลงาน')}</h2>
        ${item.desc ? `<p style="font-size:0.95rem;color:#475569;margin-top:10px;line-height:1.6">${esc(item.desc)}</p>` : ''}
        
        ${extUrl ? `
          <div style="margin-top:12px">
            <a href="${extUrl}" target="_blank" rel="noopener" class="btn-external-album">
              <span>🔗 เปิดดูรูปภาพทั้งหมดในอัลบั้มเต็ม (${photos.length} รูป) บน Google Photos / Facebook ↗</span>
            </a>
          </div>
        ` : ''}
      </div>

      <div class="album-photo-grid">
        ${showPhotos.map((pUrl, pIdx) => `
          <div class="album-photo-item" onclick="openPhotoViewer(${pIdx})">
            <img src="${pUrl}" referrerpolicy="no-referrer" alt="รูปที่ ${pIdx+1}" loading="lazy" />
            <div class="album-photo-overlay">
              <span>🔍 คลิกดูรูปใหญ่</span>
            </div>
          </div>
        `).join('')}

        <!-- "ดูเพิ่มเติม" Card at the end of grid -->
        <div class="album-photo-item album-more-card" onclick="openExternalAlbumLink('${esc(extUrl)}')">
          <div class="album-more-overlay">
            <span class="album-more-icon">🖼️</span>
            <span class="album-more-title">ดูรูปภาพเพิ่มเติม</span>
            <span class="album-more-sub">${remainingCount > 0 ? `+${remainingCount} รูป ` : ''}(เปิดอัลบั้มเต็ม) ↗</span>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  overlay.onclick = (e) => {
    if(e.target === overlay) closeAlbumModal();
  };
}

function openExternalAlbumLink(url) {
  const targetUrl = (url && url.trim()) ? url.trim() : 'https://photos.app.goo.gl/58LAS8aZPES9GAjf9';
  window.open(targetUrl, '_blank');
}

function closeAlbumModal() {
  const overlay = document.getElementById('albumDetailOverlay');
  if(overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Single Photo Fullscreen Lightbox Viewer with Slide Arrows (< >)
function openPhotoViewer(photoIdx) {
  currentPhotoIdx = photoIdx;
  let viewer = document.getElementById('photoViewerLightbox');
  if(!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'photoViewerLightbox';
    viewer.className = 'photo-viewer-lightbox';
    document.body.appendChild(viewer);
  }

  updateViewerContent();
  viewer.classList.add('show');
}

function updateViewerContent() {
  const viewer = document.getElementById('photoViewerLightbox');
  if(!viewer) return;

  const total = currentAlbumPhotos.length;
  const currentSrc = currentAlbumPhotos[currentPhotoIdx] || '';

  viewer.innerHTML = `
    <div class="photo-viewer-box">
      <button class="photo-viewer-close" onclick="closePhotoViewer()">✕</button>
      ${total > 1 ? `
        <button class="photo-viewer-prev" onclick="prevViewerPhoto(event)">‹</button>
        <button class="photo-viewer-next" onclick="nextViewerPhoto(event)">›</button>
      ` : ''}
      <img src="${currentSrc}" referrerpolicy="no-referrer" class="photo-viewer-img" alt="รูปที่ ${currentPhotoIdx+1}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
      <div style="display:none;background:#1e293b;padding:30px 40px;border-radius:12px;text-align:center;border:1px solid #334155">
        <span style="font-size:2.5rem">🖼️</span>
        <h4 style="color:#f87171;margin-top:10px;font-size:1.1rem">ไม่สามารถโหลดรูปภาพจากลิงก์นี้ได้</h4>
        <p style="color:#cbd5e1;font-size:0.85rem;margin-top:6px;line-height:1.6">ลิงก์ที่นำมาวางเป็นลิงก์หน้าเว็บอัลบั้ม (เช่น photos.app.goo.gl หรือ facebook.com)<br><strong>วิธีแก้ไข:</strong> ให้คลิกขวาที่รูปภาพบนเว็บนั้น แล้วเลือก <strong style="color:#60a5fa">"คัดลอกที่อยู่อิเมจ" (Copy Image Address)</strong><br>หรืออัปโหลดไฟล์จากเครื่องคอมพิวเตอร์ผู้ดูแลระบบโดยตรงครับ</p>
      </div>
      <div class="photo-viewer-caption" style="margin-top:14px">
        <span>รูปที่ ${currentPhotoIdx+1} จาก ${total}</span>
      </div>
    </div>
  `;

  viewer.onclick = (e) => {
    if(e.target === viewer) closePhotoViewer();
  };
}

function prevViewerPhoto(e) {
  if(e) e.stopPropagation();
  currentPhotoIdx = (currentPhotoIdx - 1 + currentAlbumPhotos.length) % currentAlbumPhotos.length;
  updateViewerContent();
}

function nextViewerPhoto(e) {
  if(e) e.stopPropagation();
  currentPhotoIdx = (currentPhotoIdx + 1) % currentAlbumPhotos.length;
  updateViewerContent();
}

function closePhotoViewer() {
  const viewer = document.getElementById('photoViewerLightbox');
  if(viewer) viewer.classList.remove('show');
}

function getYouTubeId(url) {
  if(!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// --- Video Modal Handler (ป๊อปอัปวิดีโอตัวอย่างผลงาน) ---
function openVideoModal() {
  const hero = window.CONFIG_DATA ? window.CONFIG_DATA.hero : {};
  const rawUrl = (hero && hero.videoUrl) ? hero.videoUrl.trim() : '';

  let overlay = document.getElementById('videoModalOverlay');
  if(!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'videoModalOverlay';
    overlay.className = 'news-detail-overlay';
    document.body.appendChild(overlay);
  }

  let embedHtml = '';
  let extLink = '';

  const ytId = getYouTubeId(rawUrl);

  if(ytId) {
    extLink = `https://www.youtube.com/watch?v=${ytId}`;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&rel=0&playsinline=1`;
    embedHtml = `<iframe src="${embedUrl}" title="Video Preview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%;height:100%;border:0" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  } else if(rawUrl.includes('vimeo.com')) {
    const videoId = rawUrl.split('vimeo.com/')[1].split('?')[0];
    extLink = rawUrl;
    const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    embedHtml = `<iframe src="${embedUrl}" title="Video Preview" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
  } else if(rawUrl && (rawUrl.startsWith('data:video') || rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.endsWith('.mov') || rawUrl.includes('blob:'))) {
    embedHtml = `<video src="${rawUrl}" autoplay controls playsinline style="width:100%;height:100%;border-radius:12px;object-fit:cover"></video>`;
  } else if(rawUrl) {
    embedHtml = `<iframe src="${rawUrl}" title="Video Preview" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
  } else {
    // If no video URL is provided yet, show a friendly fallback message & video upload prompt
    embedHtml = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#1e293b;color:#ffffff;text-align:center;padding:30px">
        <span style="font-size:3.5rem;margin-bottom:10px">🎬</span>
        <h3 style="font-size:1.2rem;font-weight:700;color:#f1f5f9">ยังไม่ได้ตั้งค่าหรือแนบไฟล์วิดีโอผลงาน</h3>
        <p style="font-size:0.88rem;color:#94a3b8;margin-top:6px;max-width:480px">ผู้ดูแลระบบสามารถวางลิงก์ YouTube / Vimeo หรืออัปโหลดไฟล์วิดีโอจากเครื่องคอมพิวเตอร์ได้ที่หน้าหลังบ้าน (Admin Panel)</p>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="news-detail-card" style="max-width:960px;padding:24px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;color:#ffffff">
      <button class="news-detail-close" onclick="closeVideoModal()" style="color:#ffffff;background:rgba(255,255,255,0.2);top:16px;right:16px">✕</button>

      <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <span style="font-size:0.82rem;font-weight:700;background:rgba(124,58,237,0.3);color:#c084fc;padding:4px 12px;border-radius:100px;border:1px solid rgba(192,132,252,0.3)">🎬 วิดีโอแนะนำผลงาน & นวัตกรรม AWARIN ING.</span>
        ${extLink ? `<a href="${extLink}" target="_blank" rel="noopener" style="font-size:0.8rem;color:#60a5fa;text-decoration:none;font-weight:600">🔗 เปิดดูบน YouTube ทันที ↗</a>` : ''}
      </div>

      <div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000000;box-shadow:0 20px 50px rgba(0,0,0,0.5)">
        ${embedHtml}
      </div>
    </div>
  `;

  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
  overlay.onclick = (e) => {
    if(e.target === overlay) closeVideoModal();
  };
}

function closeVideoModal() {
  const overlay = document.getElementById('videoModalOverlay');
  if(overlay) {
    overlay.classList.remove('show');
    overlay.innerHTML = '';
  }
  document.body.style.overflow = '';
}
// --- Apply Custom Columns ---
function applyColumns(columns) {
  if(!columns || !columns.length) return;
  const visible = columns.filter(c => c.visible !== false);
  if(!visible.length) return;
  const teamSection = document.getElementById('team');
  if(!teamSection) return;
  let colSection = document.getElementById('custom-columns-section');
  if(!colSection) {
    colSection = document.createElement('section');
    colSection.id = 'custom-columns-section';
    colSection.className = 'section';
    colSection.style.cssText = 'background:var(--bg-2);padding:80px 0';
    teamSection.parentNode.insertBefore(colSection, teamSection.nextSibling);
  }
  colSection.innerHTML = `<div class="container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:32px">
    ${visible.map(c => {
      const align = c.textAlign || 'left';
      return `
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,.05);text-align:${align}">
        <h3 style="font-size:1.3rem;font-weight:800;margin-bottom:16px;color:var(--text)">${esc(c.title)}</h3>
        ${c.image?`<img src="${c.image}" style="width:100%;border-radius:12px;margin-bottom:16px;object-fit:cover;max-height:240px">` : ''}
        <div style="color:var(--text-muted);font-size:.92rem;line-height:1.8;text-align:${align}">${c.content||''}</div>
      </div>`;
    }).join('')}
  </div></div>`;
}

// --- Apply Contact ---
function applyContact(contact) {
  if(!contact) return;
  const items = document.querySelectorAll('.contact-item');
  const fields = [contact.address, contact.phone, contact.email, contact.hours];
  items.forEach((item, i) => {
    if(fields[i]) {
      const p = item.querySelector('p');
      if(p) p.innerHTML = fields[i].replace(/\n/g,'<br>');
    }
  });
}

// --- Apply Theme & Colors ---
function applyTheme(t) {
  if(!t) return;
  const root = document.documentElement.style;
  if(t.primaryColor) {
    root.setProperty('--primary', t.primaryColor);
    root.setProperty('--primary-light', t.primaryColor);
  }
  if(t.gradStart && t.gradEnd) {
    const mid = t.gradMiddle || t.gradEnd;
    root.setProperty('--gradient', `linear-gradient(135deg, ${t.gradStart} 0%, ${t.gradEnd} 100%)`);
    root.setProperty('--gradient-text', `linear-gradient(135deg, ${t.gradStart} 0%, ${mid} 50%, ${t.gradEnd} 100%)`);
  }
  
  // Background & Text Theme
  if(t.bgTheme === 'dark') {
    root.setProperty('--bg', '#0f0c1b');
    root.setProperty('--bg-2', '#18142b');
    root.setProperty('--text', '#f8fafc');
    root.setProperty('--text-muted', '#94a3b8');
    root.setProperty('--surface', 'rgba(255,255,255,0.05)');
    root.setProperty('--border', 'rgba(255,255,255,0.1)');
  } else if(t.bgTheme === 'midnight') {
    root.setProperty('--bg', '#0b1329');
    root.setProperty('--bg-2', '#111c38');
    root.setProperty('--text', '#f8fafc');
    root.setProperty('--text-muted', '#94a3b8');
    root.setProperty('--surface', 'rgba(255,255,255,0.05)');
    root.setProperty('--border', 'rgba(255,255,255,0.1)');
  } else if(t.bgTheme === 'soft') {
    root.setProperty('--bg', '#faf8f5');
    root.setProperty('--bg-2', '#f3efe6');
    root.setProperty('--text', '#1c1917');
    root.setProperty('--text-muted', '#57534e');
    root.setProperty('--surface', 'rgba(0,0,0,0.03)');
    root.setProperty('--border', 'rgba(0,0,0,0.08)');
  } else if(t.bgTheme === 'light') {
    root.setProperty('--bg', '#ffffff');
    root.setProperty('--bg-2', '#f8f7ff');
    root.setProperty('--text', '#0f0a1e');
    root.setProperty('--text-muted', '#4b5563');
    root.setProperty('--surface', 'rgba(124,58,237,0.04)');
    root.setProperty('--border', 'rgba(124,58,237,0.12)');
  } else if(t.bgTheme === 'custom') {
    if(t.bgColor) root.setProperty('--bg', t.bgColor);
    if(t.textColor) root.setProperty('--text', t.textColor);
  }
}

// --- Apply Full 1-Column Banner Slider ---
let currentBannerIdx = 0;
let bannerTimer = null;

function applySlider(slider) {
  const section = document.getElementById('bannerSliderSection');
  if(!slider || !slider.length) {
    if(section) section.style.display = 'none';
    return;
  }
  if(section) section.style.display = 'block';
  const track = document.getElementById('mainBannerTrack');
  const dotsEl = document.getElementById('bannerDots');
  if(!track) return;
  
  track.innerHTML = slider.map(s => {
    const bgImg = s.image || 'tech_banner_1.jpg';
    return `
      <div class="banner-slide-item">
        <img src="${bgImg}" alt="${esc(s.title)}" class="banner-slide-bg" />
        <div class="banner-slide-overlay"></div>
        <div class="banner-slide-content">
          ${s.badge ? `<div class="banner-slide-badge">${esc(s.badge)}</div>` : ''}
          <h2 class="banner-slide-title">${esc(s.title)}</h2>
          ${s.desc ? `<p class="banner-slide-desc">${esc(s.desc)}</p>` : ''}
          <a href="${esc(s.link || '#')}" class="btn btn-primary">${esc(s.btnText || 'ดูข้อมูลเพิ่มเติม →')}</a>
        </div>
      </div>`;
  }).join('');

  // Setup dots
  if(dotsEl) {
    dotsEl.innerHTML = slider.map((_, i) =>
      `<button class="banner-dot ${i===0?'active':''}" onclick="goToBannerSlide(${i})"></button>`
    ).join('');
  }

  // Setup Arrows
  const prevBtn = document.getElementById('bannerPrevBtn');
  const nextBtn = document.getElementById('bannerNextBtn');
  if(prevBtn) prevBtn.onclick = () => moveBannerSlide(-1);
  if(nextBtn) nextBtn.onclick = () => moveBannerSlide(1);

  // Start Autoplay
  startBannerAutoplay(slider.length);
}

function goToBannerSlide(idx) {
  const track = document.getElementById('mainBannerTrack');
  const dots = document.querySelectorAll('.banner-dot');
  if(!track) return;
  const total = dots.length;
  if(total === 0) return;

  currentBannerIdx = (idx + total) % total;
  track.style.transform = `translateX(-${currentBannerIdx * 100}%)`;

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentBannerIdx);
  });
}

function moveBannerSlide(step) {
  const dots = document.querySelectorAll('.banner-dot');
  goToBannerSlide(currentBannerIdx + step);
  startBannerAutoplay(dots.length);
}

function startBannerAutoplay(total) {
  if(bannerTimer) clearInterval(bannerTimer);
  if(total <= 1) return;
  bannerTimer = setInterval(() => {
    goToBannerSlide(currentBannerIdx + 1);
  }, 4500);
}

// --- MASTER LOAD FUNCTION ---
function loadSiteData() {
  const data = getSiteData();
  if(!data) return;
  if(data.theme) applyTheme(data.theme);
  if(data.logo) applyLogo(data.logo);
  if(data.hero) applyHero(data.hero);
  if(data.slider) applySlider(data.slider);
  if(data.about) applyAbout(data.about);
  if(data.services) applyServices(data.services);
  applyGallery(data.gallery);
  if(data.portfolio) applyPortfolio(data.portfolio, data.categories);
  if(data.team) applyTeam(data.team);
  if(data.testimonials) applyTestimonials(data.testimonials);
  if(data.columns) applyColumns(data.columns);
  if(data.contact) applyContact(data.contact);
}

// Run after DOM is ready
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSiteData);
} else {
  loadSiteData();
}

// Real-time synchronization across open tabs & windows
window.addEventListener('storage', (e) => {
  if(e.key === SITE_KEY) {
    loadSiteData();
  }
});

