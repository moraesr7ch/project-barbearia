/**
 * LOGICA DA APLICACAO (TAILWIND ULTRA-LUXURY) - JOTAGAAHBS BARBEARIA POR ASSINATURA
 * Desenvolvido em JS Puro (Vanilla) de alta performance e riqueza interativa.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     DATABASE / DADOS DA LOJA
     ========================================== */
  const SERVICES = [
    { id: 'srv1', name: 'BARBA', price: 35.00, duration: '30 min', desc: 'Barba desenhada, alinhamento premium e hidratação dos fios.' },
    { id: 'srv2', name: 'CORTE', price: 40.00, duration: '40 min', desc: 'Corte moderno ou clássico na tesoura/máquina com lavagem inclusa.' },
    { id: 'srv3', name: 'CORTE & BARBA', price: 69.99, duration: '60 min', desc: 'O combo assinatura perfeito com toalha quente, massagem facial e corte.' },
    { id: 'srv4', name: 'DESIGN DE SOBRANCELHAS', price: 12.00, duration: '15 min', desc: 'Limpeza e design simétrico de sobrancelhas com lâmina ou pinça.' },
    { id: 'srv5', name: 'HIDRATAÇÃO PROFUNDA CAPILAR', price: 35.00, duration: '30 min', desc: 'Tratamento com produtos importados para devolver o brilho e força capilar.' },
    { id: 'srv6', name: 'NEVOU PLATINADO', price: 179.97, duration: '120 min', desc: 'Descoloração global profissional ultra segura com tom platinado gelo.' },
    { id: 'srv7', name: 'LIMPEZA DE PELE MASCULINA', price: 35.00, duration: '45 min', desc: 'Remoção de cravos, esfoliação profunda e máscara calmante refrescante.' },
    { id: 'srv8', name: 'BARBOTERAPIA PREMIUM', price: 45.00, duration: '45 min', desc: 'Experiência relaxante com óleos essenciais, massagem facial e toalhas quentes.' },
    { id: 'srv9', name: 'LUZES', price: 159.97, duration: '90 min', desc: 'Reflexos ou luzes no chapéu/papel para realçar o estilo.' },
    { id: 'srv10', name: 'CORTE + PIGMENTAÇÃO', price: 59.99, duration: '50 min', desc: 'Corte premium com acabamento pigmentado para corrigir falhas e realçar contornos.' }
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
     INICIALIZAÇÃO DO BANCO DE DADOS LOCAL
     ========================================== */
  if (!localStorage.getItem('barber_reviews')) {
    localStorage.setItem('barber_reviews', JSON.stringify(DEFAULT_REVIEWS));
  }
  if (!localStorage.getItem('barber_bookings')) {
    localStorage.setItem('barber_bookings', JSON.stringify([]));
  }
  if (!localStorage.getItem('barber_blocked_dates')) {
    localStorage.setItem('barber_blocked_dates', JSON.stringify([]));
  }
  if (!localStorage.getItem('jota_clients')) {
    localStorage.setItem('jota_clients', JSON.stringify([]));
  }

  /* ==========================================
     ESTADO GLOBAL DA APLICACAO
     ========================================== */
  let appState = {
    currentScreen: 'home-screen',
    booking: {
      step: 1,
      selectedService: null,
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
  const todayStatusText = document.getElementById('today-status-text');

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
  
  // Toggle
  const authToggle = document.getElementById('auth-toggle');
  const toggleBtnClient = document.getElementById('toggle-btn-client');
  const toggleBtnAdmin = document.getElementById('toggle-btn-admin');
  
  // Formulários
  const formClientLogin = document.getElementById('form-client-login');
  const formClientRegister = document.getElementById('form-client-register');
  const formAdminLogin = document.getElementById('form-admin-login');
  
  // Links de navegação interna auth
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');

  // Inputs Cliente Login
  const clientLoginEmailInput = document.getElementById('client-login-email');
  const clientLoginPasswordInput = document.getElementById('client-login-password');
  const btnExecuteClientLogin = document.getElementById('btn-execute-client-login');

  // Inputs Cliente Cadastro
  const clientRegNameInput = document.getElementById('client-reg-name');
  const clientRegEmailInput = document.getElementById('client-reg-email');
  const clientRegPhoneInput = document.getElementById('client-reg-phone');
  const clientRegPasswordInput = document.getElementById('client-reg-password');
  const btnExecuteClientRegister = document.getElementById('btn-execute-client-register');

  // Inputs Admin Login
  const adminLoginPasswordInput = document.getElementById('admin-login-password');
  const btnExecuteAdminLogin = document.getElementById('btn-execute-admin-login');

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
  const todayBookingsCount = document.getElementById('today-bookings-count');
  const blockDateInput = document.getElementById('block-date-input');
  const btnBlockDate = document.getElementById('btn-block-date');
  const adminBlockedDatesList = document.getElementById('admin-blocked-dates-list');
  const btnLogoutAdmin = document.getElementById('btn-logout-admin');

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
        
      drawerMenuOptions.innerHTML = `
        <div class="px-4 py-3 bg-zinc-950/60 border border-white/5 rounded-xl mb-2 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-400 text-black flex justify-center items-center text-xs font-cinzel font-bold border border-text-warm">${initials}</div>
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

  function updateTodayStatus() {
    const today = new Date().getDay();
    if (today === 0 || today === 1) {
      todayStatusText.textContent = 'Fechado';
      todayStatusText.style.color = 'var(--accent-red)';
    } else {
      todayStatusText.textContent = 'Aberto';
      todayStatusText.style.color = '#25D366';
    }
  }
  updateTodayStatus();

  /* ==========================================
     ROTEADOR SPA COM COBERTURA DE SEGURANÇA
     ========================================== */
  function navigateTo(screenId) {
    const client = getLoggedClient();
    const admin = isAdminAuthenticated();

    // 1. Proteger Rota de Agendamento
    if (screenId === 'booking-screen' && !client) {
      showToast('Por favor, acesse sua conta ou cadastre-se para reservar.', 'error');
      navigateTo('login-screen');
      setAuthMode('client');
      return;
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
        item.querySelector('i').className = "fa-solid fa-user-circle text-barber-red drop-shadow-[0_0_10px_rgba(196,30,58,0.4)]";
      } else if (target === screenId) {
        item.classList.add('active');
        if (target === 'home-screen') item.querySelector('i').className = "fa-solid fa-house text-barber-red drop-shadow-[0_0_10px_rgba(196,30,58,0.4)]";
        if (target === 'booking-screen') item.querySelector('i').className = "fa-solid fa-calendar-days text-barber-red drop-shadow-[0_0_10px_rgba(196,30,58,0.4)]";
        if (target === 'reviews-screen') item.querySelector('i').className = "fa-solid fa-star-half-stroke text-barber-red drop-shadow-[0_0_10px_rgba(196,30,58,0.4)]";
      } else {
        item.classList.remove('active');
        if (target === 'home-screen') item.querySelector('i').className = "fa-solid fa-house text-zinc-400";
        if (target === 'booking-screen') item.querySelector('i').className = "fa-solid fa-calendar-days text-zinc-400";
        if (target === 'reviews-screen') item.querySelector('i').className = "fa-solid fa-star-half-stroke text-zinc-400";
        if (target === 'login-screen') item.querySelector('i').className = "fa-solid fa-user-circle text-zinc-400";
      }
    });

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
     SISTEMA DE AUTENTICAÇÃO DUPLA (CLIENTE / ADMIN)
     ========================================== */
  
  function setAuthMode(mode) {
    const activeClass = "active flex-1 bg-gradient-to-r text-white font-barlow tracking-wider font-bold shadow-lg";
    const inactiveClass = "flex-1 bg-none text-zinc-500 font-barlow tracking-wider font-bold";

    if (mode === 'client') {
      toggleBtnClient.className = `auth-toggle-btn py-2 text-sm rounded transition-all duration-300 ${activeClass} from-barber-red to-red-900 shadow-red-900/35`;
      toggleBtnClient.setAttribute('data-mode', 'client');
      toggleBtnAdmin.className = `auth-toggle-btn py-2 text-sm rounded transition-all duration-300 ${inactiveClass}`;
      
      formClientLogin.classList.remove('d-none');
      formAdminLogin.classList.add('d-none');
      formClientRegister.classList.add('d-none');
    } else if (mode === 'admin') {
      toggleBtnClient.className = `auth-toggle-btn py-2 text-sm rounded transition-all duration-300 ${inactiveClass}`;
      toggleBtnAdmin.className = `auth-toggle-btn py-2 text-sm rounded transition-all duration-300 ${activeClass} from-barber-blue to-cyan-900 shadow-blue-900/35`;
      toggleBtnAdmin.setAttribute('data-mode', 'admin');
      
      formClientLogin.classList.add('d-none');
      formAdminLogin.classList.remove('d-none');
      formClientRegister.classList.add('d-none');
    }
  }

  toggleBtnClient.addEventListener('click', () => setAuthMode('client'));
  toggleBtnAdmin.addEventListener('click', () => setAuthMode('admin'));
  // Inicialização padrão do toggle
  setAuthMode('client');

  linkToRegister.addEventListener('click', () => {
    formClientLogin.classList.add('d-none');
    formClientRegister.classList.remove('d-none');
  });

  linkToLogin.addEventListener('click', () => {
    formClientLogin.classList.remove('d-none');
    formClientRegister.classList.add('d-none');
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
    if (!phone || phone.length < 14) {
      showToast('Preencha seu celular WhatsApp.', 'error');
      clientRegPhoneInput.focus();
      return;
    }
    if (!password || password.length < 4) {
      showToast('A senha deve ter no mínimo 4 caracteres.', 'error');
      clientRegPasswordInput.focus();
      return;
    }

    const clients = JSON.parse(localStorage.getItem('jota_clients')) || [];
    const emailExists = clients.some(c => c.email === email);

    if (emailExists) {
      showToast('E-mail já cadastrado.', 'error');
      clientRegEmailInput.focus();
      return;
    }

    const newClient = { name, email, phone, password };
    clients.push(newClient);
    localStorage.setItem('jota_clients', JSON.stringify(clients));

    setLoggedClient(newClient);
    showToast('Cadastro realizado com sucesso! Bem-vindo.', 'success');

    clientRegNameInput.value = '';
    clientRegEmailInput.value = '';
    clientRegPhoneInput.value = '';
    clientRegPasswordInput.value = '';

    navigateTo('profile-screen');
  });

  // LOGIN DE CLIENTE
  btnExecuteClientLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const email = clientLoginEmailInput.value.trim().toLowerCase();
    const password = clientLoginPasswordInput.value;

    if (!email || !password) {
      showToast('Preencha todos os campos.', 'error');
      return;
    }

    const clients = JSON.parse(localStorage.getItem('jota_clients')) || [];
    const client = clients.find(c => c.email === email && c.password === password);

    if (client) {
      setLoggedClient(client);
      showToast(`Bem-vindo, ${client.name.split(' ')[0]}!`, 'success');
      
      clientLoginEmailInput.value = '';
      clientLoginPasswordInput.value = '';
      
      navigateTo('profile-screen');
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

  // LOGIN DE ADMINISTRADOR
  btnExecuteAdminLogin.addEventListener('click', (e) => {
    e.preventDefault();
    const password = adminLoginPasswordInput.value;

    if (password === 'jota2024') {
      setAdminAuthenticated(true);
      updateNavProfileBar();
      showToast('Painel administrativo autenticado!', 'success');
      adminLoginPasswordInput.value = '';
      navigateTo('admin-screen');
    } else {
      showToast('Senha incorreta.', 'error');
      adminLoginPasswordInput.value = '';
      adminLoginPasswordInput.focus();
    }
  });

  // LOGOUT DE ADMINISTRADOR
  btnLogoutAdmin.addEventListener('click', () => {
    setAdminAuthenticated(false);
    updateNavProfileBar();
    showToast('Sessão administrativa encerrada.');
    navigateTo('home-screen');
  });

  // GATILHO SECRETO
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
      showToast('Painel de login administrativo ativado!', 'success');
      navigateTo('login-screen');
      setAuthMode('admin');
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
    
    const names = client.name.split(' ');
    const initials = names.length > 1 
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
    profileAvatarInitials.textContent = initials;

    clientPersonalBookingsList.innerHTML = '';
    const bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
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
          <h4 class="font-cinzel text-xs font-semibold tracking-wider text-text-warm uppercase">${bk.serviceName}</h4>
          <p class="text-[0.75rem] text-zinc-400 font-light flex items-center gap-1.5"><i class="fa-regular fa-calendar text-gold-accent"></i> ${bk.date} às ${bk.time}</p>
          <p class="text-[0.68rem] text-zinc-500 font-light flex items-center gap-1.5"><i class="fa-regular fa-clock"></i> Duração: ${bk.duration}</p>
        </div>
        <span class="client-booking-price font-barlow text-lg text-gold-accent font-bold">${formatPrice(bk.price)}</span>
      `;
      clientPersonalBookingsList.appendChild(item);
    });
  }


  /* ==========================================
     FLUXO DE AGENDAMENTO (5 PASSOS)
     ========================================== */

  // 1. Serviços com reveal staggered
  function renderServicesList() {
    servicesListGrid.innerHTML = '';
    SERVICES.forEach((service, index) => {
      const card = document.createElement('article');
      const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
      
      // Card com bordas cromadas, glassmorphism e cores do tema reativas
      const selectedClasses = appState.booking.selectedService?.id === service.id 
        ? 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/30' 
        : 'border-white/10 bg-zinc-950/60 hover:border-white/20';

      card.className = `booking-service-card reveal-item-tw cursor-pointer flex justify-between items-center p-4 border rounded-xl backdrop-blur-sm transition-all duration-300 active:scale-[0.97] ${selectedClasses} ${delayClass}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="service-item-info space-y-1 pr-4">
          <h4 class="font-cinzel text-xs font-semibold tracking-wider text-text-warm uppercase">${service.name}</h4>
          <p class="text-[0.74rem] text-zinc-400 font-light leading-snug">${service.desc}</p>
          <span class="text-[0.68rem] text-gold-accent/80 font-medium block pt-1"><i class="fa-regular fa-clock mr-1"></i> Duração: ${service.duration}</span>
        </div>
        <span class="service-item-price font-barlow text-lg text-gold-accent font-bold flex-shrink-0">${formatPrice(service.price)}</span>
      `;
      
      card.addEventListener('click', () => {
        appState.booking.selectedService = service;
        document.querySelectorAll('.booking-service-card').forEach(c => {
          c.className = c.className.replace('border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/30', 'border-white/10 bg-zinc-950/60 hover:border-white/20');
        });
        card.className = card.className.replace('border-white/10 bg-zinc-950/60 hover:border-white/20', 'border-gold-accent bg-gold-accent/5 ring-1 ring-gold-accent/30');
        
        setTimeout(() => {
          appState.booking.step = 2;
          updateBookingFlowUI();
        }, 300);
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

    const blockedDates = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];
    const todayStr = new Date().toDateString();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell opacity-0 pointer-events-none';
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

      let classes = "calendar-day-cell aspect-square flex justify-center items-center text-xs rounded-lg transition-all duration-200 font-sans font-medium ";

      if (isPast || isClosed || isBlocked) {
        classes += "text-white/10 cursor-not-allowed line-through ";
      } else {
        classes += "text-text-warm cursor-pointer hover:bg-white/5 hover:border-white/20 border border-transparent ";
        
        if (cellDateStr === todayStr) {
          classes += "border-gold-accent/60 text-gold-accent font-bold ";
        }
        
        if (appState.booking.selectedDate && appState.booking.selectedDate.toDateString() === cellDateStr) {
          classes += "bg-barber-red text-white font-extrabold shadow-[0_0_15px_rgba(196,30,58,0.5)] ";
        }

        cell.addEventListener('click', () => {
          appState.booking.selectedDate = cellDate;
          appState.booking.selectedTime = null;
          
          document.querySelectorAll('.calendar-day-cell').forEach(c => {
            c.className = c.className.replace('bg-barber-red text-white font-extrabold shadow-[0_0_15px_rgba(196,30,58,0.5)]', '');
          });
          cell.className += 'bg-barber-red text-white font-extrabold shadow-[0_0_15px_rgba(196,30,58,0.5)]';
          
          setTimeout(() => {
            appState.booking.step = 3;
            updateBookingFlowUI();
          }, 300);
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

  // 3. Horários
  function renderTimeSlots() {
    timeSlotsGrid.innerHTML = '';
    
    if (!appState.booking.selectedDate) return;

    const dayOfWeek = appState.booking.selectedDate.getDay();
    let slots = [];
    
    const startHour = 8;
    const endHour = (dayOfWeek === 6) ? 19 : 20;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
    }

    const bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    const selectedDateFormatted = formatDate(appState.booking.selectedDate);
    const occupiedTimes = bookings
      .filter(b => b.date === selectedDateFormatted)
      .map(b => b.time);

    slots.forEach((time, index) => {
      const btn = document.createElement('button');
      const delayClass = index < 6 ? `delay-${Math.floor(index/2) + 1}` : 'delay-3';
      
      const isSelected = appState.booking.selectedTime === time;
      const isOccupied = occupiedTimes.includes(time);
      const isToday = appState.booking.selectedDate.toDateString() === new Date().toDateString();
      const currentHourReal = new Date().getHours();
      const slotHour = parseInt(time.split(':')[0]);
      const isPastSlot = isToday && slotHour <= currentHourReal;

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

  // 4. Confirmação
  function renderConfirmationReceipt() {
    if (!appState.booking.selectedService || !appState.booking.selectedDate || !appState.booking.selectedTime) return;

    receiptServiceName.textContent = appState.booking.selectedService.name;
    receiptDate.textContent = formatDate(appState.booking.selectedDate);
    receiptTime.textContent = `${appState.booking.selectedTime} (${appState.booking.selectedService.duration})`;
    receiptClientName.textContent = appState.booking.clientName;
    receiptPrice.textContent = formatPrice(appState.booking.selectedService.price);
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
      if (!appState.booking.selectedService) {
        showToast('Selecione um procedimento para avançar.', 'error');
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
      if (!phone || phone.length < 14) {
        showToast('Insira seu celular WhatsApp.', 'error');
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
    
    const newBooking = {
      id: 'bk_' + Date.now(),
      serviceName: b.selectedService.name,
      price: b.selectedService.price,
      duration: b.selectedService.duration,
      date: dateFormatted,
      time: b.selectedTime,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientEmail: client ? client.email : 'guest@barber.com',
      createdAt: new Date().toISOString()
    };

    const currentBookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    currentBookings.push(newBooking);
    localStorage.setItem('barber_bookings', JSON.stringify(currentBookings));

    const whatsappText = encodeURIComponent(
`💈 *JOTAGAAHBS Barbearia por Assinatura* 💈
Olá! Acabei de realizar um agendamento premium:

👤 *Cliente:* ${b.clientName}
📞 *Contato:* ${b.clientPhone}
💇‍♂️ *Serviço:* ${b.selectedService.name}
💰 *Valor:* ${formatPrice(b.selectedService.price)}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${b.selectedTime} (${b.selectedService.duration})

_Confirmado pelo aplicativo de luxo. Aguardo o atendimento!_`
    );

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

    showToast('Reserva concluída! Abrindo WhatsApp...', 'success');

    setTimeout(() => {
      window.open(targetUrl, '_blank');
      
      appState.booking = {
        step: 1,
        selectedService: null,
        selectedDate: null,
        selectedTime: null,
        clientName: '',
        clientPhone: ''
      };
      
      navigateTo('home-screen');
    }, 1500);
  }


  /* ==========================================
     MÓDULO DE AVALIAÇÕES (REVIEWS)
     ========================================== */
  
  function renderReviews() {
    reviewsListContainer.innerHTML = '';
    const reviews = JSON.parse(localStorage.getItem('barber_reviews')) || [];
    
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
          <span class="review-author font-semibold text-text-warm">${rev.author}</span>
          <span class="review-date text-zinc-500">${rev.date}</span>
        </div>
        <div class="review-stars flex gap-0.5">${stars}</div>
        <p class="review-comment text-[0.8rem] text-zinc-400 font-light italic">"${rev.text}"</p>
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

    const currentReviews = JSON.parse(localStorage.getItem('barber_reviews')) || [];
    currentReviews.push(newRev);
    localStorage.setItem('barber_reviews', JSON.stringify(currentReviews));

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

  function renderAdminDashboard() {
    const bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    adminBookingsList.innerHTML = '';
    
    const todayFormatted = formatDate(new Date());
    const todayBookings = bookings.filter(b => b.date === todayFormatted);
    todayBookingsCount.textContent = todayBookings.length;

    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.time.localeCompare(b.time);
    });

    if (sortedBookings.length === 0) {
      adminBookingsList.innerHTML = '<p class="text-center text-xs text-zinc-500 py-6 reveal-item-tw">Sem reservas registradas no sistema.</p>';
    } else {
      sortedBookings.forEach((bk, index) => {
        const item = document.createElement('div');
        const delayClass = index < 5 ? `delay-${index + 1}` : 'delay-5';
        
        const isToday = bk.date === todayFormatted;
        const styleToday = isToday ? 'border-l-[3px] border-barber-red pl-3' : 'border-l border-white/10';

        item.className = `booking-admin-item reveal-item-tw flex justify-between items-center p-4 border border-white/5 rounded-xl bg-zinc-900/60 backdrop-blur-sm ${styleToday} ${delayClass}`;
        item.innerHTML = `
          <div class="booking-admin-info space-y-1">
            <h4 class="font-cinzel text-xs font-semibold text-text-warm tracking-wider uppercase">${bk.clientName} ${isToday ? '<span class="text-barber-red font-barlow text-[0.65rem] font-black tracking-widest">[HOJE]</span>' : ''}</h4>
            <p class="text-[0.8rem] text-zinc-400 font-semibold">${bk.serviceName} - <span class="text-gold-accent font-barlow font-bold">${formatPrice(bk.price)}</span></p>
            <p class="text-[0.72rem] text-zinc-400 font-light flex items-center gap-1"><i class="fa-regular fa-calendar"></i> ${bk.date} às ${bk.time} (${bk.duration})</p>
            <p class="text-[0.72rem] text-zinc-500 font-light flex items-center gap-1"><i class="fa-solid fa-phone"></i> ${bk.clientPhone}</p>
          </div>
          <div class="booking-admin-actions flex gap-2">
            <a href="https://wa.me/${bk.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + bk.clientName + ', gostaríamos de confirmar seu horário no dia ' + bk.date + ' às ' + bk.time + ' na JOTAGAAHBS Barbearia.')}" target="_blank" class="btn-admin-action whatsapp w-8 h-8 rounded border border-white/10 flex justify-center items-center hover:bg-green-500 hover:border-green-500 transition-all text-sm active:scale-90" title="Contatar Cliente">
              <i class="fa-brands fa-whatsapp text-text-warm"></i>
            </a>
            <button class="btn-admin-action delete w-8 h-8 rounded border border-white/10 flex justify-center items-center hover:bg-barber-red hover:border-barber-red transition-all text-sm active:scale-90" data-id="${bk.id}" title="Cancelar Reserva">
              <i class="fa-solid fa-trash-can text-text-warm"></i>
            </button>
          </div>
        `;

        item.querySelector('.btn-admin-action.delete').addEventListener('click', () => {
          if (confirm(`Deseja realmente cancelar a reserva de ${bk.clientName}?`)) {
            deleteBooking(bk.id);
          }
        });

        adminBookingsList.appendChild(item);
      });
    }

    renderBlockedDates();
  }

  function deleteBooking(id) {
    let bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem('barber_bookings', JSON.stringify(bookings));
    showToast('Reserva cancelada!', 'success');
    renderAdminDashboard();
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

    let blocked = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];
    if (blocked.includes(dateVal)) {
      showToast('Esta data já está bloqueada.', 'warning');
      return;
    }

    blocked.push(dateVal);
    localStorage.setItem('barber_blocked_dates', JSON.stringify(blocked));
    showToast('Data bloqueada com sucesso!', 'success');
    blockDateInput.value = '';

    renderBlockedDates();
  });

  function renderBlockedDates() {
    adminBlockedDatesList.innerHTML = '';
    const blocked = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];

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
    let blocked = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];
    blocked = blocked.filter(d => d !== dateStr);
    localStorage.setItem('barber_blocked_dates', JSON.stringify(blocked));
    showToast('Data desbloqueada com sucesso!', 'success');
    renderBlockedDates();
  }

  // Inicializa o roteamento SPA para a home screen
  navigateTo('home-screen');

});
