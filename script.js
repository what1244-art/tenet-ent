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
  '.flow-step, .contact-item, .price-badge, .visual-card'
).forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

// Contact form
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  // Format message for tel link or alert
  const typeLabels = {
    bandclub: '밴드클럽 신청',
    rehearsal: '합주실 예약',
    recording: '녹음실 예약',
    lesson: '레슨 문의',
    oneday: '무료 원데이 클래스',
    other: '기타'
  };

  const message =
    `[TENET 문의]\n` +
    `이름: ${data.name}\n` +
    `연락처: ${data.phone}\n` +
    `유형: ${typeLabels[data.type] || data.type}\n` +
    `메시지: ${data.message || '(없음)'}`;

  // Copy to clipboard and show confirmation
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message).then(() => {
      showToast('문의 내용이 복사되었습니다. 카카오톡 또는 전화로 보내주세요!');
    });
  } else {
    showToast('전화(010-3081-3730)로 문의해주세요!');
  }

  contactForm.reset();
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
