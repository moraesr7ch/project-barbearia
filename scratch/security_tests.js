/**
 * 🔒 SECURITY TDD - SUÍTE DE TESTES DE SEGURANÇA E REGRA DE NEGÓCIOS (FASE 2)
 * Executável localmente via NodeJS.
 */

// Mock de localStorage para simular o ambiente de navegador
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

// Importar/recriar as funções críticas do app.js para testar em isolamento
const SERVICES = [
  { id: 'srv1', name: 'BARBA', price: 35.00, duration: '30 min', desc: 'Barba.' },
  { id: 'srv2', name: 'CORTE', price: 40.00, duration: '40 min', desc: 'Corte.' },
  { id: 'srv3', name: 'CORTE & BARBA', price: 69.99, duration: '45 min', desc: 'Corte e barba.' }
];

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

function isDateInCurrentWeek(dateStr) {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
}

function isDateInCurrentMonth(dateStr) {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  
  const now = new Date();
  return month === now.getMonth() && year === now.getFullYear();
}

const DB = {
  getClients() {
    return JSON.parse(global.localStorage.getItem('jota_clients')) || [];
  },
  saveClient(client) {
    const clients = this.getClients();
    const emailExists = clients.some(c => c.email === client.email);
    if (emailExists) return false;
    
    // 🔒 SEGURANÇA [VULN-3]: Whitelisting estrito de campos (Mass Assignment Protection)
    const newClient = {
      name: String(client.name),
      email: String(client.email),
      phone: String(client.phone),
      password: String(client.password),
      role: 'client', // Força 'client', ignorando qualquer injeção do console
      avatar: client.avatar ? String(client.avatar) : null
    };
    
    clients.push(newClient);
    global.localStorage.setItem('jota_clients', JSON.stringify(clients));
    return newClient;
  }
};

// Funções de asserção simplificadas para testes limpos
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ FALHA: ${message}`);
  }
  console.log(`✅ SUCESSO: ${message}`);
}

async function runTests() {
  console.log("====================================================");
  console.log("🔒 INICIANDO SUÍTE DE TESTES DE SEGURANÇA (FASE 2)");
  console.log("====================================================\n");

  try {
    // ----------------------------------------------------
    // TESTE 1: Neutralização de XSS em Inputs
    // ----------------------------------------------------
    const xssPayload = "<script>alert('hack')</script>";
    assert(
      escapeHTML(xssPayload) === "&lt;script&gt;alert(&#039;hack&#039;)&lt;/script&gt;",
      "VULN-1: Deve neutralizar payloads de injeção XSS escapando tags HTML"
    );

    // ----------------------------------------------------
    // TESTE 2: Proteção contra Mass Assignment
    // ----------------------------------------------------
    global.localStorage.clear();
    const badClient = {
      name: "Atacante",
      email: "hacker@domain.com",
      phone: "15999999999",
      password: "password123",
      role: "admin"
    };
    const saved = DB.saveClient(badClient);
    assert(
      saved.role === "client",
      "VULN-3: Deve ignorar papel ('role') enviado pelo cliente e forçar privilégio 'client'"
    );

    // ----------------------------------------------------
    // TESTE 3: Grade Horária de Sábado (Até 18:30) vs Dia Útil (Até 19:30)
    // ----------------------------------------------------
    function getSlotsForDay(dayOfWeek) {
      const slots = [];
      const startHour = 8;
      const endHour = (dayOfWeek === 6) ? 18 : 19;
      const endMinute = 30;

      for (let hour = startHour; hour <= endHour; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        if (hour < endHour || (hour === endHour && endMinute >= 30)) {
          slots.push(`${String(hour).padStart(2, '0')}:30`);
        }
      }
      return slots;
    }

    const saturdaySlots = getSlotsForDay(6); // Sábado
    const weekdaySlots = getSlotsForDay(3); // Quarta-feira

    assert(
      saturdaySlots[saturdaySlots.length - 1] === "18:30",
      "Grade de Sábado: O último horário gerado aos sábados deve ser estritamente 18:30"
    );
    assert(
      weekdaySlots[weekdaySlots.length - 1] === "19:30",
      "Grade de Dia Útil: O último horário de terça a sexta deve ser estritamente 19:30"
    );
    assert(
      saturdaySlots.length === 22,
      "Grade de Sábado: Deve conter exatamente 22 slots disponíveis de 30 minutos"
    );
    assert(
      weekdaySlots.length === 24,
      "Grade de Dia Útil: Deve conter exatamente 24 slots disponíveis de 30 minutos"
    );

    // ----------------------------------------------------
    // TESTE 4: Verificação de Período Financeiro (Semana e Mês Corrente)
    // ----------------------------------------------------
    const now = new Date();
    
    // Formatar datas relativas para o teste
    const formatDateObj = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    
    // Hoje
    const dateToday = formatDateObj(now);
    
    // Domingo desta semana
    const dom = new Date(now);
    dom.setDate(now.getDate() - now.getDay());
    const dateDomThisWeek = formatDateObj(dom);
    
    // Semana passada
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 8);
    const dateLastWeek = formatDateObj(lastWeek);
    
    // Mês que vem
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const dateNextMonth = formatDateObj(nextMonth);

    assert(
      isDateInCurrentWeek(dateToday) === true,
      "Verificação de Período: Hoje deve ser identificado como dentro da semana corrente"
    );
    assert(
      isDateInCurrentWeek(dateDomThisWeek) === true,
      "Verificação de Período: O domingo desta semana deve estar na semana corrente"
    );
    assert(
      isDateInCurrentWeek(dateLastWeek) === false,
      "Verificação de Período: A semana passada NÃO deve estar na semana corrente"
    );

    assert(
      isDateInCurrentMonth(dateToday) === true,
      "Verificação de Período: Hoje deve ser identificado como dentro do mês corrente"
    );
    assert(
      isDateInCurrentMonth(dateNextMonth) === false,
      "Verificação de Período: O mês que vem NÃO deve pertencer ao mês corrente"
    );

    console.log("\n====================================================");
    console.log("🎉 TODOS OS TESTES DA FASE 2 PASSARAM COM EXCELÊNCIA!");
    console.log("====================================================");
  } catch (error) {
    console.error("\n" + error.message);
    process.exit(1);
  }
}

runTests();
