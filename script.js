// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Add fade-up class to animatable elements
document.querySelectorAll(
  '.section-title, .section-subtitle, .section-desc, ' +
  '.feature-list li, .studio-card, .equip-card, .lesson-track, ' +
  '.flow-step, .contact-item, .price-badge, .visual-card, ' +
  '.faq-item, .policy-block, .business-item'
).forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// Contact form
const contactForm = document.getElementById('contactForm');
const typeLabels = {
  bandclub: '밴드클럽 신청',
  rehearsal: '합주실 예약',
  recording: '녹음실 예약',
  lesson: '레슨 문의',
  oneday: '무료 원데이 클래스',
  other: '기타'
};

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '전송 중...';
  submitBtn.disabled = true;

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  try {
    var params = new URLSearchParams({
      action: 'submitInquiry',
      name: data.name,
      phone: data.phone,
      type: typeLabels[data.type] || data.type,
      message: data.message || ''
    });
    await fetch(CONFIG.APPS_SCRIPT_URL + '?' + params.toString(), { method: 'GET' });
    showToast('문의가 접수되었습니다! 빠르게 연락드리겠습니다.');
    contactForm.reset();
  } catch (err) {
    var message =
      '[TENET 문의]\n이름: ' + data.name + '\n연락처: ' + data.phone +
      '\n유형: ' + (typeLabels[data.type] || data.type) + '\n메시지: ' + (data.message || '(없음)');
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      showToast('문의 내용이 복사되었습니다. 카카오톡 또는 전화로 보내주세요!');
    } else {
      showToast('전화(010-3081-3730)로 문의해주세요!');
    }
    contactForm.reset();
  }

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
});

// Toast notification
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: #e8c547;
    color: #0a0a0a;
    padding: 16px 32px;
    border-radius: 100px;
    font-size: 0.9rem;
    font-weight: 700;
    z-index: 9999;
    animation: toastIn 0.3s ease;
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Toast animation
const style = document.createElement('style');
style.textContent = `
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// ===== PAYMENT SYSTEM =====
const CONFIG = {
  PORTONE_MERCHANT_ID: 'YOUR_MERCHANT_ID',
  PORTONE_CHANNEL_KEY: 'YOUR_CHANNEL_KEY',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzexiGY-zXCXcOgWH2S3g0bGVBh5kLvsAqn3C2Wp97_6iKf0mdlPbeKVE8kzxSRlbJs/exec'
};

async function loadProjects() {
  const container = document.getElementById('projectsContainer');
  if (!container) return;

  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getProjects`);
    const data = await res.json();

    if (!data.projects || data.projects.length === 0) {
      container.innerHTML = '<div class="projects-empty"><p>현재 모집 중인 프로젝트가 없습니다.<br>새로운 프로젝트가 열리면 안내드리겠습니다.</p></div>';
      return;
    }

    const cards = data.projects.map(project => {
      const isOpen = project.status === '오픈';
      const formattedPrice = Number(project.price).toLocaleString();
      return `
        <div class="project-card">
          <span class="project-status ${isOpen ? 'open' : 'closed'}">${isOpen ? '모집중' : '마감'}</span>
          <h3>${escapeHtml(project.name)}</h3>
          <p class="project-desc">${escapeHtml(project.description || '')}</p>
          <div class="project-price">${formattedPrice}원</div>
          <p class="project-price-note">8주 패키지 / 합주실·코칭·공연 포함</p>
          <button class="btn-pay" ${isOpen ? '' : 'disabled'}
            onclick="startPayment('${escapeHtml(project.id)}', '${escapeHtml(project.name)}', ${project.price})">
            ${isOpen ? '네이버페이 결제' : '마감된 프로젝트입니다'}
          </button>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="projects-grid">${cards}</div>`;
  } catch (err) {
    container.innerHTML = '<div class="projects-empty"><p>현재 모집 중인 프로젝트가 없습니다.<br>새로운 프로젝트가 열리면 안내드리겠습니다.</p></div>';
  }
}

function startPayment(projectId, projectName, amount) {
  if (CONFIG.PORTONE_MERCHANT_ID === 'YOUR_MERCHANT_ID') {
    showToast('결제 시스템 준비 중입니다. 전화(010-3081-3730)로 문의해주세요.');
    return;
  }

  const IMP = window.IMP;
  IMP.init(CONFIG.PORTONE_MERCHANT_ID);

  IMP.request_pay({
    pg: `naverpay.${CONFIG.PORTONE_CHANNEL_KEY}`,
    pay_method: 'card',
    merchant_uid: `bandclub_${projectId}_${Date.now()}`,
    name: `[밴드클럽] ${projectName}`,
    amount: amount,
    naverProducts: [{
      categoryType: 'ETC', categoryId: 'ETC',
      uid: projectId, name: `밴드클럽 - ${projectName}`, count: 1,
    }],
    m_redirect_url: window.location.href
  }, async function(rsp) {
    if (rsp.success) {
      try {
        await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verifyPayment', imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid, project_id: projectId,
            project_name: projectName, amount: amount,
            buyer_name: rsp.buyer_name || '', buyer_tel: rsp.buyer_tel || '',
          })
        });
      } catch (e) {}
      showPaymentResult(true, projectName);
    } else {
      showPaymentResult(false, rsp.error_msg || '결제가 취소되었습니다.');
    }
  });
}

function showPaymentResult(success, message) {
  const modal = document.getElementById('paymentModal');
  const content = document.getElementById('modalContent');
  if (success) {
    content.innerHTML = `
      <div class="modal-icon success">&#10003;</div>
      <h2>결제가 완료되었습니다</h2>
      <p>${escapeHtml(message)} 프로젝트에 등록되었습니다.<br>OT 일정 및 상세 안내는 카카오톡으로 발송됩니다.</p>
      <button class="modal-close" onclick="closeModal()">확인</button>`;
  } else {
    content.innerHTML = `
      <div class="modal-icon fail">&#10007;</div>
      <h2>결제 실패</h2>
      <p>${escapeHtml(message)}</p>
      <button class="modal-close" onclick="closeModal()">닫기</button>`;
  }
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('paymentModal').classList.remove('active');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// FAQ toggle
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// Refund policy toggle
const refundToggle = document.getElementById('refundToggle');
const refundPanel = document.getElementById('refundPanel');
if (refundToggle && refundPanel) {
  refundToggle.addEventListener('click', () => {
    refundToggle.classList.toggle('active');
    refundPanel.classList.toggle('open');
    const label = refundToggle.querySelector('span:first-child');
    label.textContent = refundPanel.classList.contains('open') ? '환불 규정 닫기' : '환불 규정 보기';
  });
}

// Load portfolio from Sheets
async function loadPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getPortfolio`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return; // 기본 카드 유지

    grid.innerHTML = data.items.map(function(item) { return `
      <div class="portfolio-item">
        <div class="portfolio-img">
          <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy"
               onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">${escapeHtml(item.category)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}${item.date ? ' | ' + escapeHtml(item.date) : ''}</p>
        </div>
      </div>
    `; }).join('');
    attachPortfolioClicks();
  } catch (err) {
    // Sheets 미연동 시 기본 카드 유지
  }
}

// Load projects and portfolio on page load
loadProjects();
loadPortfolio();

// Portfolio Lightbox
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightboxImg');
var lightboxTag = document.getElementById('lightboxTag');
var lightboxTitle = document.getElementById('lightboxTitle');
var lightboxDesc = document.getElementById('lightboxDesc');
var lightboxClose = document.getElementById('lightboxClose');

function openLightbox(imgSrc, tag, title, desc) {
  lightboxImg.src = imgSrc;
  lightboxImg.alt = title;
  lightboxTag.textContent = tag;
  lightboxTitle.textContent = title;
  lightboxDesc.textContent = desc;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', function(e) {
  e.stopPropagation();
  closeLightbox();
});

lightbox.addEventListener('click', function(e) {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

// Attach click to portfolio items
function attachPortfolioClicks() {
  document.querySelectorAll('.portfolio-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var img = item.querySelector('.portfolio-img img');
      var tag = item.querySelector('.portfolio-tag');
      var title = item.querySelector('.portfolio-info h3');
      var desc = item.querySelector('.portfolio-info p');
      if (img) {
        openLightbox(img.src, tag ? tag.textContent : '', title ? title.textContent : '', desc ? desc.textContent : '');
      }
    });
  });
}

attachPortfolioClicks();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
