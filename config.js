// Configuração Segura do Supabase
const SUPABASE_URL = 'https://wyqdacpheshiqtvdwdke.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sAI3Y4Aszx_ho4Z_ZSM_WQ_TAMDIe9v'; // Chave pública; nunca use service_role no frontend.

const supabaseClient = (() => {
  if (typeof window === 'undefined' || !window.supabase) {
    console.warn('Supabase não inicializado: a biblioteca cliente não foi carregada no escopo.');
    return null;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY.includes('...') || SUPABASE_KEY.includes('SUA_CHAVE')) {
    console.warn('Supabase não configurado: Insira as credenciais válidas em config.js.');
    return null;
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
})();

// Controle de Estado Global Isolado
window.idEnderecoEdicao = window.idEnderecoEdicao ?? null;