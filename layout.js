// -------------------------------------------------------------
// TELA DE CADASTRO DE PRODUTOS E LAYOUT LOGÍSTICO (REFATORADO)
// -------------------------------------------------------------

const PRODUTOS_KEY = 'kullka_produtos';
const LAYOUT_KEY = 'kullka_layout_logistico';
const LAYOUT_OPCOES_KEY = 'kullka_layout_opcoes';

const PRODUTO_CAMPOS = [
  ['codigo', 'Código / SKU', 'text'], ['gtin', 'GTIN / EAN', 'text'], ['nome', 'Nome / Descrição principal', 'text'],
  ['descricaoCurta', 'Descrição reduzida / curta', 'text'], ['categoria', 'Categoria', 'text'], ['subcategoria', 'Subcategoria', 'text'],
  ['marca', 'Marca / Fabricante', 'text'], ['status', 'Status', 'select'], ['ncm', 'NCM', 'text'], ['cest', 'CEST', 'text'],
  ['cfop', 'CFOP', 'text'], ['origemMercadoria', 'Origem da mercadoria', 'select'], ['regimeTributario', 'Regime tributário', 'select'],
  ['csosn', 'CSOSN', 'text'], ['cst', 'CST', 'text'], ['pisCofinsCst', 'CST PIS / COFINS', 'text'], ['pisCofinsAliquota', 'Alíquota PIS / COFINS (%)', 'number'],
  ['ipiCst', 'CST IPI', 'text'], ['ipiAliquota', 'Alíquota IPI (%)', 'number'], ['unidadeFiscal', 'Unidade comercializada na NF-e', 'text'],
  ['precoCusto', 'Preço de custo', 'number'], ['custoAdicional', 'Custo adicional / frete rateado', 'number'], ['margemLucro', 'Margem de lucro (%)', 'number'],
  ['preco', 'Preço de venda', 'number'], ['precoMinimo', 'Preço mínimo / atacado', 'number'], ['unidade', 'Unidade de medida interna', 'select'],
  ['fatorConversao', 'Fator de conversão', 'number'], ['estoque', 'Estoque atual', 'number'], ['estoqueMinimo', 'Estoque mínimo / ponto de pedido', 'number'],
  ['estoqueMaximo', 'Estoque máximo', 'number'], ['pesoBruto', 'Peso bruto (kg)', 'number'], ['pesoLiquido', 'Peso líquido (kg)', 'number'],
  ['altura', 'Altura (cm)', 'number'], ['largura', 'Largura (cm)', 'number'], ['comprimento', 'Comprimento (cm)', 'number'],
  ['localizacao', 'Localização logística', 'text'], ['controlaLoteValidade', 'Controla lote e validade', 'select'], ['numeroSerie', 'Número de série', 'text']
];

function valorProduto(produto, campo, padrao = '') {
  return produto && produto[campo] !== undefined && produto[campo] !== null ? produto[campo] : padrao;
}

function escaparTexto(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function opcoesProduto(campo) {
  const opcoes = {
    status: [['ativo', 'Ativo'], ['inativo', 'Inativo'], ['descontinuado', 'Descontinuado']],
    origemMercadoria: [['0', '0 - Nacional'], ['1', '1 - Estrangeira: importação direta'], ['2', '2 - Estrangeira: mercado interno']],
    regimeTributario: [['simples_nacional', 'Simples Nacional'], ['normal', 'Normal']],
    unidade: [['un', 'UN - Unidade'], ['cx', 'CX - Caixa'], ['kg', 'KG - Quilograma'], ['lt', 'LT - Litro'], ['pc', 'PC - Peça'], ['m2', 'M2 - Metro quadrado']],
    controlaLoteValidade: [['nao', 'Não'], ['sim', 'Sim']]
  };
  return opcoes[campo] || [];
}

function obterProdutos() {
  try {
    const dados = JSON.parse(localStorage.getItem(PRODUTOS_KEY));
    if (Array.isArray(dados) && dados.length > 0) return dados;
  } catch (error) {
    console.warn('Erro ao ler produtos do localStorage:', error);
  }

  return [
    { id: '1', codigo: 'PROD-001', nome: 'Caixa de Papelão M', categoria: 'Embalagens', estoque: 150, preco: 15.90, unidade: 'un' },
    { id: '2', codigo: 'PROD-002', nome: 'Fita Adesiva Larga', categoria: 'Suprimentos', estoque: 80, preco: 9.50, unidade: 'un' }
  ];
}

function salvarProdutos(produtos) {
  localStorage.setItem(PRODUTOS_KEY, JSON.stringify(produtos));
}

function gerarNovoId() {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function mostrarFormularioProduto(produto = null) {
  const form = document.getElementById('formProduto');
  if (!form) return;

  form.classList.remove('hidden');
  document.getElementById('produtoId').value = produto?.id || '';

  PRODUTO_CAMPOS.forEach(([campo]) => {
    const elemento = document.getElementById(`produto${campo.charAt(0).toUpperCase()}${campo.slice(1)}`);
    if (elemento) {
      elemento.value = valorProduto(produto, campo, campo === 'status' ? 'ativo' : campo === 'unidade' ? 'un' : campo === 'controlaLoteValidade' ? 'nao' : '');
    }
  });
}

function cancelarFormularioProduto() {
  const form = document.getElementById('formProduto');
  if (form) form.classList.add('hidden');
  document.getElementById('produtoId').value = '';
}

function salvarProdutoFormulario() {
  const produtoId = document.getElementById('produtoId')?.value || '';
  const dados = {};

  PRODUTO_CAMPOS.forEach(([campo, , tipo]) => {
    const valor = document.getElementById(`produto${campo.charAt(0).toUpperCase()}${campo.slice(1)}`)?.value || '';
    dados[campo] = tipo === 'number' ? Number(valor || 0) : valor.trim();
  });

  if (!dados.codigo || !dados.nome || !dados.categoria) {
    alert('Preencha os campos obrigatórios: Código, Nome e Categoria.');
    return;
  }

  const produtos = obterProdutos();
  const id = produtoId || gerarNovoId();
  const index = produtos.findIndex((p) => String(p.id) === String(id));

  const produtoAtualizado = { ...(index >= 0 ? produtos[index] : {}), id, ...dados };

  if (index >= 0) {
    produtos[index] = produtoAtualizado;
  } else {
    produtos.push(produtoAtualizado);
  }

  salvarProdutos(produtos);
  carregarTelaProdutos();
}

function editarProduto(idProduto) {
  const produtos = obterProdutos();
  const produto = produtos.find((p) => String(p.id) === String(idProduto));
  if (!produto) return;
  mostrarFormularioProduto(produto);
}

function excluirProduto(idProduto) {
  if (!confirm('Deseja realmente excluir este produto?')) return;
  const produtos = obterProdutos().filter((p) => String(p.id) !== String(idProduto));
  salvarProdutos(produtos);
  carregarTelaProdutos();
}

function renderizarCampoProduto(campo, nome, tipo = 'text') {
  const id = `produto${campo.charAt(0).toUpperCase()}${campo.slice(1)}`;
  if (tipo === 'select') {
    return `
      <label class="block">
        <span class="text-sm font-medium text-slate-700">${nome}</span>
        <select id="${id}" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500">
          ${opcoesProduto(campo).map(([valor, texto]) => `<option value="${valor}">${texto}</option>`).join('')}
        </select>
      </label>`;
  }
  return `
    <label class="block">
      <span class="text-sm font-medium text-slate-700">${nome}</span>
      <input id="${id}" type="${tipo}" ${tipo === 'number' ? 'min="0" step="0.01"' : ''} class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500" />
    </label>`;
}

function carregarTelaProdutos() {
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  const produtos = obterProdutos();

  main.innerHTML = `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Cadastro</p>
            <h1 class="text-2xl font-bold text-slate-800">Produtos</h1>
          </div>
          <button type="button" onclick="mostrarFormularioProduto()" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition">
            <i class="fa-solid fa-plus"></i> Novo Produto
          </button>
        </div>

        <div id="formProduto" class="hidden px-6 py-5 border-b border-slate-200">
          <form onsubmit="salvarProdutoFormulario(); return false;">
            <input type="hidden" id="produtoId" value="" />
            ${[
              ['Informações Básicas e Identificação', [['codigo', 'Código / SKU', 'text'], ['gtin', 'GTIN / EAN', 'text'], ['nome', 'Nome / Descrição Principal', 'text'], ['descricaoCurta', 'Descrição Curta', 'text'], ['categoria', 'Categoria', 'text'], ['subcategoria', 'Subcategoria', 'text'], ['marca', 'Marca', 'text'], ['status', 'Status', 'select']]],
              ['Dados Fiscais e Tributários', [['ncm', 'NCM', 'text'], ['cest', 'CEST', 'text'], ['cfop', 'CFOP', 'text'], ['origemMercadoria', 'Origem', 'select'], ['regimeTributario', 'Regime Tributário', 'select'], ['csosn', 'CSOSN', 'text'], ['cst', 'CST', 'text'], ['pisCofinsCst', 'CST PIS/COFINS', 'text'], ['pisCofinsAliquota', 'Alíquota PIS/COFINS (%)', 'number'], ['ipiCst', 'CST IPI', 'text'], ['ipiAliquota', 'Alíquota IPI (%)', 'number'], ['unidadeFiscal', 'Unidade Fiscal NF-e', 'text']]],
              ['Preços e Custos', [['precoCusto', 'Preço de Custo', 'number'], ['custoAdicional', 'Custo Adicional', 'number'], ['margemLucro', 'Margem (%)', 'number'], ['preco', 'Preço de Venda', 'number'], ['precoMinimo', 'Preço Mínimo', 'number']]],
              ['Estoque e Logística', [['unidade', 'Unidade Interna', 'select'], ['fatorConversao', 'Fator Conversão', 'number'], ['estoque', 'Estoque Atual', 'number'], ['estoqueMinimo', 'Estoque Mínimo', 'number'], ['estoqueMaximo', 'Estoque Máximo', 'number'], ['pesoBruto', 'Peso Bruto (kg)', 'number'], ['pesoLiquido', 'Peso Líquido (kg)', 'number'], ['altura', 'Altura (cm)', 'number'], ['largura', 'Largura (cm)', 'number'], ['comprimento', 'Comprimento (cm)', 'number'], ['localizacao', 'Localização', 'text']]],
              ['Rastreabilidade e Lotes', [['controlaLoteValidade', 'Controla Lote/Validade', 'select'], ['numeroSerie', 'Número de Série', 'text']]]
            ].map(([titulo, campos]) => `<section class="mb-6 rounded-xl border border-slate-200 p-4 bg-slate-50/50"><h2 class="mb-4 text-base font-bold text-slate-800">${titulo}</h2><div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">${campos.map((c) => renderizarCampoProduto(...c)).join('')}</div></section>`).join('')}

            <div class="flex justify-end gap-3 mt-5">
              <button type="button" onclick="cancelarFormularioProduto()" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium">Cancelar</button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium">Salvar Produto</button>
            </div>
          </form>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200"><h2 class="text-lg font-bold text-slate-800">Catálogo de Produtos</h2></div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Código</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Categoria</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Estoque</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Preço</th>
                <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${produtos.length === 0 ? `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">Nenhum produto cadastrado.</td></tr>` : produtos.map((p) => `
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-sm font-medium text-slate-900">${escaparTexto(p.codigo)}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">${escaparTexto(p.nome)}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">${escaparTexto(p.categoria)}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">${p.estoque}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-slate-900">R$ ${Number(p.preco || 0).toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm text-right">
                    <button type="button" onclick="editarProduto('${p.id}')" class="px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium mr-1">Editar</button>
                    <button type="button" onclick="excluirProduto('${p.id}')" class="px-2.5 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 font-medium">Excluir</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}