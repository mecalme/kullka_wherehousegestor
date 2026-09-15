// Configuração do Supabase
const SUPABASE_URL = 'https://wyqdacpheshiqtvdwdke.supabase.co';
const SUPABASE_KEY = 'sb_publishable_...'; // Insira sua chave real aqui

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Controle de Estado Global (Garante uma única declaração para evitar SyntaxError)
if (typeof idEnderecoEdicao === 'undefined') {
  var idEnderecoEdicao = null;
} else {
  idEnderecoEdicao = null;
}