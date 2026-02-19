// STEP Academy 2026 - Main JavaScript
// Author: STEP Academy Team
// Version: 1.0.0

// ========================================
// PWA Installation & Service Worker
// ========================================

let deferredPrompt;
let swRegistration;

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker مسجل بنجاح:', swRegistration.scope);
      
      // التحقق من التحديثات
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showNotification('تحديث متاح!', 'يوجد نسخة جديدة من التطبيق. قم بتحديث الصفحة.');
          }
        });
      });
    } catch (error) {
      console.error('❌ فشل تسجيل Service Worker:', error);
    }
  });
}

// معالجة تثبيت PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // إظهار بانر التثبيت
  const installBanner = document.getElementById('installBanner');
  if (installBanner) {
    installBanner.classList.remove('hidden');
  }
});

// زر التثبيت
document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`نتيجة التثبيت: ${outcome}`);
  
  if (outcome === 'accepted') {
    showNotification('تم التثبيت!', 'تم تثبيت التطبيق بنجاح 🎉');
  }
  
  deferredPrompt = null;
  document.getElementById('installBanner')?.classList.add('hidden');
});

// زر إلغاء البانر
document.getElementById('dismissInstall')?.addEventListener('click', () => {
  document.getElementById('installBanner')?.classList.add('hidden');
  localStorage.setItem('installBannerDismissed', 'true');
});

// إخفاء البانر إذا تم رفضه مسبقاً
window.addEventListener('load', () => {
  if (localStorage.getItem('installBannerDismissed') === 'true') {
    document.getElementById('installBanner')?.classList.add('hidden');
  }
});

// ========================================
// Loading Screen
// ========================================

window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 1500);
});

// ========================================
// Navigation
// ========================================

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle?.addEventListener('click', () => {
  navMenu?.classList.toggle('active');
  
  // Animate hamburger
  const spans = navToggle.querySelectorAll('span');
  spans[0].style.transform = navMenu?.classList.contains('active') ? 
    'rotate(45deg) translate(6px, 6px)' : '';
  spans[1].style.opacity = navMenu?.classList.contains('active') ? '0' : '1';
  spans[2].style.transform = navMenu?.classList.contains('active') ? 
    'rotate(-45deg) translate(6px, -6px)' : '';
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('active');
    
    // Reset hamburger
    const spans = navToggle?.querySelectorAll('span');
    if (spans) {
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || !href) return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// Header Scroll Effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    header?.classList.add('scrolled');
  } else {
    header?.classList.remove('scrolled');
  }
  
  // Hide header on scroll down, show on scroll up
  if (currentScroll > lastScroll && currentScroll > 500) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }
  
  lastScroll = currentScroll;
});

// Active Navigation Link
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (pageYOffset >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ========================================
// Chatbot
// ========================================

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbot = document.getElementById('chatbot');
const closeChatbot = document.getElementById('closeChatbot');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const chatBadge = document.querySelector('.chat-badge');

// Toggle Chatbot
chatbotToggle?.addEventListener('click', () => {
  chatbot?.classList.toggle('active');
  if (chatbot?.classList.contains('active')) {
    chatInput?.focus();
    chatBadge.style.display = 'none';
  }
});

closeChatbot?.addEventListener('click', () => {
  chatbot?.classList.remove('active');
});

// Send Message
sendMessage?.addEventListener('click', () => {
  handleChatMessage();
});

chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleChatMessage();
  }
});

function handleChatMessage() {
  const message = chatInput?.value.trim();
  if (!message) return;
  
  // Add user message
  addChatMessage(message, 'user');
  chatInput.value = '';
  
  // Simulate bot response
  setTimeout(() => {
    const response = getBotResponse(message);
    addChatMessage(response, 'bot');
  }, 1000);
}

function addChatMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageDiv.textContent = message;
  
  chatMessages?.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Simple chatbot responses
  if (lowerMessage.includes('اختبار') || lowerMessage.includes('تجريبي')) {
    return 'يمكنك بدء اختبار تحديد المستوى المجاني من الصفحة الرئيسية. الاختبار يشمل Grammar, Reading, و Listening.';
  } else if (lowerMessage.includes('دورة') || lowerMessage.includes('سعر')) {
    return 'لدينا 3 باقات: الأساسية (299 ريال)، المتقدمة (599 ريال)، و VIP (999 ريال). كل باقة تشمل محاضرات ونماذج تدريبية.';
  } else if (lowerMessage.includes('نتيجة') || lowerMessage.includes('درجة')) {
    return 'ستحصل على تقرير تفصيلي مع تحليل أدائك وخطة مذاكرة مخصصة بعد إتمام الاختبار.';
  } else if (lowerMessage.includes('وقت') || lowerMessage.includes('مدة')) {
    return 'مدة اختبار تحديد المستوى حوالي 45 دقيقة. يمكنك أخذ استراحة بين الأقسام.';
  } else if (lowerMessage.includes('تواصل') || lowerMessage.includes('دعم')) {
    return 'يمكنك التواصل معنا عبر: stepacademy438@gmail.com أو الهاتف: 0577607222';
  } else if (lowerMessage.includes('شكر') || lowerMessage.includes('ممتاز')) {
    return 'العفو! نحن هنا لمساعدتك دائماً. بالتوفيق! 🌟';
  } else {
    return 'شكراً لسؤالك! يمكنني مساعدتك في: الاختبار التجريبي، الدورات، الأسعار، النتائج، أو التواصل معنا. ما الذي تريد معرفته؟';
  }
}

// ========================================
// Intersection Observer for Animations
// ========================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements
document.querySelectorAll('.feature-card, .course-card, .testimonial-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ========================================
// Notifications System
// ========================================

function showNotification(title, body, url = '/') {
  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'step-academy-notification',
      requireInteraction: false
    });
    
    notification.onclick = () => {
      window.focus();
      window.location.href = url;
      notification.close();
    };
  } else {
    // Fallback: Show in-page notification
    showInPageNotification(title, body);
  }
}

function showInPageNotification(title, body) {
  const notification = document.createElement('div');
  notification.className = 'in-page-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-info-circle"></i>
      <div>
        <h4>${title}</h4>
        <p>${body}</p>
      </div>
      <button class="close-notification">&times;</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Close button
  notification.querySelector('.close-notification')?.addEventListener('click', () => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  });
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  setTimeout(() => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('✅ تم منح إذن الإشعارات');
      }
    });
  }, 5000);
}

// ========================================
// User Session Management
// ========================================

class UserSession {
  constructor() {
    this.userId = this.getUserId();
    this.sessionStart = Date.now();
    this.trackSession();
  }
  
  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
  
  trackSession() {
    // Track page views
    const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
    localStorage.setItem('pageViews', pageViews.toString());
    
    // Track last visit
    localStorage.setItem('lastVisit', new Date().toISOString());
    
    // Check if returning user
    const returningUser = pageViews > 1;
    if (returningUser) {
      console.log('👋 مرحباً بعودتك!');
    } else {
      console.log('🎉 مرحباً بك في STEP Academy!');
      // Show welcome message for new users
      setTimeout(() => {
        showNotification(
          'مرحباً بك! 🎉',
          'ابدأ اختبار تحديد المستوى المجاني الآن',
          '/captcha.html'
        );
      }, 3000);
    }
  }
  
  getStats() {
    return {
      userId: this.userId,
      pageViews: parseInt(localStorage.getItem('pageViews') || '0'),
      lastVisit: localStorage.getItem('lastVisit'),
      sessionDuration: Date.now() - this.sessionStart
    };
  }
}

// Initialize session
const userSession = new UserSession();

// ========================================
// Performance Monitoring
// ========================================

window.addEventListener('load', () => {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    const loadTime = perfData.loadEventEnd - perfData.fetchStart;
    
    console.log(`⚡ وقت تحميل الصفحة: ${(loadTime / 1000).toFixed(2)} ثانية`);
    
    // Log performance metrics
    if (loadTime > 3000) {
      console.warn('⚠️ الصفحة بطيئة - يحتاج تحسين');
    }
  }
});

// ========================================
// Offline Detection
// ========================================

window.addEventListener('online', () => {
  showNotification('متصل بالإنترنت', 'تم استعادة الاتصال بالإنترنت ✅');
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  showNotification('غير متصل', 'أنت الآن تستخدم النسخة المحفوظة 📱');
  document.body.classList.add('offline');
});

// ========================================
// Utility Functions
// ========================================

// Format numbers (Arabic)
function formatNumber(num) {
  return new Intl.NumberFormat('ar-SA').format(num);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(amount);
}

// Format date (Arabic)
function formatDate(date) {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showInPageNotification('تم النسخ!', 'تم نسخ النص إلى الحافظة');
  }).catch(err => {
    console.error('فشل النسخ:', err);
  });
}

// ========================================
// Console Styling
// ========================================

console.log(
  '%c STEP Academy 2026 ',
  'background: linear-gradient(90deg, #D4AF37, #FFD700); color: #0a0e27; font-size: 20px; font-weight: bold; padding: 10px;'
);
console.log(
  '%c منصة احترافية لاختبار STEP 🚀 ',
  'background: #1a237e; color: #FFD700; font-size: 14px; padding: 5px;'
);
console.log(
  '%c Built with ❤️ for Saudi Students ',
  'color: #D4AF37; font-size: 12px; font-style: italic;'
);

// ========================================
// Export for other modules
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showNotification,
    formatNumber,
    formatCurrency,
    formatDate,
    copyToClipboard,
    userSession
  };
}
