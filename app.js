/**
 * LOGICA DA APLICACAO (TAILWIND ULTRA-LUXURY) - JOTAGAAHBS BARBEARIA POR ASSINATURA
 * Desenvolvido em JS Puro (Vanilla) de alta performance e riqueza interativa.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     DATABASE / DADOS DA LOJA
     ========================================== */
  const SERVICES = [
    { id: 'srv1', name: 'BARBA', price: 35.00, duration: '30 min', desc: 'Barba.' },
    { id: 'srv2', name: 'CORTE', price: 40.00, duration: '40 min', desc: 'Corte.' },
    { id: 'srv3', name: 'CORTE & BARBA', price: 69.99, duration: '45 min', desc: 'Corte e barba.' },
    { id: 'srv4', name: 'DESIGN DE SOBRANCELHAS', price: 12.00, duration: '10 min', desc: 'Design de sobrancelha.' },
    { id: 'srv5', name: 'HIDRATAÇÃO PROFUNDA CAPILAR', price: 35.00, duration: '20 min', desc: 'Hidratação profunda capilar.' },
    { id: 'srv6', name: 'NEVOU PLATINADO', price: 179.97, duration: '120 min', desc: 'Nevou platinado.' },
    { id: 'srv7', name: 'LIMPEZA DE PELE MASCULINA', price: 35.00, duration: '45 min', desc: 'Limpeza de pele masculina.' },
    { id: 'srv8', name: 'BARBOTERAPIA PREMIUM', price: 45.00, duration: '45 min', desc: 'barboterapia Premium.' },
    { id: 'srv9', name: 'LUZES', price: 159.97, duration: '90 min', desc: 'Luzes.' },
    { id: 'srv10', name: 'CORTE + PIGMENTAÇÃO', price: 59.99, duration: '50 min', desc: 'Corte + pigmentação.' }
  ];

  const WHATSAPP_NUMBER = '5515996406909';

  // Carregar avaliações padrão caso não existam
  const DEFAULT_REVIEWS = [
    { author: 'Thiago Santos', score: 5, text: 'O melhor corte da região! A barboterapia premium é fantástica, atendimento impecável.', date: '25/05/2026' },
    { author: 'Marcos Vinícius', score: 5, text: 'Excelente custo-benefício. O plano por assinatura vale muito a pena, facilidade incrível.', date: '20/05/2026' },
    { author: 'Carlos Eduardo', score: 5, text: 'Fiz o Nevou Platinado e ficou perfeito. Sem ardência nenhuma, tom platinado no ponto. Recomendo demais!', date: '18/05/2026' },
    { author: 'Felipe Mendes', score: 5, text: 'Lugar muito aconchegante, com uma vibe vintage fantástica. O corte de cabelo é super detalhado.', date: '14/05/2026' },
    { author: 'Rodrigo Henrique', score: 5, text: 'Atendimento nota 10. O agendamento online é prático e o horário marcado é respeitado rigorosamente.', date: '10/05/2026' }
  ];

  /* ==========================================
     DATABASE / MÓDULO DE BANCO DE DADOS MODULAR
     ========================================== */
  const DB = {
    init() {
      if (!localStorage.getItem('barber_reviews')) {
        localStorage.setItem('barber_reviews', JSON.stringify(DEFAULT_REVIEWS));
      }
      if (!localStorage.getItem('barber_bookings')) {
        localStorage.setItem('barber_bookings', JSON.stringify([]));
      }
      if (!localStorage.getItem('barber_blocked_dates')) {
        localStorage.setItem('barber_blocked_dates', JSON.stringify([]));
      }
      if (!localStorage.getItem('jota_studio_config')) {
        localStorage.setItem('jota_studio_config', JSON.stringify({ status: 'auto', rating: 5.0 }));
      }
      
      // Inicialização do Administrador e Clientes no DB
      let clients = JSON.parse(localStorage.getItem('jota_clients')) || [];
      const adminExists = clients.some(c => c.email === 'admin@jotagaahbs.com.br');
      if (!adminExists) {
        clients.push({
          name: 'Jota Administrador',
          email: 'admin@jotagaahbs.com.br',
          phone: '(15) 996406909',
          password: 'jota2024',
          role: 'admin'
        });
        localStorage.setItem('jota_clients', JSON.stringify(clients));
      }
    },

    getClients() {
      return JSON.parse(localStorage.getItem('jota_clients')) || [];
    },

    saveClient(client) {
      const clients = this.getClients();
      const emailExists = clients.some(c => c.email === client.email);
      if (emailExists) return false;
      
      // 🔒 SEGURANÇA [VULN-3]: Whitelisting estrito de campos e mitigação de escalada de privilégios (CWE-915 / Lei 2)
      const newClient = {
        name: String(client.name),
        email: String(client.email),
        phone: String(client.phone),
        password: String(client.password),
        role: 'client', // Forçar estritamente 'client', impedindo bypass do console
        avatar: client.avatar ? String(client.avatar) : null
      };
      
      clients.push(newClient);
      localStorage.setItem('jota_clients', JSON.stringify(clients));
      return newClient;
    },

    authenticateUser(email, password) {
      const clients = this.getClients();
      const user = clients.find(c => c.email === email && c.password === password);
      return user || null;
    },

    getReviews() {
      return JSON.parse(localStorage.getItem('barber_reviews')) || [];
    },

    saveReview(review) {
      const reviews = this.getReviews();
      reviews.push(review);
      localStorage.setItem('barber_reviews', JSON.stringify(reviews));
      return reviews;
    },

    getBookings() {
      return JSON.parse(localStorage.getItem('barber_bookings')) || [];
    },

    saveBooking(booking) {
      const bookings = this.getBookings();
      bookings.push(booking);
      localStorage.setItem('barber_bookings', JSON.stringify(bookings));
      return bookings;
    },

    updateBookings(bookingsList) {
      localStorage.setItem('barber_bookings', JSON.stringify(bookingsList));
    },

    getBlockedDates() {
      return JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];
    },

    saveBlockedDate(dateStr) {
      const blocked = this.getBlockedDates();
      if (!blocked.includes(dateStr)) {
        blocked.push(dateStr);
        localStorage.setItem('barber_blocked_dates', JSON.stringify(blocked));
      }
      return blocked;
    },

    removeBlockedDate(dateStr) {
      let blocked = this.getBlockedDates();
      blocked = blocked.filter(d => d !== dateStr);
      localStorage.setItem('barber_blocked_dates', JSON.stringify(blocked));
      return blocked;
    },

    getStudioConfig() {
      return JSON.parse(localStorage.getItem('jota_studio_config')) || { status: 'auto', rating: 5.0 };
    },

    saveStudioConfig(config) {
      localStorage.setItem('jota_studio_config', JSON.stringify(config));
    }
  };

  // Inicializa o banco de dados
  DB.init();

  /* ==========================================
     ESTADO GLOBAL DA APLICACAO
     ========================================== */
  let appState = {
    currentScreen: 'home-screen',
    booking: {
      step: 1,
      selectedServices: [], // 🔒 SEGURANÇA [Lei 1]: Armazena múltiplos serviços selecionados
      selectedDate: null, 
      selectedTime: null, 
      clientName: '',
      clientPhone: ''
    },
    calendar: {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear()
    }
  };

  // Cliques no logotipo para ativação do painel secreto
  let logoClickCount = 0;
  let logoClickTimer = null;

  /* ==========================================
     ELEMENTOS DO DOM
     ========================================== */
  const screens = document.querySelectorAll('.app-screen');
  const navItems = document.querySelectorAll('.nav-item');
  const logoTrigger = document.getElementById('secret-admin-trigger');
  
  // Elementos do Home
  const homeBookingCta = document.getElementById('home-booking-cta');
  const homeViewServicesBtn = document.getElementById('home-view-services-btn');
  // Elementos do Booking
  const progressFill = document.getElementById('booking-progress-fill');
  const progressDots = document.querySelectorAll('.progress-step-dot');
  const stepPanes = document.querySelectorAll('.step-pane');
  const servicesListGrid = document.getElementById('booking-services-list');
  const calendarDaysGrid = document.getElementById('calendar-days-grid');
  const calendarCurrentMonthText = document.getElementById('calendar-current-month');
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');
  const timeSlotsGrid = document.getElementById('booking-time-slots');
  const inputBookingName = document.getElementById('booking-name');
  const inputBookingPhone = document.getElementById('booking-phone');
  
  // Recibo/Confirmação
  const receiptServiceName = document.getElementById('receipt-service-name');
  const receiptDate = document.getElementById('receipt-date');
  const receiptTime = document.getElementById('receipt-time');
  const receiptClientName = document.getElementById('receipt-client-name');
  const receiptPrice = document.getElementById('receipt-price');

  // Ações do Agendamento
  const btnBookingBack = document.getElementById('btn-booking-back');
  const btnBookingNext = document.getElementById('btn-booking-next');

  // Elementos de Reviews
  const reviewsListContainer = document.getElementById('reviews-list-container');
  const avgRatingValue = document.getElementById('avg-rating-value');
  const avgStarsRow = document.getElementById('avg-stars-row');
  const reviewsCountLabel = document.getElementById('reviews-count-label');
  const starsSelector = document.getElementById('stars-selector');
  const reviewAuthorNameInput = document.getElementById('review-author-name');
  const reviewCommentTextInput = document.getElementById('review-comment-text');
  const btnSubmitReview = document.getElementById('btn-submit-review');

  // Elementos do Toast
  const toastContainer = document.getElementById('toast-container-global');

  // ELEMENTOS DO MENU GAVETA (SIDE DRAWER)
  const menuDrawer = document.getElementById('menu-drawer');
  const menuDrawerOverlay = document.getElementById('menu-drawer-overlay');
  const btnHamburgerMenu = document.getElementById('btn-hamburger-menu');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const drawerMenuOptions = document.getElementById('drawer-menu-options');
  
  // Formulários
  const formClientLogin = document.getElementById('form-client-login');
  const formClientRegister = document.getElementById('form-client-register');
  
  // Links de navegação interna auth
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');

  // Inputs Cliente/Admin Login Unificado
  const clientLoginEmailInput = document.getElementById('client-login-email');
  const clientLoginPasswordInput = document.getElementById('client-login-password');
  const btnExecuteClientLogin = document.getElementById('btn-execute-client-login');

  // Inputs Cliente Cadastro
  const clientRegNameInput = document.getElementById('client-reg-name');
  const clientRegEmailInput = document.getElementById('client-reg-email');
  const clientRegPhoneInput = document.getElementById('client-reg-phone');
  const clientRegPasswordInput = document.getElementById('client-reg-password');
  const btnExecuteClientRegister = document.getElementById('btn-execute-client-register');

  // Elementos do Perfil do Cliente
  const profileClientDisplayName = document.getElementById('profile-client-display-name');
  const profileClientDisplayEmail = document.getElementById('profile-client-display-email');
  const profileAvatarInitials = document.getElementById('profile-avatar-initials');
  const clientPersonalBookingsList = document.getElementById('client-personal-bookings-list');
  const btnExecuteClientLogout = document.getElementById('btn-execute-client-logout');

  // Elementos do Dashboard Admin
  const adminDashboard = document.getElementById('admin-dashboard');
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminPanes = document.querySelectorAll('.admin-pane');
  const adminBookingsList = document.getElementById('admin-bookings-list');
  const adminBookingsListCompleted = document.getElementById('admin-bookings-list-completed');
  const blockDateInput = document.getElementById('block-date-input');
  const btnBlockDate = document.getElementById('btn-block-date');
  const adminBlockedDatesList = document.getElementById('admin-blocked-dates-list');
  const btnLogoutAdmin = document.getElementById('btn-logout-admin');

  /* ==========================================
     MÁSCARA DE TELEFONE BRASILEIRA (DDI 55 + 11 DÍGITOS)
     ========================================== */
  function applyPhoneMask(input) {
    if (!input) return;
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, "");
      
      if (value.startsWith("55") && value.length > 11) {
        value = value.substring(2);
      }
      
      value = value.substring(0, 11);

      let formatted = "";
      if (value.length > 0) {
        formatted += "(" + value.substring(0, 2);
      }
      if (value.length > 2) {
        formatted += ") " + value.substring(2, 7);
      }
      if (value.length > 7) {
        formatted += "-" + value.substring(7, 11);
      }
      
      e.target.value = formatted;
    });
  }

  // Inicializa as máscaras nos campos de celular
  applyPhoneMask(clientRegPhoneInput);
  applyPhoneMask(inputBookingPhone);

  // 🔒 SEGURANÇA [Lei 15]: Auto-preenchimento do e-mail salvo (Lembrar Login)
  const rememberedEmail = localStorage.getItem('remembered_email');
  const rememberCheckbox = document.getElementById('client-login-remember');
  if (rememberedEmail && clientLoginEmailInput) {
    clientLoginEmailInput.value = rememberedEmail;
    if (rememberCheckbox) {
      rememberCheckbox.checked = true;
    }
  }

  /* ==========================================
     FUNÇÕES DE ACESSO A SESSÕES DO LOCALSTORAGE
     ========================================== */
  
  function getLoggedClient() {
    return JSON.parse(localStorage.getItem('jota_client_session')) || null;
  }

  function setLoggedClient(clientObj) {
    if (clientObj) {
      localStorage.setItem('jota_client_session', JSON.stringify(clientObj));
    } else {
      localStorage.removeItem('jota_client_session');
    }
    updateNavProfileBar();
  }

  function isAdminAuthenticated() {
    const session = JSON.parse(localStorage.getItem('jota_admin_session'));
    return session && session.authenticated === true;
  }

  function setAdminAuthenticated(authenticated) {
    if (authenticated) {
      localStorage.setItem('jota_admin_session', JSON.stringify({ authenticated: true }));
    } else {
      localStorage.removeItem('jota_admin_session');
    }
  }

  function closeDrawer() {
    menuDrawer.classList.remove('active');
    menuDrawerOverlay.classList.remove('active');
  }

  function openDrawer() {
    renderDrawerMenu();
    menuDrawer.classList.add('active');
    menuDrawerOverlay.classList.add('active');
  }

  function updateNavProfileBar() {
    renderDrawerMenu();
  }

  function renderDrawerMenu() {
    if (!drawerMenuOptions) return;
    
    const client = getLoggedClient();
    const admin = isAdminAuthenticated();
    
    drawerMenuOptions.innerHTML = '';
    
    if (admin) {
      // Menu Admin
      drawerMenuOptions.innerHTML = `
        <div class="px-4 py-3 bg-barber-blue/10 border border-barber-blue/20 rounded-xl mb-2 flex items-center gap-3">
          <i class="fa-solid fa-user-shield text-barber-blue text-lg"></i>
          <div>
            <p class="text-[0.65rem] text-zinc-500 uppercase tracking-wider font-barlow font-bold">Autenticado</p>
            <p class="text-xs text-text-warm font-cinzel font-semibold">Administrador</p>
          </div>
        </div>
        
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="admin-screen">
          <i class="fa-solid fa-chart-line text-zinc-400 w-5 text-center"></i> Painel Admin
        </a>
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="home-screen">
          <i class="fa-solid fa-house text-zinc-400 w-5 text-center"></i> Início
        </a>
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="reviews-screen">
          <i class="fa-solid fa-star-half-stroke text-zinc-400 w-5 text-center"></i> Avaliações
        </a>
        
        <div class="flex-1"></div>
        
        <button id="btn-drawer-admin-logout" class="w-full mt-auto py-3 bg-zinc-950/60 border border-white/10 text-barber-red hover:bg-barber-red/10 rounded-xl font-barlow font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
          <i class="fa-solid fa-right-from-bracket"></i> Sair do Painel
        </button>
      `;
      
      document.getElementById('btn-drawer-admin-logout').addEventListener('click', () => {
        closeDrawer();
        btnLogoutAdmin.click();
      });
    } else if (client) {
      // Menu Cliente Logado
      const firstName = client.name.split(' ')[0];
      const names = client.name.split(' ');
      const initials = names.length > 1 
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
        
      const avatarHtml = client.avatar 
        ? `<img src="${client.avatar}" class="w-8 h-8 rounded-full object-cover border border-text-warm shadow-md flex-shrink-0" alt="Avatar">`
        : `<div class="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-200 via-neutral-400 to-zinc-200 text-black flex justify-center items-center text-xs font-cinzel font-bold border border-text-warm shadow-md flex-shrink-0">${initials}</div>`;

      drawerMenuOptions.innerHTML = `
        <div class="px-4 py-3 bg-zinc-950/60 border border-white/5 rounded-xl mb-2 flex items-center gap-3">
          ${avatarHtml}
          <div>
            <p class="text-[0.65rem] text-zinc-500 uppercase tracking-wider font-barlow font-bold">Olá,</p>
            <p class="text-xs text-text-warm font-cinzel font-semibold">${firstName}</p>
          </div>
        </div>
        
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="booking-screen">
          <i class="fa-solid fa-calendar-days text-zinc-400 w-5 text-center"></i> Reservar Horário
        </a>
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="profile-screen">
          <i class="fa-solid fa-user text-zinc-400 w-5 text-center"></i> Meu Perfil
        </a>
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="home-screen">
          <i class="fa-solid fa-house text-zinc-400 w-5 text-center"></i> Início
        </a>
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="reviews-screen">
          <i class="fa-solid fa-star-half-stroke text-zinc-400 w-5 text-center"></i> Avaliar Barbearia
        </a>
        
        <div class="flex-1"></div>
        
        <button id="btn-drawer-client-logout" class="w-full mt-auto py-3 bg-zinc-950/60 border border-white/10 text-zinc-400 hover:text-barber-red hover:bg-barber-red/10 rounded-xl font-barlow font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
          <i class="fa-solid fa-right-from-bracket"></i> Sair da Conta
        </button>
      `;
      
      document.getElementById('btn-drawer-client-logout').addEventListener('click', () => {
        closeDrawer();
        btnExecuteClientLogout.click();
      });
    } else {
      // Menu Deslogado
      drawerMenuOptions.innerHTML = `
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="home-screen">
          <i class="fa-solid fa-house text-zinc-400 w-5 text-center"></i> Início
        </a>
        <a href="#" class="drawer-nav-item flex items-center gap-3 px-4 py-3 border border-transparent rounded-xl text-sm font-barlow font-bold uppercase tracking-wider text-text-warm hover:bg-white/5 hover:border-white/10 transition-all" data-screen="reviews-screen">
          <i class="fa-solid fa-star-half-stroke text-zinc-400 w-5 text-center"></i> Avaliações
        </a>
        
        <div class="flex-1"></div>
        
        <div class="flex flex-col gap-3 mt-auto">
          <button id="btn-drawer-login" class="w-full py-3 bg-gradient-to-r from-barber-red to-red-900 border border-white/10 text-white hover:brightness-110 rounded-xl font-barlow font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-950/30">
            <i class="fa-solid fa-right-to-bracket"></i> Entrar na Conta
          </button>
          <button id="btn-drawer-register" class="w-full py-3 bg-zinc-950/60 border border-white/10 text-gold-accent hover:bg-zinc-900 rounded-xl font-barlow font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg">
            <i class="fa-solid fa-user-plus"></i> Cadastrar-se
          </button>
        </div>
      `;
      
      document.getElementById('btn-drawer-login').addEventListener('click', () => {
        closeDrawer();
        navigateTo('login-screen');
        setAuthMode('client');
      });
      
      document.getElementById('btn-drawer-register').addEventListener('click', () => {
        closeDrawer();
        navigateTo('login-screen');
        setAuthMode('client');
        linkToRegister.click();
      });
    }
    
    // Configurar navegação para os itens de menu normais do drawer
    drawerMenuOptions.querySelectorAll('.drawer-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetScreen = item.getAttribute('data-screen');
        closeDrawer();
        navigateTo(targetScreen);
      });
    });
  }

  // Vincular eventos do Drawer
  btnHamburgerMenu.addEventListener('click', openDrawer);
  btnCloseDrawer.addEventListener('click', closeDrawer);
  menuDrawerOverlay.addEventListener('click', closeDrawer);

  // Inicializar o estado visual inicial
  updateNavProfileBar();

  /* ==========================================
     FUNÇÕES AUXILIARES / TOAST / FORMATADORES
     ========================================= */
  
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    // Adaptar Toasts para o Tailwind de forma linda
    const bgToast = type === 'success' ? 'bg-zinc-900 border-gold-accent/40' : 'bg-zinc-900 border-barber-red/40';
    const indicatorColor = type === 'success' ? 'bg-gold-accent' : 'bg-barber-red';
    const iconClass = type === 'success' ? 'fa-circle-check text-gold-accent' : 'fa-triangle-exclamation text-barber-red';

    toast.className = `flex items-center gap-3 px-4 py-3 border rounded-xl shadow-2xl ${bgToast} text-text-warm text-sm animate-[toastSlideIn_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards] pointer-events-auto relative overflow-hidden`;
    toast.innerHTML = `
      <div class="absolute left-0 top-0 bottom-0 w-1.5 ${indicatorColor}"></div>
      <i class="fa-solid ${iconClass} text-lg ml-1"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-[-10px]', 'transition-all', 'duration-300');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 4000);
  }

  function formatPrice(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(date) {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // 🔒 SEGURANÇA [VULN-1]: Função de escape de caracteres HTML para mitigar Stored XSS (CWE-79 / Lei 10)
  function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#039;';
        default: return m;
      }
    });
  }

  function updateStudioHomeDisplay() {
    const config = DB.getStudioConfig();
    
    // 1. Atualizar Nota de Avaliação Minimalista
    const ratingDisplay = document.getElementById('display-rating-value');
    if (ratingDisplay) {
      ratingDisplay.textContent = config.rating.toFixed(1);
    }
    
    // 2. Atualizar Status de Funcionamento Minimalista
    const statusDisplay = document.getElementById('display-status-value');
    if (statusDisplay) {
      if (config.status === 'open') {
        statusDisplay.textContent = 'Aberto Agora';
        statusDisplay.className = 'text-xs font-semibold text-green-500';
      } else if (config.status === 'closed') {
        statusDisplay.textContent = 'Fechado Agora';
        statusDisplay.className = 'text-xs font-semibold text-barber-red';
      } else {
        // Status Automático
        const today = new Date().getDay();
        if (today === 0 || today === 1) {
          statusDisplay.textContent = 'Fechado Agora';
          statusDisplay.className = 'text-xs font-semibold text-barber-red';
        } else {
          statusDisplay.textContent = 'Aberto Agora';
          statusDisplay.className = 'text-xs font-semibold text-green-500';
        }
      }
    }
  }
  updateStudioHomeDisplay();

  /* ==========================================
     ROTEADOR SPA COM COBERTURA DE SEGURANÇA
     ========================================== */
  function navigateTo(screenId) {
    const client = getLoggedClient();
    const admin = isAdminAuthenticated();

    // 1. Proteger Rota de Agendamento
    if (screenId === 'booking-screen') {
      if (!client) {
        showToast('Por favor, crie uma conta para realizar o agendamento.', 'warning');
        navigateTo('login-screen');
        showAuthForm('register');
        return;
      }
      
      const config = DB.getStudioConfig();
      if (config && config.status === 'closed') {
        showToast('Aviso: A barbearia está fechada no momento, mas você pode agendar seu horário normalmente!', 'warning');
      }
    }

    // 2. Redirecionamento inteligente de login
    if (screenId === 'login-screen') {
      if (admin) {
        navigateTo('admin-screen');
        return;
      } else if (client) {
        navigateTo('profile-screen');
        return;
      }
    }

    // 3. Perfil protegido
    if (screenId === 'profile-screen' && !client) {
      navigateTo('login-screen');
      return;
    }

    // 4. Admin protegido
    if (screenId === 'admin-screen' && !admin) {
      navigateTo('login-screen');
      setAuthMode('admin');
      return;
    }

    function executeScreenSwitch() {
      // Gerenciador Visual SPA
      screens.forEach(screen => {
        if (screen.id === screenId) {
          screen.classList.add('active');
          
          // Re-dispara as animações de reveal do Tailwind
          screen.querySelectorAll('.reveal-item-tw').forEach(item => {
            item.style.animation = 'none';
            item.offsetHeight; /* trigger reflow */
            item.style.animation = '';
          });
        } else {
          screen.classList.remove('active');
        }
      });

      // Atualiza Bottom Nav
      navItems.forEach(item => {
        const target = item.getAttribute('data-screen');
        if (target === 'login-screen' && (screenId === 'login-screen' || screenId === 'profile-screen' || screenId === 'admin-screen')) {
          item.classList.add('active');
        } else if (target === screenId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Gerenciador de visibilidade e reatividade (Floating Dock Nav & WhatsApp Pop-Up)
      const bottomNav = document.getElementById('app-bottom-nav');
      const whatsappBtn = document.getElementById('whatsapp-float-btn');
      if (bottomNav && whatsappBtn) {
        if (screenId === 'booking-screen' || screenId === 'login-screen' || screenId === 'profile-screen' || screenId === 'admin-screen') {
          bottomNav.classList.add('nav-hidden');
          whatsappBtn.classList.add('nav-hidden');
        } else {
          bottomNav.classList.remove('nav-hidden');
          whatsappBtn.classList.remove('nav-hidden');
        }
      }
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        executeScreenSwitch();
      });
    } else {
      executeScreenSwitch();
    }

    appState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargas de Telas
    if (screenId === 'booking-screen') {
      if (client) {
        inputBookingName.value = client.name;
        inputBookingPhone.value = client.phone;
      }
      renderServicesList();
      updateBookingFlowUI();
    } else if (screenId === 'reviews-screen') {
      if (client) {
        reviewAuthorNameInput.value = client.name;
      }
      renderReviews();
    } else if (screenId === 'profile-screen') {
      renderClientProfile();
    } else if (screenId === 'admin-screen') {
      renderAdminDashboard();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const screenTarget = item.getAttribute('data-screen');
      
      if (screenTarget === 'login-screen') {
        const client = getLoggedClient();
        const admin = isAdminAuthenticated();
        if (admin) {
          navigateTo('admin-screen');
        } else if (client) {
          navigateTo('profile-screen');
        } else {
          navigateTo('login-screen');
        }
      } else {
        navigateTo(screenTarget);
      }
    });
  });

  // Home CTAs
  homeBookingCta.addEventListener('click', () => navigateTo('booking-screen'));
  homeViewServicesBtn.addEventListener('click', () => {
    navigateTo('booking-screen');
    appState.booking.step = 1;
    updateBookingFlowUI();
  });

  /* ==========================================
     SISTEMA DE AUTENTICAÇÃO UNIFICADA E CADASTRO
     ========================================== */
  
  function showAuthForm(formType) {
    if (formType === 'login') {
      formClientLogin.classList.remove('hidden');
      formClientRegister.classList.add('hidden');
    } else if (formType === 'register') {
      formClientLogin.classList.add('hidden');
      formClientRegister.classList.remove('hidden');
    }
  }

  // Inicialização padrão do formulário
  showAuthForm('login');

  linkToRegister.addEventListener('click', () => {
    showAuthForm('register');
  });

  linkToLogin.addEventListener('click', () => {
    showAuthForm('login');
  });

  // CADASTRO DE CLIENTE
  btnExecuteClientRegister.addEventListener('click', (e) => {
    e.preventDefault();
    const name = clientRegNameInput.value.trim();
    const email = clientRegEmailInput.value.trim().toLowerCase();
    const phone = clientRegPhoneInput.value.trim();
    const password = clientRegPasswordInput.value;

    if (!name || name.length < 3) {
      showToast('Preencha seu nome completo.', 'error');
      clientRegNameInput.focus();
      return;
    }
    if (!email || !email.includes('@')) {
      showToast('Insira um e-mail válido.', 'error');
      clientRegEmailInput.focus();
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 11) {
      showToast('Insira um celular válido com DDD e 9 dígitos (total de 11 dígitos, Ex: (15) 99999-9999).', 'error');
      clientRegPhoneInput.focus();
      return;
    }
    if (!password || password.length < 4) {
      showToast('A senha deve ter no mínimo 4 caracteres.', 'error');
      clientRegPasswordInput.focus();
      return;
    }

    const newClient = DB.saveClient({ name, email, phone, password, role: 'client' });

    if (!newClient) {
      showToast('E-mail já cadastrado.', 'error');
      clientRegEmailInput.focus();
      return;
    }

    setLoggedClient(newClient);
    showToast('Cadastro realizado com sucesso! Bem-vindo.', 'success');

    clientRegNameInput.value = '';
    clientRegEmailInput.value = '';
    clientRegPhoneInput.value = '';
    clientRegPasswordInput.value = '';

    navigateTo('profile-screen');
  });

  // LOGIN UNIFICADO (CLIENTES E BARBEIRO/ADMIN)
  btnExecuteClientLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const email = clientLoginEmailInput.value.trim().toLowerCase();
    const password = clientLoginPasswordInput.value;
    const rememberCheckbox = document.getElementById('client-login-remember');

    if (!email || !password) {
      showToast('Preencha todos os campos.', 'error');
      return;
    }

    const user = DB.authenticateUser(email, password);

    if (user) {
      // 🔒 SEGURANÇA [Lei 15]: Persistir e-mail caso 'Lembrar E-mail' esteja ativado
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      if (user.role === 'admin') {
        // Fluxo de Login do Barbeiro / Admin
        setAdminAuthenticated(true);
        updateNavProfileBar();
        showToast('Painel administrativo autenticado com sucesso!', 'success');
        
        clientLoginEmailInput.value = '';
        clientLoginPasswordInput.value = '';
        
        navigateTo('admin-screen');
      } else {
        // Fluxo de Login do Cliente
        setLoggedClient(user);
        showToast(`Bem-vindo, ${user.name.split(' ')[0]}!`, 'success');
        
        clientLoginEmailInput.value = '';
        clientLoginPasswordInput.value = '';
        
        navigateTo('profile-screen');
      }
    } else {
      showToast('E-mail ou senha incorretos.', 'error');
    }
  });

  // LOGOUT DE CLIENTE
  btnExecuteClientLogout.addEventListener('click', () => {
    setLoggedClient(null);
    showToast('Sessão encerrada com sucesso.');
    navigateTo('home-screen');
  });

  // LOGOUT DE ADMINISTRADOR
  btnLogoutAdmin.addEventListener('click', () => {
    setAdminAuthenticated(false);
    updateNavProfileBar();
    showToast('Sessão administrativa encerrada.');
    navigateTo('home-screen');
  });

  // GATILHO SECRETO PARA A TELA DE LOGIN
  logoTrigger.addEventListener('click', () => {
    logoClickCount++;
    
    if (logoClickCount > 1 && logoClickCount < 5) {
      showToast(`Acesso de segurança... (${logoClickCount}/5)`, 'warning');
    }

    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => {
      logoClickCount = 0;
    }, 3000);

    if (logoClickCount === 5) {
      logoClickCount = 0;
      showToast('Acesso administrativo ativado. Faça login com seus dados de Barbeiro.', 'success');
      navigateTo('login-screen');
      showAuthForm('login');
    }
  });


  /* ==========================================
     TELA DE PERFIL DO CLIENTE (HISTÓRICO DINÂMICO)
     ========================================== */
  
  function renderClientProfile() {
    const client = getLoggedClient();
    if (!client) return;

    profileClientDisplayName.textContent = client.name;
    profileClientDisplayEmail.textContent = client.email;
    
    const profileAvatarText = document.getElementById('profile-avatar-text');
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    
    if (client.avatar) {
      if (profileAvatarText) profileAvatarText.classList.add('hidden');
      if (profileAvatarImg) {
        profileAvatarImg.src = client.avatar;
        profileAvatarImg.classList.remove('hidden');
      }
    } else {
      const names = client.name.split(' ');
      const initials = names.length > 1 
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].substring(0, 2).toUpperCase();
      
      if (profileAvatarText) {
        profileAvatarText.textContent = initials;
        profileAvatarText.classList.remove('hidden');
      }
      if (profileAvatarImg) profileAvatarImg.classList.add('hidden');
    }

    clientPersonalBookingsList.innerHTML = '';
    const bookings = DB.getBookings();
    const personalBookings = bookings.filter(b => b.clientEmail === client.email || b.clientPhone === client.phone);

    if (personalBookings.length === 0) {
      clientPersonalBookingsList.innerHTML = '<p class="text-center text-xs text-zinc-500 py-6 reveal-item-tw">Você não possui horários reservados.</p>';
      return;
    }

    personalBookings.sort((a,b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      if (dateA !== dateB) return dateB.localeCompare(dateA); 
      return b.time.localeCompare(a.time);
    }).forEach((bk, index) => {
      const item = document.createElement('article');
      const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
      
      // Aplicar estilo de luxo com Tailwind e glassmorphism
      item.className = `client-booking-item reveal-item-tw flex justify-between items-center p-4 border border-white/5 rounded-xl bg-zinc-950/40 backdrop-blur-sm transition-all duration-300 hover:border-white/15 ${delayClass}`;
      item.innerHTML = `
        <div class="client-booking-item-details space-y-1">
          <h4 class="font-cinzel text-xs font-semibold tracking-wider text-text-warm uppercase">${escapeHTML(bk.serviceName)}</h4>
          <p class="text-[0.75rem] text-zinc-400 font-light flex items-center gap-1.5"><i class="fa-regular fa-calendar text-gold-accent"></i> ${escapeHTML(bk.date)} às ${escapeHTML(bk.time)}</p>
          <p class="text-[0.68rem] text-zinc-500 font-light flex items-center gap-1.5"><i class="fa-regular fa-clock"></i> Duração: ${escapeHTML(bk.duration)}</p>
        </div>
        <span class="client-booking-price font-barlow text-lg text-gold-accent font-bold">${formatPrice(bk.price)}</span>
      `;
      clientPersonalBookingsList.appendChild(item);
    });
  }


  /* ==========================================
     FLUXO DE AGENDAMENTO (5 PASSOS)
     ========================================== */

  // 1. Serviços com reveal staggered (multi-seleção de até 3 serviços)
  function renderServicesList() {
    servicesListGrid.innerHTML = '';
    SERVICES.forEach((service, index) => {
      const card = document.createElement('article');
      const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
      
      const isSelected = appState.booking.selectedServices.some(s => s.id === service.id);
      
      // Card com bordas cromadas, glassmorphism e cores do tema reativas
      const selectedClasses = isSelected 
        ? 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/30' 
        : 'border-white/10 bg-zinc-950/60 hover:border-white/20';

      card.className = `booking-service-card reveal-item-tw cursor-pointer flex justify-between items-center p-4 border rounded-xl backdrop-blur-sm transition-all duration-300 active:scale-[0.97] ${selectedClasses} ${delayClass}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="service-item-info space-y-1 pr-4">
          <h4 class="font-cinzel text-xs font-semibold tracking-wider text-text-warm uppercase">${escapeHTML(service.name)}</h4>
          <p class="text-[0.74rem] text-zinc-400 font-light leading-snug">${escapeHTML(service.desc)}</p>
          <span class="text-[0.68rem] text-gold-accent/80 font-medium block pt-1"><i class="fa-regular fa-clock mr-1"></i> Duração: ${escapeHTML(service.duration)}</span>
        </div>
        <span class="service-item-price font-barlow text-lg text-gold-accent font-bold flex-shrink-0">${formatPrice(service.price)}</span>
      `;
      
      card.addEventListener('click', () => {
        const selectedIdx = appState.booking.selectedServices.findIndex(s => s.id === service.id);
        
        if (selectedIdx > -1) {
          // Se já selecionado, remove
          appState.booking.selectedServices.splice(selectedIdx, 1);
          card.className = card.className.replace('border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/30', 'border-white/10 bg-zinc-950/60 hover:border-white/20');
        } else {
          // Se não selecionado, adiciona verificando limite de 3
          if (appState.booking.selectedServices.length >= 3) {
            showToast('Você pode selecionar no máximo 3 serviços simultâneos.', 'warning');
            return;
          }
          appState.booking.selectedServices.push(service);
          card.className = card.className.replace('border-white/10 bg-zinc-950/60 hover:border-white/20', 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/30');
        }
      });

      servicesListGrid.appendChild(card);
    });
  }

  // 2. Calendário
  function renderCalendar() {
    calendarDaysGrid.innerHTML = '';
    
    const year = appState.calendar.currentYear;
    const month = appState.calendar.currentMonth;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    calendarCurrentMonthText.textContent = `${monthNames[month]} ${year}`;

    const blockedDates = DB.getBlockedDates();
    const todayStr = new Date().toDateString();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'w-9 h-9 opacity-0 pointer-events-none';
      calendarDaysGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay; day++) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement('div');
      
      const cellDateStr = cellDate.toDateString();
      const cellDayOfWeek = cellDate.getDay();
      const isoDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const isPast = new Date(year, month, day, 23, 59, 59) < new Date();
      const isClosed = cellDayOfWeek === 0 || cellDayOfWeek === 1;
      const isBlocked = blockedDates.includes(isoDateStr);
      const isSelected = appState.booking.selectedDate && appState.booking.selectedDate.toDateString() === cellDateStr;

      let classes = "w-9 h-9 rounded-full flex justify-center items-center text-xs transition-all duration-300 font-sans font-semibold mx-auto relative ";

      if (isPast || isClosed || isBlocked) {
        classes += "text-zinc-700/40 cursor-not-allowed pointer-events-none ";
      } else {
        if (isSelected) {
          classes += "bg-barber-red text-white font-extrabold shadow-[0_0_20px_rgba(196,30,58,0.65)] scale-105 cursor-pointer ";
        } else {
          classes += "text-zinc-200 cursor-pointer hover:bg-white/10 hover:text-white active:scale-90 ";
          if (cellDateStr === todayStr) {
            classes += "text-gold-accent font-bold after:content-[''] after:absolute after:bottom-[3px] after:w-1 after:h-1 after:bg-gold-accent after:rounded-full ";
          }
        }

        cell.addEventListener('click', () => {
          appState.booking.selectedDate = cellDate;
          appState.booking.selectedTime = null;
          renderCalendar();
        });
      }

      cell.className = classes;
      cell.textContent = day;
      calendarDaysGrid.appendChild(cell);
    }
  }

  prevMonthBtn.addEventListener('click', () => {
    const realDate = new Date();
    if (appState.calendar.currentYear === realDate.getFullYear() && appState.calendar.currentMonth === realDate.getMonth()) {
      showToast('Agendamentos apenas no presente/futuro.', 'error');
      return;
    }
    
    appState.calendar.currentMonth--;
    if (appState.calendar.currentMonth < 0) {
      appState.calendar.currentMonth = 11;
      appState.calendar.currentYear--;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    appState.calendar.currentMonth++;
    if (appState.calendar.currentMonth > 11) {
      appState.calendar.currentMonth = 0;
      appState.calendar.currentYear++;
    }
    renderCalendar();
  });

  const btnCalendarReset = document.getElementById('btn-calendar-reset');
  const btnCalendarDone = document.getElementById('btn-calendar-done');

  if (btnCalendarReset) {
    btnCalendarReset.addEventListener('click', () => {
      appState.booking.selectedDate = null;
      appState.booking.selectedTime = null;
      renderCalendar();
      showToast('Seleção de data limpa.', 'warning');
    });
  }

  if (btnCalendarDone) {
    btnCalendarDone.addEventListener('click', () => {
      if (!appState.booking.selectedDate) {
        showToast('Selecione uma data para avançar.', 'error');
        return;
      }
      appState.booking.step = 3;
      updateBookingFlowUI();
    });
  }

  // 3. Horários de 30 em 30 minutos, das 08:00 até as 19:30 (ou 18:30 aos sábados)
  function renderTimeSlots() {
    timeSlotsGrid.innerHTML = '';
    
    if (!appState.booking.selectedDate) return;

    const dayOfWeek = appState.booking.selectedDate.getDay();
    const isSaturday = dayOfWeek === 6;
    let slots = [];
    
    const startHour = 8;
    const endHour = isSaturday ? 18 : 19;
    const endMinute = 30;

    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      if (hour < endHour || (hour === endHour && endMinute >= 30)) {
        slots.push(`${String(hour).padStart(2, '0')}:30`);
      }
    }

    const bookings = DB.getBookings();
    const selectedDateFormatted = formatDate(appState.booking.selectedDate);
    const occupiedTimes = bookings
      .filter(b => b.date === selectedDateFormatted)
      .map(b => b.time);

    slots.forEach((time, index) => {
      const btn = document.createElement('button');
      const delayClass = index < 6 ? `delay-${Math.floor(index/2) + 1}` : 'delay-3';
      
      const isSelected = appState.booking.selectedTime === time;
      const isOccupied = occupiedTimes.includes(time);
      
      // 🔒 SEGURANÇA [Lei 1]: Verificação estrita de horários que já passaram no dia de hoje
      const isToday = appState.booking.selectedDate.toDateString() === new Date().toDateString();
      const now = new Date();
      const currentMinutesToday = now.getHours() * 60 + now.getMinutes();
      const [slotH, slotM] = time.split(':').map(Number);
      const slotMinutesToday = slotH * 60 + slotM;
      const isPastSlot = isToday && slotMinutesToday <= currentMinutesToday;

      let btnClasses = `time-slot-btn reveal-item-tw text-center py-2.5 rounded-lg border font-barlow tracking-wider font-bold transition-all duration-300 text-sm ${delayClass} `;

      if (isOccupied || isPastSlot) {
        btnClasses += "border-white/5 bg-zinc-950/20 text-white/10 cursor-not-allowed line-through ";
        btn.disabled = true;
      } else {
        btnClasses += isSelected 
          ? "bg-barber-blue border-white text-white shadow-[0_0_15px_rgba(27,58,140,0.5)] active:scale-95 "
          : "border-white/10 bg-zinc-950/60 hover:border-white/20 active:scale-95 text-text-warm ";
        
        btn.addEventListener('click', () => {
          appState.booking.selectedTime = time;
          document.querySelectorAll('.time-slot-btn').forEach(b => {
            b.className = b.className.replace('bg-barber-blue border-white text-white shadow-[0_0_15px_rgba(27,58,140,0.5)]', 'border-white/10 bg-zinc-950/60 text-text-warm');
          });
          btn.className = btn.className.replace('border-white/10 bg-zinc-950/60 text-text-warm', 'bg-barber-blue border-white text-white shadow-[0_0_15px_rgba(27,58,140,0.5)]');
          
          setTimeout(() => {
            appState.booking.step = 4;
            updateBookingFlowUI();
          }, 300);
        });
      }

      btn.className = btnClasses;
      btn.textContent = time;
      timeSlotsGrid.appendChild(btn);
    });

    if (timeSlotsGrid.children.length === 0) {
      timeSlotsGrid.innerHTML = '<p class="text-center text-xs text-zinc-500 py-6 reveal-item-tw" style="grid-column: 1/-1;">Sem horários livres para este dia.</p>';
    }
  }

  // 4. Confirmação (Multi-serviço com acúmulo de tempo e valor total)
  function renderConfirmationReceipt() {
    if (appState.booking.selectedServices.length === 0 || !appState.booking.selectedDate || !appState.booking.selectedTime) return;

    const names = appState.booking.selectedServices.map(s => s.name).join(' + ');
    const totalPrice = appState.booking.selectedServices.reduce((sum, s) => sum + s.price, 0);
    
    // Calcula a duração total
    let totalMinutes = 0;
    appState.booking.selectedServices.forEach(s => {
      const minutes = parseInt(s.duration.replace(/\D/g, ''));
      if (!isNaN(minutes)) {
        totalMinutes += minutes;
      }
    });
    
    const durationFormatted = totalMinutes >= 60 
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60} min` 
      : `${totalMinutes} min`;

    receiptServiceName.textContent = names;
    receiptDate.textContent = formatDate(appState.booking.selectedDate);
    receiptTime.textContent = `${appState.booking.selectedTime} (${durationFormatted})`;
    receiptClientName.textContent = appState.booking.clientName;
    receiptPrice.textContent = formatPrice(totalPrice);
  }

  function updateBookingFlowUI() {
    const step = appState.booking.step;

    const percentage = ((step - 1) / 4) * 100;
    progressFill.style.width = `${percentage}%`;

    progressDots.forEach(dot => {
      const dotStep = parseInt(dot.getAttribute('data-step'));
      if (dotStep < step) {
        dot.className = 'progress-step-dot completed z-10 w-7 h-7 rounded-full bg-gold-accent border-2 border-gold-accent flex justify-center items-center font-barlow text-[0.8rem] text-black font-extrabold shadow-[0_0_10px_rgba(201,151,58,0.35)]';
        dot.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else if (dotStep === step) {
        dot.className = 'progress-step-dot active z-10 w-7 h-7 rounded-full bg-studio-black border-2 border-barber-red flex justify-center items-center font-barlow text-[0.8rem] text-text-warm font-extrabold shadow-[0_0_15px_rgba(196,30,58,0.5)]';
        dot.textContent = dotStep;
      } else {
        dot.className = 'progress-step-dot z-10 w-7 h-7 rounded-full bg-studio-card border-2 border-white/10 flex justify-center items-center font-barlow text-[0.8rem] text-zinc-500';
        dot.textContent = dotStep;
      }
    });

    stepPanes.forEach(pane => {
      if (pane.id === `step-pane-${step}`) {
        pane.classList.add('active');
        pane.querySelectorAll('.reveal-item-tw').forEach(item => {
          item.style.animation = 'none';
          item.offsetHeight;
          item.style.animation = '';
        });
      } else {
        pane.classList.remove('active');
      }
    });

    if (step === 1) {
      btnBookingBack.classList.add('d-none');
    } else {
      btnBookingBack.classList.remove('d-none');
    }

    if (step === 5) {
      btnBookingNext.innerHTML = '<i class="fa-brands fa-whatsapp"></i> FINALIZAR NO WHATSAPP';
      btnBookingNext.className = "btn-premium btn-primary bg-gradient-to-r from-green-500 to-green-700 text-white font-barlow tracking-wider font-extrabold shadow-[0_0_20px_rgba(37,211,102,0.4)] border border-white/10 active:scale-95";
    } else {
      btnBookingNext.textContent = 'AVANÇAR';
      btnBookingNext.className = "btn-premium btn-primary active:scale-95";
    }

    if (step === 2) {
      renderCalendar();
    } else if (step === 3) {
      renderTimeSlots();
    } else if (step === 5) {
      renderConfirmationReceipt();
    }
  }

  // Avançar
  btnBookingNext.addEventListener('click', () => {
    const step = appState.booking.step;

    if (step === 1) {
      // 🔒 SEGURANÇA [Lei 1]: Validar se pelo menos um serviço foi selecionado
      if (appState.booking.selectedServices.length === 0) {
        showToast('Selecione pelo menos um procedimento para avançar.', 'error');
        return;
      }
      appState.booking.step = 2;
    } 
    else if (step === 2) {
      if (!appState.booking.selectedDate) {
        showToast('Escolha um dia livre.', 'error');
        return;
      }
      appState.booking.step = 3;
    } 
    else if (step === 3) {
      if (!appState.booking.selectedTime) {
        showToast('Escolha um horário livre.', 'error');
        return;
      }
      appState.booking.step = 4;
    } 
    else if (step === 4) {
      const name = inputBookingName.value.trim();
      const phone = inputBookingPhone.value.trim();

      if (!name || name.length < 3) {
        showToast('Preencha seu nome.', 'error');
        inputBookingName.focus();
        return;
      }
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length !== 11) {
        showToast('Insira um celular válido com DDD e 9 dígitos (total de 11 dígitos, Ex: (15) 99999-9999).', 'error');
        inputBookingPhone.focus();
        return;
      }

      appState.booking.clientName = name;
      appState.booking.clientPhone = phone;
      appState.booking.step = 5;
    } 
    else if (step === 5) {
      executeFinalBooking();
    }

    updateBookingFlowUI();
  });

  btnBookingBack.addEventListener('click', () => {
    if (appState.booking.step > 1) {
      appState.booking.step--;
      updateBookingFlowUI();
    }
  });

  function executeFinalBooking() {
    const b = appState.booking;
    const client = getLoggedClient();
    const dateFormatted = formatDate(b.selectedDate);

    // 🔒 SEGURANÇA [Lei 8]: Double-Check de Segurança: Validar se a data foi bloqueada pelo Administrador (Race Condition Prevention)
    const blockedDates = DB.getBlockedDates();
    const isoDateStr = `${b.selectedDate.getFullYear()}-${String(b.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(b.selectedDate.getDate()).padStart(2, '0')}`;
    if (blockedDates.includes(isoDateStr)) {
      showToast('Esta data não está mais disponível. Por favor, selecione outro dia.', 'error');
      b.step = 2; // Volta para o calendário
      updateBookingFlowUI();
      return;
    }

    // 🔒 SEGURANÇA [Lei 8]: Double-Check de Segurança: Validar se o horário já foi reservado por outro cliente (Race Condition Prevention)
    const currentBookings = DB.getBookings();
    const isAlreadyBooked = currentBookings.some(bk => bk.date === dateFormatted && bk.time === b.selectedTime);
    if (isAlreadyBooked) {
      showToast('Este horário já foi reservado. Por favor, escolha outra hora.', 'error');
      b.step = 3; // Volta para seleção de horários
      updateBookingFlowUI();
      return;
    }
    
    // Juntar nomes dos serviços e calcular preços e durações acumulados
    const names = b.selectedServices.map(s => s.name).join(' + ');
    const totalPrice = b.selectedServices.reduce((sum, s) => sum + s.price, 0);
    
    let totalMinutes = 0;
    b.selectedServices.forEach(s => {
      const minutes = parseInt(s.duration.replace(/\D/g, ''));
      if (!isNaN(minutes)) {
        totalMinutes += minutes;
      }
    });
    
    const durationFormatted = totalMinutes >= 60 
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60} min` 
      : `${totalMinutes} min`;

    const newBooking = {
      id: 'bk_' + Date.now(),
      serviceName: names,
      price: totalPrice,
      duration: durationFormatted,
      date: dateFormatted,
      time: b.selectedTime,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientEmail: client ? client.email : 'guest@barber.com',
      createdAt: new Date().toISOString()
    };

    DB.saveBooking(newBooking);

    // Mensagem ultra simples sem emojis corrompidos
    const whatsappText = encodeURIComponent(
`olá, acabei de agendar meu horario pelo aplicativo

cliente = ${b.clientName}
serviço = ${names}
valor = ${formatPrice(totalPrice)}
horario = ${dateFormatted} às ${b.selectedTime}

confirmado pelo aplicativo de luxo, aguardo o atendimento`
    );

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

    showToast('Reserva concluída! Abrindo WhatsApp...', 'success');

    setTimeout(() => {
      window.open(targetUrl, '_blank');
      
      appState.booking = {
        step: 1,
        selectedServices: [],
        selectedDate: null,
        selectedTime: null,
        clientName: '',
        clientPhone: ''
      };
      
      // Limpa os inputs da confirmação
      inputBookingName.value = '';
      inputBookingPhone.value = '';
      
      // Volta para a home
      navigateTo('home-screen');
    }, 1500);
  }


  /* ==========================================
     MÓDULO DE AVALIAÇÕES (REVIEWS)
     ========================================== */
  
  function renderReviews() {
    reviewsListContainer.innerHTML = '';
    const reviews = DB.getReviews();
    
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.score, 0);
      const avg = sum / reviews.length;
      avgRatingValue.textContent = avg.toFixed(1);
      reviewsCountLabel.textContent = `Baseado em ${reviews.length} avaliações`;

      let starsHtml = '';
      const fullStars = Math.floor(avg);
      const hasHalf = avg % 1 >= 0.5;

      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          starsHtml += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalf) {
          starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
          starsHtml += '<i class="fa-regular fa-star text-white/10"></i>';
        }
      }
      avgStarsRow.innerHTML = starsHtml;
    }

    [...reviews].reverse().forEach((rev, index) => {
      const reviewItem = document.createElement('article');
      const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
      
      reviewItem.className = `review-item reveal-item-tw flex flex-col p-4 border border-white/5 rounded-xl bg-zinc-950/40 backdrop-blur-sm shadow-lg space-y-2 ${delayClass}`;
      
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rev.score) {
          stars += '<i class="fa-solid fa-star text-gold-accent"></i> ';
        } else {
          stars += '<i class="fa-regular fa-star text-white/10"></i> ';
        }
      }

      reviewItem.innerHTML = `
        <div class="review-header flex justify-between text-xs font-sans">
          <span class="review-author font-semibold text-text-warm">${escapeHTML(rev.author)}</span>
          <span class="review-date text-zinc-500">${escapeHTML(rev.date)}</span>
        </div>
        <div class="review-stars flex gap-0.5">${stars}</div>
        <p class="review-comment text-[0.8rem] text-zinc-400 font-light italic">"${escapeHTML(rev.text)}"</p>
      `;

      reviewsListContainer.appendChild(reviewItem);
    });
  }

  let selectedScoreForm = 5;
  const starIcons = starsSelector.querySelectorAll('i');

  starIcons.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-value'));
      selectedScoreForm = val;

      starIcons.forEach(icon => {
        const iconVal = parseInt(icon.getAttribute('data-value'));
        if (iconVal <= val) {
          icon.className = 'fa-solid fa-star text-gold-accent cursor-pointer transition-all hover:scale-110';
        } else {
          icon.className = 'fa-regular fa-star text-white/10 cursor-pointer transition-all hover:scale-110';
        }
      });
    });
  });

  btnSubmitReview.addEventListener('click', (e) => {
    e.preventDefault();
    const author = reviewAuthorNameInput.value.trim();
    const comment = reviewCommentTextInput.value.trim();

    if (!author || author.length < 3) {
      showToast('Por favor, preencha seu nome.', 'error');
      reviewAuthorNameInput.focus();
      return;
    }
    if (!comment || comment.length < 5) {
      showToast('Adicione sua mensagem de feedback.', 'error');
      reviewCommentTextInput.focus();
      return;
    }

    const newRev = {
      author: author,
      score: selectedScoreForm,
      text: comment,
      date: formatDate(new Date())
    };

    DB.saveReview(newRev);

    showToast('Agradecemos imensamente seu feedback!', 'success');

    reviewAuthorNameInput.value = '';
    reviewCommentTextInput.value = '';
    selectedScoreForm = 5;
    starIcons.forEach(icon => icon.className = 'fa-solid fa-star text-gold-accent cursor-pointer');

    renderReviews();
  });


  /* ==========================================
     ÁREA ADMINISTRATIVA (ADMIN)
     ========================================== */

  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      adminTabBtns.forEach(b => {
        b.className = b.className.replace('border-barber-red text-text-warm', 'border-transparent text-zinc-500');
      });
      
      btn.className = btn.className.replace('border-transparent text-zinc-500', 'border-barber-red text-text-warm');

      adminPanes.forEach(pane => {
        if (pane.id === tabId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // Estado global do período financeiro no painel admin e data selecionada de filtro
  let adminFinancePeriod = 'day'; // 'day', 'week', 'month'
  let adminSelectedDate = new Date(); // Data base de filtro ativa

  // 🔒 SEGURANÇA [Lei 15]: Funções utilitárias seguras para cálculo de períodos temporais com data selecionada
  function isDateInSelectedWeek(dateStr) {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    
    // Achar início da semana (domingo) baseado na data selecionada pelo admin
    const baseDate = new Date(adminSelectedDate.getFullYear(), adminSelectedDate.getMonth(), adminSelectedDate.getDate());
    const dayOfWeek = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  }

  function isDateInSelectedMonth(dateStr) {
    if (!dateStr) return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    return month === adminSelectedDate.getMonth() && year === adminSelectedDate.getFullYear();
  }

  // Inicializar os seletores metálicos iOS de data/período financeiro
  const periodBtns = document.querySelectorAll('.finance-period-btn');
  const periodLabel = document.getElementById('finance-period-label');
  const financeDateInput = document.getElementById('finance-date-input');
  const financeMonthInput = document.getElementById('finance-month-input');
  
  if (financeDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    financeDateInput.value = `${yyyy}-${mm}-${dd}`;
    
    financeDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        // Criar data local correta sem deslocamento de timezone
        adminSelectedDate = new Date(e.target.value + 'T00:00:00');
        renderAdminDashboard();
      }
    });
  }

  if (financeMonthInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    financeMonthInput.value = `${yyyy}-${mm}`;
    
    financeMonthInput.addEventListener('change', (e) => {
      if (e.target.value) {
        adminSelectedDate = new Date(e.target.value + '-01T00:00:00');
        renderAdminDashboard();
      }
    });
  }
  
  if (periodBtns) {
    periodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        periodBtns.forEach(b => {
          b.classList.remove('active', 'border-gold-accent', 'text-gold-accent', 'bg-gold-accent/5');
          b.classList.add('border-white/5', 'bg-zinc-950/40', 'text-zinc-400');
        });
        
        btn.classList.remove('border-white/5', 'bg-zinc-950/40', 'text-zinc-400');
        btn.classList.add('active', 'border-gold-accent', 'text-gold-accent', 'bg-gold-accent/5');
        
        adminFinancePeriod = btn.getAttribute('data-period');
        if (periodLabel) {
          periodLabel.textContent = adminFinancePeriod === 'day' ? 'Dia' : adminFinancePeriod === 'week' ? 'Semana' : 'Mês';
        }

        // Controlar visibilidade dos inputs seletores
        if (adminFinancePeriod === 'day' || adminFinancePeriod === 'week') {
          if (financeDateInput) financeDateInput.classList.remove('hidden');
          if (financeMonthInput) financeMonthInput.classList.add('hidden');
        } else {
          if (financeDateInput) financeDateInput.classList.add('hidden');
          if (financeMonthInput) financeMonthInput.classList.remove('hidden');
        }
        
        renderAdminDashboard();
      });
    });
  }

  function renderAdminDashboard() {
    const bookings = DB.getBookings();
    adminBookingsList.innerHTML = '';
    if (adminBookingsListCompleted) adminBookingsListCompleted.innerHTML = '';
    
    const todayFormatted = formatDate(new Date());
    
    // 1. Cálculos de Caixa do Dashboard Financeiro Estilo iOS com Filtro por Período e Data Selecionada
    let totalPaid = 0;
    let countCompleted = 0;
    
    const filterDateFormatted = formatDate(adminSelectedDate);
    
    if (adminFinancePeriod === 'day') {
      const completedDay = bookings.filter(b => b.completed && b.date === filterDateFormatted);
      totalPaid = completedDay.reduce((sum, b) => sum + b.price, 0);
      countCompleted = completedDay.length;
    } else if (adminFinancePeriod === 'week') {
      const completedWeek = bookings.filter(b => b.completed && isDateInSelectedWeek(b.date));
      totalPaid = completedWeek.reduce((sum, b) => sum + b.price, 0);
      countCompleted = completedWeek.length;
    } else if (adminFinancePeriod === 'month') {
      const completedMonth = bookings.filter(b => b.completed && isDateInSelectedMonth(b.date));
      totalPaid = completedMonth.reduce((sum, b) => sum + b.price, 0);
      countCompleted = completedMonth.length;
    }

    const totalPending = bookings.filter(b => !b.completed).reduce((sum, b) => sum + b.price, 0);
    const totalEstimated = totalPaid + totalPending;
    
    // Ganhos de hoje acumulam cortes de hoje independentemente do período de exibição do caixa
    const todayPaid = bookings.filter(b => b.date === todayFormatted && b.completed).reduce((sum, b) => sum + b.price, 0);

    // 2. Atualizar Elementos do Dashboard Financeiro no HTML (Protegido contra nulos)
    const elTotalPaid = document.getElementById('finance-total-paid');
    const elTodayChange = document.getElementById('finance-today-change');
    const elCountCompleted = document.getElementById('finance-count-completed');
    const elTotalPending = document.getElementById('finance-total-pending');
    const elTotalEstimated = document.getElementById('finance-total-estimated');

    if (elTotalPaid) elTotalPaid.textContent = formatPrice(totalPaid);
    if (elTodayChange) elTodayChange.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> +${formatPrice(todayPaid)} hoje`;
    if (elCountCompleted) elCountCompleted.innerHTML = `<i class="fa-solid fa-scissors text-[0.7rem] text-zinc-500"></i> ${countCompleted}`;
    if (elTotalPending) elTotalPending.textContent = formatPrice(totalPending);
    if (elTotalEstimated) elTotalEstimated.textContent = formatPrice(totalEstimated);

    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.time.localeCompare(b.time);
    });

    const activeBookings = sortedBookings.filter(b => !b.completed);
    const completedBookings = sortedBookings.filter(b => b.completed);

    // Renderizar Agendamentos Ativos
    if (activeBookings.length === 0) {
      adminBookingsList.innerHTML = '<p class="text-center text-xs text-zinc-500 py-4 reveal-item-tw">Nenhum agendamento ativo.</p>';
    } else {
      activeBookings.forEach((bk, index) => {
        const item = createAdminBookingCard(bk, index, todayFormatted);
        adminBookingsList.appendChild(item);
      });
    }

    // Renderizar Cortes Concluídos
    if (adminBookingsListCompleted) {
      if (completedBookings.length === 0) {
        adminBookingsListCompleted.innerHTML = '<p class="text-center text-xs text-zinc-500 py-4 reveal-item-tw">Nenhum corte concluído hoje.</p>';
      } else {
        completedBookings.forEach((bk, index) => {
          const item = createAdminBookingCard(bk, index, todayFormatted);
          adminBookingsListCompleted.appendChild(item);
        });
      }
    }

    renderBlockedDates();
    renderStudioStatusConfig();
  }

  function createAdminBookingCard(bk, index, todayFormatted) {
    const item = document.createElement('div');
    const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
    
    const isToday = bk.date === todayFormatted;
    const styleToday = isToday ? 'border-l-[3px] border-barber-red pl-3' : 'border-l border-white/10';

    item.className = `booking-admin-item reveal-item-tw flex justify-between items-center p-4 border border-white/5 rounded-xl bg-zinc-900/60 backdrop-blur-sm ${styleToday} ${delayClass}`;
    
    item.innerHTML = `
      <div class="booking-admin-info space-y-1">
        <h4 class="font-cinzel text-xs font-semibold text-text-warm tracking-wider uppercase">${escapeHTML(bk.clientName)} ${isToday ? '<span class="text-barber-red font-barlow text-[0.65rem] font-black tracking-widest">[HOJE]</span>' : ''}</h4>
        <p class="text-[0.8rem] text-zinc-400 font-semibold">${escapeHTML(bk.serviceName)} - <span class="text-gold-accent font-barlow font-bold">${formatPrice(bk.price)}</span></p>
        <p class="text-[0.72rem] text-zinc-400 font-light flex items-center gap-1"><i class="fa-regular fa-calendar"></i> ${escapeHTML(bk.date)} às ${escapeHTML(bk.time)} (${escapeHTML(bk.duration)})</p>
        <p class="text-[0.72rem] text-zinc-500 font-light flex items-center gap-1"><i class="fa-solid fa-phone"></i> ${escapeHTML(bk.clientPhone)}</p>
      </div>
      <div class="booking-admin-actions flex items-center gap-2">
        ${bk.completed ? `
          <span class="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/30 text-[0.62rem] font-barlow font-bold text-green-400 flex items-center gap-1 uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <i class="fa-solid fa-circle-check text-[0.65rem]"></i> Pago
          </span>
          <button class="btn-admin-action undo w-8 h-8 rounded border border-white/10 flex justify-center items-center hover:bg-zinc-800 transition-all text-xs active:scale-90" data-id="${bk.id}" title="Reabrir Agendamento">
            <i class="fa-solid fa-arrow-rotate-left text-zinc-400"></i>
          </button>
        ` : `
          <button class="btn-admin-action complete w-8 h-8 rounded border border-white/10 flex justify-center items-center hover:bg-green-500 hover:border-green-500 transition-all text-xs active:scale-90" data-id="${bk.id}" title="Concluir Corte & Registrar Pagamento">
            <i class="fa-solid fa-check text-text-warm"></i>
          </button>
        `}
        <a href="https://wa.me/55${bk.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + bk.clientName + ', gostaríamos de confirmar seu horário no dia ' + bk.date + ' às ' + bk.time + ' na JOTAGAAHBS Barbearia.')}" target="_blank" class="btn-admin-action whatsapp w-8 h-8 rounded border border-white/10 flex justify-center items-center hover:bg-green-500 hover:border-green-500 transition-all text-sm active:scale-90" title="Contatar Cliente">
          <i class="fa-brands fa-whatsapp text-text-warm"></i>
        </a>
        <button class="btn-admin-action delete w-8 h-8 rounded border border-white/10 flex justify-center items-center hover:bg-barber-red hover:border-barber-red transition-all text-sm active:scale-90" data-id="${bk.id}" title="Cancelar Reserva">
          <i class="fa-solid fa-trash-can text-text-warm"></i>
        </button>
      </div>
    `;

    if (!bk.completed) {
      item.querySelector('.btn-admin-action.complete').addEventListener('click', () => {
        toggleBookingCompletion(bk.id, true);
      });
    } else {
      item.querySelector('.btn-admin-action.undo').addEventListener('click', () => {
        toggleBookingCompletion(bk.id, false);
      });
    }

    item.querySelector('.btn-admin-action.delete').addEventListener('click', () => {
      if (confirm(`Deseja realmente cancelar a reserva de ${bk.clientName}?`)) {
        deleteBooking(bk.id);
      }
    });

    return item;
  }

  function deleteBooking(id) {
    let bookings = DB.getBookings();
    bookings = bookings.filter(b => b.id !== id);
    DB.updateBookings(bookings);
    showToast('Reserva cancelada!', 'success');
    renderAdminDashboard();
  }

  function toggleBookingCompletion(id, completed) {
    let bookings = DB.getBookings();
    const bkIndex = bookings.findIndex(b => b.id === id);
    if (bkIndex !== -1) {
      bookings[bkIndex].completed = completed;
      DB.updateBookings(bookings);
      if (completed) {
        showToast('Corte concluído e pagamento registrado!', 'success');
        
        // 🔒 SEGURANÇA [Lei 15]: Transição tátil automática para a aba Concluídos
        const tabBtnCompleted = document.getElementById('tab-btn-completed');
        if (tabBtnCompleted) {
          tabBtnCompleted.click();
        }
      } else {
        showToast('Agendamento reaberto com sucesso.', 'warning');
        
        // 🔒 SEGURANÇA [Lei 15]: Transição tátil automática para a aba Agendamentos
        const tabBtnBookings = document.getElementById('tab-btn-bookings');
        if (tabBtnBookings) {
          tabBtnBookings.click();
        }
      }
      renderAdminDashboard();
    }
  }

  btnBlockDate.addEventListener('click', (e) => {
    e.preventDefault();
    const dateVal = blockDateInput.value;

    if (!dateVal) {
      showToast('Selecione uma data.', 'error');
      return;
    }

    const selected = new Date(dateVal + 'T23:59:59');
    if (selected < new Date()) {
      showToast('Não bloqueie datas passadas.', 'error');
      return;
    }

    let blocked = DB.getBlockedDates();
    if (blocked.includes(dateVal)) {
      showToast('Esta data já está bloqueada.', 'warning');
      return;
    }

    DB.saveBlockedDate(dateVal);
    showToast('Data bloqueada com sucesso!', 'success');
    blockDateInput.value = '';

    renderBlockedDates();
  });

  // Sincronizar inputs administrativos com o localStorage
  function renderStudioStatusConfig() {
    const config = DB.getStudioConfig();
    const statusSelect = document.getElementById('admin-status-select');
    
    if (statusSelect) {
      statusSelect.value = config.status;
    }
  }

  // Vincular evento de salvar ajustes do estúdio
  const btnSaveStudioConfig = document.getElementById('btn-save-studio-config');
  if (btnSaveStudioConfig) {
    btnSaveStudioConfig.addEventListener('click', (e) => {
      e.preventDefault();
      const statusSelect = document.getElementById('admin-status-select');
      
      if (!statusSelect) return;
      
      const statusVal = statusSelect.value;
      const currentConfig = DB.getStudioConfig();
      
      const config = {
        status: statusVal,
        rating: currentConfig.rating || 5.0
      };
      
      DB.saveStudioConfig(config);
      showToast('Ajustes do estúdio salvos com sucesso!', 'success');
      
      // Atualizar a Home instantaneamente
      updateStudioHomeDisplay();
    });
  }

  function renderBlockedDates() {
    adminBlockedDatesList.innerHTML = '';
    const blocked = DB.getBlockedDates();

    if (blocked.length === 0) {
      adminBlockedDatesList.innerHTML = '<p class="text-center text-xs text-zinc-500 py-3 font-light">Nenhuma data bloqueada.</p>';
      return;
    }

    blocked.sort().forEach((dateStr, index) => {
      const parts = dateStr.split('-');
      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;

      const item = document.createElement('div');
      const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
      
      item.className = `blocked-date-item reveal-item-tw flex justify-between items-center p-3 border border-white/5 bg-zinc-900/60 backdrop-blur-sm rounded-lg text-xs font-sans font-medium ${delayClass}`;
      item.innerHTML = `
        <span class="flex items-center gap-2"><i class="fa-regular fa-calendar-times text-barber-red"></i> ${formatted}</span>
        <button class="btn-admin-action delete w-6 h-6 border border-white/10 rounded flex justify-center items-center text-xs hover:bg-barber-red hover:border-barber-red transition-all active:scale-90" title="Desbloquear data">
          <i class="fa-solid fa-xmark text-text-warm"></i>
        </button>
      `;

      item.querySelector('button').addEventListener('click', () => {
        removeBlockDate(dateStr);
      });

      adminBlockedDatesList.appendChild(item);
    });
  }

  function removeBlockDate(dateStr) {
    DB.removeBlockedDate(dateStr);
    showToast('Data desbloqueada com sucesso!', 'success');
    renderBlockedDates();
  }

  // --- UPLOAD E PERSISTÊNCIA DE AVATAR DO CLIENTE ---
  const btnUploadAvatar = document.getElementById('btn-upload-avatar');
  const profileAvatarInput = document.getElementById('profile-avatar-input');
  
  if (btnUploadAvatar && profileAvatarInput) {
    btnUploadAvatar.addEventListener('click', () => {
      profileAvatarInput.click();
    });
    
    profileAvatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // 🔒 SEGURANÇA [VULN-4]: Validação estrita de tipo de arquivo de imagem no cliente (CWE-434 / Lei 12)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          showToast('Formato de arquivo não suportado. Escolha JPEG, PNG, WEBP ou GIF.', 'error');
          profileAvatarInput.value = '';
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          showToast('Escolha uma imagem de até 2MB.', 'error');
          profileAvatarInput.value = '';
          return;
        }

        // Validação adicional de Magic Bytes por integridade
        const readerBytes = new FileReader();
        readerBytes.onloadend = function(evt) {
          if (evt.target.readyState === FileReader.DONE) {
            const arr = new Uint8Array(evt.target.result);
            let header = "";
            for (let i = 0; i < Math.min(arr.length, 4); i++) {
              header += arr[i].toString(16).toUpperCase();
            }

            // JPEG (FFD8FF), PNG (89504E47), GIF (47494638) ou WEBP (52494646 - "RIFF")
            const isJPEG = header.startsWith("FFD8FF");
            const isPNG = header.startsWith("89504E47");
            const isGIF = header.startsWith("47494638");
            const isWEBP = header.startsWith("52494646"); // "RIFF"

            if (!isJPEG && !isPNG && !isGIF && !isWEBP) {
              showToast('Arquivo de imagem inválido ou corrompido.', 'error');
              profileAvatarInput.value = '';
              return;
            }

            // Processar upload real
            const reader = new FileReader();
            reader.onload = function(e2) {
              const dataUrl = e2.target.result;
              const client = getLoggedClient();
              if (client) {
                client.avatar = dataUrl;
                
                const clients = DB.getClients();
                const updatedClients = clients.map(c => {
                  if (c.email === client.email) {
                    return { ...c, avatar: dataUrl };
                  }
                  return c;
                });
                localStorage.setItem('jota_clients', JSON.stringify(updatedClients));
                
                setLoggedClient(client);
                renderClientProfile();
                updateNavProfileBar();
                showToast('Foto de perfil atualizada com sucesso!', 'success');
              }
            };
            reader.readAsDataURL(file);
          }
        };
        readerBytes.readAsArrayBuffer(file.slice(0, 4));
      }
    });
  }

  // Inicializa o roteamento SPA para a home screen
  navigateTo('home-screen');

  // Loop de Bounce do Botão de Agendamento (Micro-Animação reativa controlada via JS)
  function initBookingButtonBounce() {
    const btn = document.getElementById('home-booking-cta');
    if (!btn) return;
    
    // Dispara o pulinho a cada 3.5 segundos
    setInterval(() => {
      btn.classList.remove('animate-bounce-luxury');
      btn.offsetHeight; // Forçar reflow para reiniciar a animação
      btn.classList.add('animate-bounce-luxury');
    }, 3500);
  }
  initBookingButtonBounce();

  // Checagem periódica da virada do dia para resetar o faturamento diário do dashboard automaticamente à meia-noite (00:00)
  let lastCheckedDate = new Date().toDateString();
  setInterval(() => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastCheckedDate) {
      lastCheckedDate = currentDate;
      // Se estiver logado e na tela administrativa, re-renderiza para resetar o faturamento de hoje
      const adminScreen = document.getElementById('admin-screen');
      if (adminScreen && adminScreen.classList.contains('active')) {
        renderAdminDashboard();
        showToast('Virada de dia detectada! O faturamento diário foi resetado para R$ 0,00.', 'info');
      }
    }
  }, 10000); // Executa a verificação a cada 10 segundos

  // Rotação Automática Contínua de Assinaturas (Carrossel Horizontal de Altíssimo Luxo)
  function initSubscriptionsCarousel() {
    const carousel = document.getElementById('subscriptions-carousel');
    if (!carousel) return;

    // Pausar rotação no hover ou toque
    let isHovered = false;
    carousel.addEventListener('mouseenter', () => isHovered = true);
    carousel.addEventListener('mouseleave', () => isHovered = false);
    carousel.addEventListener('touchstart', () => isHovered = true, { passive: true });
    carousel.addEventListener('touchend', () => {
      setTimeout(() => { isHovered = false; }, 2500); // Pequeno delay de 2.5s antes de retomar
    });

    setInterval(() => {
      if (isHovered) return;
      
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 1) {
        carousel.scrollLeft = 0; // Volta para o início
      } else {
        carousel.scrollLeft += 0.6; // Deslocamento de 0.6px contínuo e ultra-suave (Marquee moderno)
      }
    }, 20); // Executa a 50fps para parecer aceleração gráfica de hardware
  }
  initSubscriptionsCarousel();

});
