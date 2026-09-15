// -------------------------------------------------------------
// TELA DE CADASTRO DE PRODUTOS
// -------------------------------------------------------------

const PRODUTOS_KEY = 'kullka_produtos';

function obterProdutos() {
  try {
    const dados = JSON.parse(localStorage.getItem(PRODUTOS_KEY));
    if (Array.isArray(dados) && dados.length > 0) {
      return dados;
    }
  } catch (error) {
    console.warn('Erro ao ler produtos do localStorage:', error);
  }

  return [
    { id: 1, codigo: 'PROD-001', nome: 'Caixa de Papelão M', categoria: 'Embalagens', estoque: 150, preco: 15.90, unidade: 'un' },
    { id: 2, codigo: 'PROD-002', nome: 'Fita Adesiva Larga', categoria: 'Suprimentos', estoque: 80, preco: 9.50, unidade: 'un' }
  ];
}

function salvarProdutos(produtos) {
  localStorage.setItem(PRODUTOS_KEY, JSON.stringify(produtos));
}

function gerarNovoIdProduto() {
  const produtos = obterProdutos();
  return produtos.reduce((max, produto) => Math.max(max, Number(produto.id) || 0), 0) + 1;
}

function mostrarFormularioProduto(produto = null) {
  const form = document.getElementById('formProduto');
  if (!form) return;

  form.classList.remove('hidden');

  const produtoId = document.getElementById('produtoId');
  const codigo = document.getElementById('produtoCodigo');
  const nome = document.getElementById('produtoNome');
  const categoria = document.getElementById('produtoCategoria');
  const estoque = document.getElementById('produtoEstoque');
  const preco = document.getElementById('produtoPreco');
  const unidade = document.getElementById('produtoUnidade');

  if (produto) {
    produtoId.value = produto.id;
    codigo.value = produto.codigo || '';
    nome.value = produto.nome || '';
    categoria.value = produto.categoria || '';
    estoque.value = produto.estoque || 0;
    preco.value = produto.preco || 0;
    unidade.value = produto.unidade || 'un';
  } else {
    produtoId.value = '';
    codigo.value = '';
    nome.value = '';
    categoria.value = '';
    estoque.value = 0;
    preco.value = 0;
    unidade.value = 'un';
  }
}

function cancelarFormularioProduto() {
  const form = document.getElementById('formProduto');
  if (form) form.classList.add('hidden');

  const produtoId = document.getElementById('produtoId');
  const codigo = document.getElementById('produtoCodigo');
  const nome = document.getElementById('produtoNome');
  const categoria = document.getElementById('produtoCategoria');
  const estoque = document.getElementById('produtoEstoque');
  const preco = document.getElementById('produtoPreco');
  const unidade = document.getElementById('produtoUnidade');

  if (produtoId) produtoId.value = '';
  if (codigo) codigo.value = '';
  if (nome) nome.value = '';
  if (categoria) categoria.value = '';
  if (estoque) estoque.value = 0;
  if (preco) preco.value = 0;
  if (unidade) unidade.value = 'un';
}

function salvarProdutoFormulario() {
  const produtoId = document.getElementById('produtoId')?.value || '';
  const codigo = document.getElementById('produtoCodigo')?.value?.trim() || '';
  const nome = document.getElementById('produtoNome')?.value?.trim() || '';
  const categoria = document.getElementById('produtoCategoria')?.value?.trim() || '';
  const estoque = Number(document.getElementById('produtoEstoque')?.value || 0);
  const preco = Number(document.getElementById('produtoPreco')?.value || 0);
  const unidade = document.getElementById('produtoUnidade')?.value || 'un';

  if (!codigo || !nome || !categoria) {
    alert('Preencha código, nome e categoria do produto.');
    return;
  }

  const produtos = obterProdutos();
  const id = produtoId ? Number(produtoId) : gerarNovoIdProduto();

  const produtoAtualizado = { id, codigo, nome, categoria, estoque, preco, unidade };

  const index = produtos.findIndex((produto) => Number(produto.id) === id);

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
  const produto = produtos.find((produto) => Number(produto.id) === Number(idProduto));
  if (!produto) return;

  mostrarFormularioProduto(produto);
}

function excluirProduto(idProduto) {
  const confirmar = confirm('Deseja excluir este produto?');
  if (!confirmar) return;

  const produtos = obterProdutos().filter((produto) => Number(produto.id) !== Number(idProduto));
  salvarProdutos(produtos);
  carregarTelaProdutos();
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

          <button
            type="button"
            onclick="mostrarFormularioProduto()"
            class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <i class="fa-solid fa-plus"></i>
            Novo Produto
          </button>
        </div>

        <div id="formProduto" class="hidden px-6 py-5 border-b border-slate-200">
          <form onsubmit="salvarProdutoFormulario(); return false;">
            <input type="hidden" id="produtoId" value="" />

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Código</span>
                <input id="produtoCodigo" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="PROD-010" />
              </label>

              <label class="block">
                <span class="text-sm font-medium text-slate-700">Nome</span>
                <input id="produtoNome" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nome do produto" />
              </label>

              <label class="block">
                <span class="text-sm font-medium text-slate-700">Categoria</span>
                <input id="produtoCategoria" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Embalagens" />
              </label>

              <label class="block">
                <span class="text-sm font-medium text-slate-700">Estoque</span>
                <input id="produtoEstoque" type="number" min="0" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value="0" />
              </label>

              <label class="block">
                <span class="text-sm font-medium text-slate-700">Preço</span>
                <input id="produtoPreco" type="number" min="0" step="0.01" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value="0" />
              </label>

              <label class="block">
                <span class="text-sm font-medium text-slate-700">Unidade</span>
                <select id="produtoUnidade" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="un">Unidade</option>
                  <option value="cx">Caixa</option>
                  <option value="kg">Kg</option>
                  <option value="lt">Litro</option>
                  <option value="pc">Peça</option>
                </select>
              </label>
            </div>

            <div class="flex justify-end gap-3 mt-5">
              <button type="button" onclick="cancelarFormularioProduto()" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100">
                Cancelar
              </button>

              <button type="submit" class="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-bold text-slate-800">Lista de produtos</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Código</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Categoria</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Estoque</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Preço</th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-200">
              ${produtos.length === 0 ? `
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-500">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ` : produtos.map((produto) => `
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-4 text-sm text-slate-700">${produto.codigo}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">${produto.nome}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">${produto.categoria}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">${produto.estoque}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">R$ ${Number(produto.preco || 0).toFixed(2)}</td>
                  <td class="px-6 py-4 text-sm">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        onclick="editarProduto(${produto.id})"
                        class="px-2.5 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onclick="excluirProduto(${produto.id})"
                        class="px-2.5 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}