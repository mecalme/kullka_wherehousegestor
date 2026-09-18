// Cadastro de produtos conectado à tabela produtos da Supabase.

const PRODUTOS_TABELA = 'produtos';
let produtosEmMemoria = [];
let filtroProdutos = { busca: '', categoria: '' };
let colunasProdutos = {
  sku: 'sku',
  ean13: 'ean13',
  descricao: 'descricao',
  marca: 'marca',
  unidade_medida: 'unidade_medida',
  categoria: 'categoria'
};

const COLUNAS_ORIGINAIS_PRODUTOS = {
  sku: 'SKU',
  ean13: 'EAN-13',
  descricao: 'Descrição',
  marca: 'Marca',
  unidade_medida: 'Unidade de Medida (UM)',
  categoria: 'Categoria'
};

function escaparTexto(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function clienteProdutosDisponivel() {
  return typeof supabaseClient !== 'undefined' && supabaseClient;
}

function mensagemErroSupabase(error) {
  if (!error) return 'Não foi possível concluir a operação.';
  if (error.code === '42501' || error.code === 'PGRST301') return 'A operação foi bloqueada pelas políticas RLS da Supabase.';
  if (error.code === '23505') return 'Já existe um produto com este EAN-13.';
  return error.message || 'Não foi possível concluir a operação.';
}

function validarProduto(dados) {
  if (!dados.sku || !dados.ean13 || !dados.descricao) return 'Preencha SKU, EAN-13 e descrição.';
  if (!/^\d{13}$/.test(dados.ean13)) return 'O EAN-13 deve conter exatamente 13 dígitos.';
  return '';
}

async function obterProdutos() {
  if (!clienteProdutosDisponivel()) throw new Error('Supabase não está configurado. Verifique config.js.');

  const { data, error } = await supabaseClient
    .from(PRODUTOS_TABELA)
    .select('*');

  if (error) throw error;
  if (Array.isArray(data) && data.length > 0) {
    const camposDisponiveis = Object.keys(data[0]);
    const encontrouNormalizadas = Object.values(colunasProdutos).every((campo) => camposDisponiveis.includes(campo));
    colunasProdutos = encontrouNormalizadas ? colunasProdutos : COLUNAS_ORIGINAIS_PRODUTOS;
  }
  return (Array.isArray(data) ? data : []).map((produto) => ({
    sku: produto[colunasProdutos.sku],
    ean13: produto[colunasProdutos.ean13],
    descricao: produto[colunasProdutos.descricao],
    marca: produto[colunasProdutos.marca],
    unidade_medida: produto[colunasProdutos.unidade_medida],
    categoria: produto[colunasProdutos.categoria]
  })).sort((a, b) => String(a.descricao ?? '').localeCompare(String(b.descricao ?? ''), 'pt-BR'));
}

function payloadProduto(produto) {
  return {
    [colunasProdutos.sku]: Number(produto.sku),
    [colunasProdutos.ean13]: Number(produto.ean13),
    [colunasProdutos.descricao]: produto.descricao,
    [colunasProdutos.marca]: produto.marca || null,
    [colunasProdutos.unidade_medida]: produto.unidade_medida || null,
    [colunasProdutos.categoria]: produto.categoria || null
  };
}

function erroColunaInexistente(error) {
  return error?.code === '42703' || /column .* does not exist/i.test(error?.message || '');
}

function valoresProdutosFiltrados() {
  const busca = filtroProdutos.busca.trim().toLowerCase();
  return produtosEmMemoria.filter((produto) => {
    const correspondeBusca = !busca || [produto.sku, produto.ean13, produto.descricao, produto.marca]
      .some((valor) => String(valor ?? '').toLowerCase().includes(busca));
    const correspondeCategoria = !filtroProdutos.categoria || produto.categoria === filtroProdutos.categoria;
    return correspondeBusca && correspondeCategoria;
  });
}

function categoriasProdutos() {
  return [...new Set(produtosEmMemoria.map((produto) => produto.categoria).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}

function valorProduto(produto, campo) {
  return produto?.[campo] ?? '';
}

function mostrarFormularioProduto(produto = null) {
  const form = document.getElementById('formProduto');
  if (!form) return;

  form.classList.remove('hidden');
  document.getElementById('produtoEanOriginal').value = valorProduto(produto, 'ean13');
  ['sku', 'ean13', 'descricao', 'marca', 'unidade_medida', 'categoria'].forEach((campo) => {
    const elemento = document.getElementById(`produto_${campo}`);
    if (elemento) elemento.value = valorProduto(produto, campo);
  });
  document.getElementById('produto_sku')?.focus();
}

function cancelarFormularioProduto() {
  document.getElementById('formProduto')?.classList.add('hidden');
  document.getElementById('formProdutoDados')?.reset();
  const original = document.getElementById('produtoEanOriginal');
  if (original) original.value = '';
}

function lerProdutoFormulario() {
  const valor = (campo) => document.getElementById(`produto_${campo}`)?.value.trim() || '';
  return {
    sku: valor('sku'),
    ean13: valor('ean13'),
    descricao: valor('descricao'),
    marca: valor('marca'),
    unidade_medida: valor('unidade_medida'),
    categoria: valor('categoria')
  };
}

async function salvarProdutoFormulario() {
  const produto = lerProdutoFormulario();
  const erroValidacao = validarProduto(produto);
  if (erroValidacao) {
    alert(erroValidacao);
    return;
  }

  const eanOriginal = document.getElementById('produtoEanOriginal')?.value || '';
  const botao = document.querySelector('#formProdutoDados button[type="submit"]');
  if (botao) {
    botao.disabled = true;
    botao.textContent = 'Salvando...';
  }

  try {
    let dados = payloadProduto(produto);
    const executar = () => eanOriginal
      ? supabaseClient.from(PRODUTOS_TABELA).update(dados).eq(colunasProdutos.ean13, Number(eanOriginal))
      : supabaseClient.from(PRODUTOS_TABELA).insert(dados);
    let { error } = await executar();
    if (error && erroColunaInexistente(error) && colunasProdutos.sku === 'sku') {
      colunasProdutos = COLUNAS_ORIGINAIS_PRODUTOS;
      dados = payloadProduto(produto);
      ({ error } = await executar());
    }
    if (error) throw error;
    cancelarFormularioProduto();
    await carregarTelaProdutos();
  } catch (error) {
    alert(mensagemErroSupabase(error));
  } finally {
    if (botao) {
      botao.disabled = false;
      botao.textContent = 'Salvar produto';
    }
  }
}

function editarProduto(ean13) {
  const produto = produtosEmMemoria.find((item) => String(item.ean13) === String(ean13));
  if (produto) mostrarFormularioProduto(produto);
}

async function excluirProduto(ean13) {
  if (!confirm(`Deseja excluir o produto EAN-13 ${ean13}?`)) return;

  try {
    const { error } = await supabaseClient.from(PRODUTOS_TABELA).delete().eq(colunasProdutos.ean13, Number(ean13));
    if (error) throw error;
    await carregarTelaProdutos();
  } catch (error) {
    alert(mensagemErroSupabase(error));
  }
}

function renderizarCampoProduto(campo, nome, tipo = 'text', obrigatorio = false) {
  const id = `produto_${campo}`;
  const atributos = campo === 'ean13' ? 'inputmode="numeric" maxlength="13" pattern="[0-9]{13}"' : '';
  return `
    <label class="kullka-field">
      <span>${nome}${obrigatorio ? ' *' : ''}</span>
      <input id="${id}" type="${tipo}" ${atributos} ${obrigatorio ? 'required' : ''} />
    </label>`;
}

function renderizarTabelaProdutos() {
  const tabela = document.getElementById('tabelaProdutos');
  const contador = document.getElementById('contadorProdutos');
  if (!tabela) return;

  const produtos = valoresProdutosFiltrados();
  if (contador) contador.textContent = `${produtos.length} produto(s)`;
  tabela.innerHTML = produtos.length === 0
    ? '<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">Nenhum produto encontrado.</td></tr>'
    : produtos.map((produto) => `
      <tr>
        <td class="font-medium text-slate-900">${escaparTexto(produto.sku)}</td>
        <td class="font-mono text-sm text-slate-700">${escaparTexto(produto.ean13)}</td>
        <td class="text-slate-700">${escaparTexto(produto.descricao)}</td>
        <td class="text-slate-700">${escaparTexto(produto.marca)}</td>
        <td class="text-slate-700">${escaparTexto(produto.unidade_medida)}</td>
        <td class="text-slate-700">${escaparTexto(produto.categoria)}</td>
        <td class="text-right"><div class="flex justify-end gap-2">
          <button type="button" onclick="editarProduto('${escaparTexto(produto.ean13)}')" class="kullka-btn kullka-btn-secondary px-3 py-2">Editar</button>
          <button type="button" onclick="excluirProduto('${escaparTexto(produto.ean13)}')" class="kullka-btn kullka-btn-danger px-3 py-2">Excluir</button>
        </div></td>
      </tr>
    `).join('');
}

function aplicarFiltrosProdutos() {
  filtroProdutos.busca = document.getElementById('filtroProdutosBusca')?.value || '';
  filtroProdutos.categoria = document.getElementById('filtroProdutosCategoria')?.value || '';
  renderizarTabelaProdutos();
}

async function carregarTelaProdutos() {
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  main.innerHTML = '<div class="kullka-panel p-6 text-slate-600">Carregando produtos...</div>';
  try {
    produtosEmMemoria = await obterProdutos();
  } catch (error) {
    main.innerHTML = `<div class="kullka-panel p-6"><h1 class="text-xl font-bold text-slate-900">Não foi possível carregar produtos</h1><p class="mt-2 text-slate-600">${escaparTexto(mensagemErroSupabase(error))}</p></div>`;
    return;
  }

  const categorias = categoriasProdutos();
  main.innerHTML = `
    <div class="kullka-shell">
      <div class="kullka-panel">
        <div class="kullka-header"><div><p>Cadastro conectado à Supabase</p><h1>Produtos</h1></div><div class="kullka-actions">
          <button type="button" onclick="mostrarFormularioProduto()" class="kullka-btn kullka-btn-primary"><i class="fa-solid fa-plus"></i>Novo produto</button>
        </div></div>
        <div class="kullka-form border-b border-slate-200"><div class="kullka-grid">
          <label class="kullka-field md:col-span-2"><span>Pesquisar</span><input id="filtroProdutosBusca" type="search" placeholder="SKU, EAN-13, descrição ou marca" oninput="aplicarFiltrosProdutos()" /></label>
          <label class="kullka-field"><span>Categoria</span><select id="filtroProdutosCategoria"><option value="">Todas as categorias</option>${categorias.map((categoria) => `<option value="${escaparTexto(categoria)}">${escaparTexto(categoria)}</option>`).join('')}</select></label>
        </div></div>
        <div id="formProduto" class="hidden kullka-form bg-slate-50/60"><form id="formProdutoDados" onsubmit="salvarProdutoFormulario(); return false;">
          <input type="hidden" id="produtoEanOriginal" /><div class="kullka-grid">
            ${renderizarCampoProduto('sku', 'SKU interno', 'number', true)}
            ${renderizarCampoProduto('ean13', 'EAN-13', 'text', true)}
            ${renderizarCampoProduto('descricao', 'Descrição', 'text', true)}
            ${renderizarCampoProduto('marca', 'Marca')}
            ${renderizarCampoProduto('unidade_medida', 'Unidade de medida')}
            ${renderizarCampoProduto('categoria', 'Categoria')}
          </div><div class="kullka-actions mt-5">
            <button type="button" onclick="cancelarFormularioProduto()" class="kullka-btn kullka-btn-secondary">Cancelar</button>
            <button type="submit" class="kullka-btn kullka-btn-primary">Salvar produto</button>
          </div>
        </form></div>
      </div>
      <div class="kullka-panel overflow-hidden"><div class="kullka-header"><div><h2>Catálogo de produtos</h2><p id="contadorProdutos"></p></div></div>
        <div class="overflow-x-auto"><table class="kullka-table min-w-full"><thead><tr><th>SKU</th><th>EAN-13</th><th>Descrição</th><th>Marca</th><th>UM</th><th>Categoria</th><th class="text-right">Ações</th></tr></thead><tbody id="tabelaProdutos"></tbody></table></div>
      </div>
    </div>`;
  document.getElementById('filtroProdutosCategoria')?.addEventListener('change', aplicarFiltrosProdutos);
  renderizarTabelaProdutos();
}
