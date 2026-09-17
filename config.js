// Configuração Segura do Supabase
const SUPABASE_URL = 'https://wyqdacpheshiqtvdwdke.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_PUBLICA_ANON_AQUI'; // Utilize APENAS a chave pública/anon

const supabaseClient = (() => {
  if (typeof window === 'undefined' || !window.supabase) {
    console.warn('Supabase não inicializado: a biblioteca cliente não foi carregada no escopo.');
    return null;
  }

  if (!SUPABASE_URL || SUPABASE_URL.includes('...') || !SUPABASE_KEY || SUPABASE_KEY.includes('...')) {
    console.warn('Supabase não configurado: Insira as credenciais válidas em config.js.');
    return null;
  }

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
})();

// Controle de Estado Global Isolado
window.idEnderecoEdicao = window.idEnderecoEdicao ?? null;