/**
 * LOGICA DA APLICACAO - JOTAGAAHBS BARBEARIA POR ASSINATURA
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
     ESTADO GLOBAL DA APLICACAO
     ========================================== */
  let appState = {
    currentScreen: 'home-screen',
    booking: {
      step: 1,
      selectedService: null,
      selectedDate: null, // Objeto Date
      selectedTime: null, // String "HH:MM"
      clientName: '',
      clientPhone: ''
    },
    calendar: {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear()
    },
    admin: {
      isAuthenticated: false
    }
  };

  // Cliques no logotipo para ativação do painel secreto
  let logoClickCount = 0;
  let logoClickTimer = null;

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

  /* ==========================================
     ELEMENTOS DO DOM
     ========================================== */
  const screens = document.querySelectorAll('.app-screen');
  const navItems = document.querySelectorAll('.nav-item');
  const logoTrigger = document.getElementById('secret-admin-trigger');
  
  // Telas Específicas
  const homeScreen = document.getElementById('home-screen');
  const bookingScreen = document.getElementById('booking-screen');
  const reviewsScreen = document.getElementById('reviews-screen');
  const adminScreen = document.getElementById('admin-screen');
  
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

  // Elementos de Admin
  const adminLoginLock = document.getElementById('admin-login-lock');
  const adminDashboard = document.getElementById('admin-dashboard');
  const adminPasswordInput = document.getElementById('admin-password');
  const btnLoginAdmin = document.getElementById('btn-login-admin');
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminPanes = document.querySelectorAll('.admin-pane');
  const adminBookingsList = document.getElementById('admin-bookings-list');
  const todayBookingsCount = document.getElementById('today-bookings-count');
  const blockDateInput = document.getElementById('block-date-input');
  const btnBlockDate = document.getElementById('btn-block-date');
  const adminBlockedDatesList = document.getElementById('admin-blocked-dates-list');
  const btnLogoutAdmin = document.getElementById('btn-logout-admin');

  // Toast Container
  const toastContainer = document.getElementById('toast-container-global');

  /* ==========================================
     FUNÇÕES AUXILIARES / TOAST / FORMATADORES
     ========================================== */
  
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    // Auto-remove após 4 segundos com animação fade-out
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
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

  // Máscara para o telefone brasileiro (15) 99999-9999
  inputBookingPhone.addEventListener('input', (e) => {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
  });

  // Atualizar o status "Hoje" no Home
  function updateTodayStatus() {
    const today = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    if (today === 0 || today === 1) {
      todayStatusText.textContent = 'Fechado';
      todayStatusText.style.color = 'var(--accent-red)';
    } else {
      todayStatusText.textContent = 'Aberto';
      todayStatusText.style.color = '#25D366'; // Verde suave
    }
  }
  updateTodayStatus();

  /* ==========================================
     ROTEADOR SPA (SINGLE PAGE APPLICATION)
     ========================================== */
  function navigateTo(screenId) {
    // Tratar se for Admin e não autenticado
    if (screenId === 'admin-screen' && !appState.admin.isAuthenticated) {
      adminLoginLock.style.display = 'flex';
      adminDashboard.classList.remove('active');
    } else if (screenId === 'admin-screen' && appState.admin.isAuthenticated) {
      adminLoginLock.style.display = 'none';
      adminDashboard.classList.add('active');
      renderAdminDashboard();
    }

    screens.forEach(screen => {
      if (screen.id === screenId) {
        screen.classList.add('active');
      } else {
        screen.classList.remove('active');
      }
    });

    // Atualiza navegação inferior
    navItems.forEach(item => {
      if (item.getAttribute('data-screen') === screenId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Atualiza estado global
    appState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ações ao entrar nas telas
    if (screenId === 'booking-screen') {
      renderServicesList();
      updateBookingFlowUI();
    } else if (screenId === 'reviews-screen') {
      renderReviews();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-screen');
      navigateTo(target);
    });
  });

  // CTAs no Home
  homeBookingCta.addEventListener('click', () => navigateTo('booking-screen'));
  homeViewServicesBtn.addEventListener('click', () => {
    navigateTo('booking-screen');
    // Forçar início no passo 1
    appState.booking.step = 1;
    updateBookingFlowUI();
  });

  /* ==========================================
     TRIGGER SECRETO DO LOGO (ADMIN)
     ========================================== */
  logoTrigger.addEventListener('click', () => {
    logoClickCount++;
    
    // Mostra toast discreto nos cliques
    if (logoClickCount > 1 && logoClickCount < 5) {
      showToast(`Tentativa de acesso de segurança... (${logoClickCount}/5)`, 'warning');
    }

    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => {
      logoClickCount = 0;
    }, 3000); // 3 segundos para bater 5 cliques

    if (logoClickCount === 5) {
      logoClickCount = 0;
      showToast('Acesso administrativo iniciado!', 'success');
      navigateTo('admin-screen');
    }
  });

  /* ==========================================
     FLUXO DE AGENDAMENTO (5 PASSOS)
     ========================================== */

  // 1. Renderiza lista de Serviços do Agendamento (Passo 1)
  function renderServicesList() {
    servicesListGrid.innerHTML = '';
    SERVICES.forEach(service => {
      const card = document.createElement('article');
      card.className = `booking-service-card ${appState.booking.selectedService?.id === service.id ? 'selected' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="service-item-info">
          <h4>${service.name}</h4>
          <p>${service.desc}</p>
          <span style="font-size: 0.75rem; color: var(--gold); display: block; margin-top: 0.3rem;"><i class="fa-regular fa-clock"></i> ${service.duration}</span>
        </div>
        <span class="service-item-price" style="font-size: 1.25rem;">${formatPrice(service.price)}</span>
      `;
      
      card.addEventListener('click', () => {
        appState.booking.selectedService = service;
        document.querySelectorAll('.booking-service-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        // Avanço automático suave após escolher serviço
        setTimeout(() => {
          appState.booking.step = 2;
          updateBookingFlowUI();
        }, 300);
      });

      servicesListGrid.appendChild(card);
    });
  }

  // 2. Calendário Personalizado (Passo 2)
  function renderCalendar() {
    calendarDaysGrid.innerHTML = '';
    
    const year = appState.calendar.currentYear;
    const month = appState.calendar.currentMonth;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Setar o título do Mês/Ano
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    calendarCurrentMonthText.textContent = `${monthNames[month]} ${year}`;

    // Buscar bloqueios e agendamentos existentes
    const blockedDates = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];
    const todayStr = new Date().toDateString();

    // Dias vazios (antes do primeiro dia do mês)
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell disabled';
      calendarDaysGrid.appendChild(emptyCell);
    }

    // Preencher dias reais
    for (let day = 1; day <= lastDay; day++) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      cell.textContent = day;

      const cellDateStr = cellDate.toDateString();
      const cellDayOfWeek = cellDate.getDay(); // 0 = Dom, 1 = Seg
      
      // Formato YYYY-MM-DD para checar bloqueio
      const isoDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Regras de desativação:
      // - Datas anteriores ao dia de hoje
      // - Domingos (0) e Segundas (1)
      // - Datas especificamente bloqueadas pelo Administrador
      const isPast = new Date(year, month, day, 23, 59, 59) < new Date();
      const isClosed = cellDayOfWeek === 0 || cellDayOfWeek === 1;
      const isBlocked = blockedDates.includes(isoDateStr);

      if (isPast || isClosed || isBlocked) {
        cell.classList.add('disabled');
      } else {
        // Se for hoje
        if (cellDateStr === todayStr) {
          cell.classList.add('today');
        }
        
        // Se estiver selecionado
        if (appState.booking.selectedDate && appState.booking.selectedDate.toDateString() === cellDateStr) {
          cell.classList.add('selected');
        }

        cell.addEventListener('click', () => {
          appState.booking.selectedDate = cellDate;
          // Limpa horário anterior caso mude de data
          appState.booking.selectedTime = null;
          
          document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          
          // Avançar suavemente para o passo 3
          setTimeout(() => {
            appState.booking.step = 3;
            updateBookingFlowUI();
          }, 300);
        });
      }

      calendarDaysGrid.appendChild(cell);
    }
  }

  // Navegar no Mês
  prevMonthBtn.addEventListener('click', () => {
    // Não permitir navegar para meses passados em relação ao mês corrente real
    const realDate = new Date();
    if (appState.calendar.currentYear === realDate.getFullYear() && appState.calendar.currentMonth === realDate.getMonth()) {
      showToast('Não é possível agendar em meses passados.', 'error');
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

  // 3. Renderiza Slots de Horários (Passo 3)
  function renderTimeSlots() {
    timeSlotsGrid.innerHTML = '';
    
    if (!appState.booking.selectedDate) return;

    const dayOfWeek = appState.booking.selectedDate.getDay();
    let slots = [];
    
    // Ter-Sex das 08:00 às 20:00 | Sábado das 08:00 às 19:00
    // Gerar grade horária de hora em hora
    const startHour = 8;
    const endHour = (dayOfWeek === 6) ? 19 : 20;

    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${String(hour).padStart(2, '0')}:00`;
      slots.push(timeString);
    }

    // Carregar agendamentos já ocupados para esta mesma data
    const bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    const selectedDateFormatted = formatDate(appState.booking.selectedDate);
    const occupiedTimes = bookings
      .filter(b => b.date === selectedDateFormatted)
      .map(b => b.time);

    slots.forEach(time => {
      const btn = document.createElement('button');
      btn.className = `time-slot-btn ${appState.booking.selectedTime === time ? 'selected' : ''}`;
      btn.textContent = time;

      const isOccupied = occupiedTimes.includes(time);
      
      // Validador de horário passado para o dia de hoje
      const isToday = appState.booking.selectedDate.toDateString() === new Date().toDateString();
      const currentHourReal = new Date().getHours();
      const slotHour = parseInt(time.split(':')[0]);
      const isPastSlot = isToday && slotHour <= currentHourReal;

      if (isOccupied || isPastSlot) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          appState.booking.selectedTime = time;
          document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          
          // Avançar suavemente
          setTimeout(() => {
            appState.booking.step = 4;
            updateBookingFlowUI();
          }, 300);
        });
      }

      timeSlotsGrid.appendChild(btn);
    });

    if (timeSlotsGrid.children.length === 0) {
      timeSlotsGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; width: 100%;">Não há horários disponíveis para este dia.</p>';
    }
  }

  // 4. Renderiza Confirmação/Recibo (Passo 5)
  function renderConfirmationReceipt() {
    if (!appState.booking.selectedService || !appState.booking.selectedDate || !appState.booking.selectedTime) return;

    receiptServiceName.textContent = appState.booking.selectedService.name;
    receiptDate.textContent = formatDate(appState.booking.selectedDate);
    receiptTime.textContent = `${appState.booking.selectedTime} (${appState.booking.selectedService.duration})`;
    receiptClientName.textContent = appState.booking.clientName;
    receiptPrice.textContent = formatPrice(appState.booking.selectedService.price);
  }

  // 5. Controlador de Fluxo do Booking
  function updateBookingFlowUI() {
    const step = appState.booking.step;

    // Atualizar Barra de Progresso
    const percentage = ((step - 1) / 4) * 100;
    progressFill.style.width = `${percentage}%`;

    progressDots.forEach(dot => {
      const dotStep = parseInt(dot.getAttribute('data-step'));
      if (dotStep < step) {
        dot.className = 'progress-step-dot completed';
        dot.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else if (dotStep === step) {
        dot.className = 'progress-step-dot active';
        dot.textContent = dotStep;
      } else {
        dot.className = 'progress-step-dot';
        dot.textContent = dotStep;
      }
    });

    // Mudar os panes visuais
    stepPanes.forEach(pane => {
      const paneId = pane.id;
      if (paneId === `step-pane-${step}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Controlar Botões de Ação
    if (step === 1) {
      btnBookingBack.classList.add('d-none');
    } else {
      btnBookingBack.classList.remove('d-none');
    }

    if (step === 5) {
      btnBookingNext.innerHTML = '<i class="fa-brands fa-whatsapp"></i> FINALIZAR NO WHATSAPP';
      btnBookingNext.style.backgroundColor = '#25D366';
      btnBookingNext.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      btnBookingNext.style.boxShadow = '0 0 20px rgba(37, 211, 102, 0.4)';
    } else {
      btnBookingNext.textContent = 'AVANÇAR';
      btnBookingNext.style.backgroundColor = '';
      btnBookingNext.style.borderColor = '';
      btnBookingNext.style.boxShadow = '';
    }

    // Trigger de ações em passos específicos
    if (step === 2) {
      renderCalendar();
    } else if (step === 3) {
      renderTimeSlots();
    } else if (step === 5) {
      renderConfirmationReceipt();
    }
  }

  // Navegação no Fluxo - Ação do Botão Avançar
  btnBookingNext.addEventListener('click', () => {
    const step = appState.booking.step;

    if (step === 1) {
      if (!appState.booking.selectedService) {
        showToast('Por favor, selecione um procedimento para continuar.', 'error');
        return;
      }
      appState.booking.step = 2;
    } 
    else if (step === 2) {
      if (!appState.booking.selectedDate) {
        showToast('Escolha um dia disponível no calendário.', 'error');
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
        showToast('Insira seu nome completo (mínimo 3 letras).', 'error');
        inputBookingName.focus();
        return;
      }
      if (!phone || phone.length < 14) { // (99) 99999-9999 tem 15 caracteres
        showToast('Insira um número de WhatsApp válido.', 'error');
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

  // Ação do Botão Voltar
  btnBookingBack.addEventListener('click', () => {
    if (appState.booking.step > 1) {
      appState.booking.step--;
      updateBookingFlowUI();
    }
  });

  // Salvar no Banco e Redirecionar para WhatsApp
  function executeFinalBooking() {
    const b = appState.booking;
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
      createdAt: new Date().toISOString()
    };

    // Salvar localmente
    const currentBookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    currentBookings.push(newBooking);
    localStorage.setItem('barber_bookings', JSON.stringify(currentBookings));

    // Formatar texto para o WhatsApp com quebra de linha de forma premium e elegante
    const whatsappText = encodeURIComponent(
`💈 *JOTAGAAHBS Barbearia por Assinatura* 💈
Olá! Acabei de realizar um agendamento premium:

👤 *Cliente:* ${b.clientName}
📞 *Contato:* ${b.clientPhone}
💇‍♂️ *Serviço:* ${b.selectedService.name}
💰 *Valor:* ${formatPrice(b.selectedService.price)}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${b.selectedTime} (${b.selectedService.duration})

_Por favor, confirme meu horário no sistema! Obrigado._`
    );

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

    showToast('Agendamento salvo com sucesso! Abrindo WhatsApp...', 'success');

    // Redirecionar após pequeno delay
    setTimeout(() => {
      window.open(targetUrl, '_blank');
      
      // Resetar estado de agendamento e voltar ao Home
      appState.booking = {
        step: 1,
        selectedService: null,
        selectedDate: null,
        selectedTime: null,
        clientName: '',
        clientPhone: ''
      };
      
      inputBookingName.value = '';
      inputBookingPhone.value = '';
      
      navigateTo('home-screen');
    }, 1500);
  }


  /* ==========================================
     MÓDULO DE AVALIAÇÕES (REVIEWS)
     ========================================== */
  
  // Renderizar a lista de depoimentos e estatísticas gerais
  function renderReviews() {
    reviewsListContainer.innerHTML = '';
    const reviews = JSON.parse(localStorage.getItem('barber_reviews')) || [];
    
    // Calcular estatísticas
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.score, 0);
      const avg = sum / reviews.length;
      avgRatingValue.textContent = avg.toFixed(1);
      reviewsCountLabel.textContent = `Baseado em ${reviews.length} avaliações`;

      // Atualizar as estrelas do resumo
      let starsHtml = '';
      const fullStars = Math.floor(avg);
      const hasHalf = avg % 1 >= 0.5;

      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          starsHtml += '<i class="fa-solid fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalf) {
          starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
          starsHtml += '<i class="fa-regular fa-star" style="color: var(--text-muted);"></i>';
        }
      }
      avgStarsRow.innerHTML = starsHtml;
    }

    // Renderizar itens da lista de comentários
    // Mostrar as mais recentes primeiro (reverse)
    [...reviews].reverse().forEach(rev => {
      const reviewItem = document.createElement('article');
      reviewItem.className = 'review-item';
      
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rev.score) {
          stars += '<i class="fa-solid fa-star"></i> ';
        } else {
          stars += '<i class="fa-regular fa-star" style="color: var(--text-muted);"></i> ';
        }
      }

      reviewItem.innerHTML = `
        <div class="review-header">
          <span class="review-author">${rev.author}</span>
          <span class="review-date">${rev.date}</span>
        </div>
        <div class="review-stars">${stars}</div>
        <p class="review-comment">"${rev.text}"</p>
      `;

      reviewsListContainer.appendChild(reviewItem);
    });
  }

  // Interatividade das Estrelas do Formulário
  let selectedScoreForm = 5;
  const starIcons = starsSelector.querySelectorAll('i');

  starIcons.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-value'));
      selectedScoreForm = val;

      starIcons.forEach(icon => {
        const iconVal = parseInt(icon.getAttribute('data-value'));
        if (iconVal <= val) {
          icon.className = 'fa-solid fa-star selected';
        } else {
          icon.className = 'fa-regular fa-star';
        }
      });
    });
  });

  // Enviar Avaliação
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
      showToast('Por favor, conte um pouco sobre sua experiência.', 'error');
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

    showToast('Muito obrigado! Sua avaliação premium foi enviada.', 'success');

    // Limpar formulário
    reviewAuthorNameInput.value = '';
    reviewCommentTextInput.value = '';
    selectedScoreForm = 5;
    starIcons.forEach(icon => icon.className = 'fa-solid fa-star selected');

    // Recarregar
    renderReviews();
  });


  /* ==========================================
     ÁREA ADMINISTRATIVA (ADMIN)
     ========================================== */

  // Executar login
  btnLoginAdmin.addEventListener('click', () => {
    const password = adminPasswordInput.value;

    if (password === 'jota2024') {
      appState.admin.isAuthenticated = true;
      adminLoginLock.style.display = 'none';
      adminDashboard.classList.add('active');
      adminPasswordInput.value = '';
      showToast('Acesso de Administrador Autorizado!', 'success');
      renderAdminDashboard();
    } else {
      showToast('Senha de acesso incorreta.', 'error');
      adminPasswordInput.focus();
      adminPasswordInput.value = '';
    }
  });

  // Deslogar
  btnLogoutAdmin.addEventListener('click', () => {
    appState.admin.isAuthenticated = false;
    adminDashboard.classList.remove('active');
    adminLoginLock.style.display = 'flex';
    showToast('Sessão encerrada com segurança.');
    navigateTo('home-screen');
  });

  // Alternar abas do painel admin
  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      adminTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      adminPanes.forEach(pane => {
        if (pane.id === tabId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // Renderizar o Painel Administrativo
  function renderAdminDashboard() {
    // 1. Renderizar Agendamentos
    const bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    adminBookingsList.innerHTML = '';
    
    // Contagem de hoje
    const todayFormatted = formatDate(new Date());
    const todayBookings = bookings.filter(b => b.date === todayFormatted);
    todayBookingsCount.textContent = todayBookings.length;

    // Ordenar por data e horário (mais recentes/futuros primeiro)
    const sortedBookings = [...bookings].sort((a, b) => {
      // Comparação simples de datas no formato DD/MM/YYYY
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return a.time.localeCompare(b.time);
    });

    if (sortedBookings.length === 0) {
      adminBookingsList.innerHTML = '<p class="text-center" style="padding: 2rem 0; color: var(--text-muted); font-size: 0.85rem;">Nenhum agendamento registrado até o momento.</p>';
    } else {
      sortedBookings.forEach(bk => {
        const item = document.createElement('div');
        item.className = 'booking-admin-item';
        
        // Determinar se o agendamento é hoje para destacar
        const isToday = bk.date === todayFormatted;
        const styleToday = isToday ? 'border-left: 3px solid var(--accent-red); padding-left: 0.8rem;' : '';

        item.setAttribute('style', styleToday);
        item.innerHTML = `
          <div class="booking-admin-info">
            <h4>${bk.clientName} ${isToday ? '<span style="color: var(--accent-red); font-size: 0.7rem; font-weight: 900; text-transform: uppercase;">[HOJE]</span>' : ''}</h4>
            <p style="color: var(--text-light); font-weight: 500; font-size: 0.8rem;" class="mt-1">${bk.serviceName} - <span style="color: var(--gold);">${formatPrice(bk.price)}</span></p>
            <p style="font-size: 0.75rem;"><i class="fa-regular fa-calendar"></i> ${bk.date} às ${bk.time} (${bk.duration})</p>
            <p style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-phone"></i> ${bk.clientPhone}</p>
          </div>
          <div class="booking-admin-actions">
            <a href="https://wa.me/${bk.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá ' + bk.clientName + ', gostaríamos de confirmar seu horário no dia ' + bk.date + ' às ' + bk.time + ' na JOTAGAAHBS Barbearia.')}" target="_blank" class="btn-admin-action whatsapp" title="Enviar WhatsApp para cliente">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <button class="btn-admin-action delete" data-id="${bk.id}" title="Excluir Agendamento">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `;

        // Lógica de Deletar Agendamento
        item.querySelector('.btn-admin-action.delete').addEventListener('click', () => {
          if (confirm(`Deseja realmente cancelar e excluir o agendamento de ${bk.clientName}?`)) {
            deleteBooking(bk.id);
          }
        });

        adminBookingsList.appendChild(item);
      });
    }

    // 2. Renderizar Bloqueios
    renderBlockedDates();
  }

  // Deletar Agendamento
  function deleteBooking(id) {
    let bookings = JSON.parse(localStorage.getItem('barber_bookings')) || [];
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem('barber_bookings', JSON.stringify(bookings));
    showToast('Agendamento cancelado e removido!', 'success');
    renderAdminDashboard();
  }

  // Adicionar bloqueio de data
  btnBlockDate.addEventListener('click', (e) => {
    e.preventDefault();
    const dateVal = blockDateInput.value; // YYYY-MM-DD

    if (!dateVal) {
      showToast('Por favor, selecione uma data válida para bloquear.', 'error');
      return;
    }

    // Validador de data passada
    const selected = new Date(dateVal + 'T23:59:59');
    if (selected < new Date()) {
      showToast('Não é possível bloquear uma data no passado.', 'error');
      return;
    }

    let blocked = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];
    if (blocked.includes(dateVal)) {
      showToast('Esta data já se encontra bloqueada.', 'warning');
      return;
    }

    blocked.push(dateVal);
    localStorage.setItem('barber_blocked_dates', JSON.stringify(blocked));
    showToast('Data bloqueada com sucesso!', 'success');
    blockDateInput.value = '';

    renderBlockedDates();
  });

  // Renderizar a lista de bloqueios no painel
  function renderBlockedDates() {
    adminBlockedDatesList.innerHTML = '';
    const blocked = JSON.parse(localStorage.getItem('barber_blocked_dates')) || [];

    if (blocked.length === 0) {
      adminBlockedDatesList.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center;">Nenhuma data bloqueada.</p>';
      return;
    }

    // Ordenar bloqueios
    blocked.sort().forEach(dateStr => {
      // Formata data de YYYY-MM-DD para DD/MM/YYYY
      const parts = dateStr.split('-');
      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;

      const item = document.createElement('div');
      item.className = 'blocked-date-item';
      item.innerHTML = `
        <span><i class="fa-regular fa-calendar-times" style="color: var(--accent-red); margin-right: 0.5rem;"></i> ${formatted}</span>
        <button class="btn-admin-action delete" style="width: 26px; height: 26px;" title="Desbloquear data">
          <i class="fa-solid fa-xmark"></i>
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

});
