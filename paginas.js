var paginasDinamicas = JSON.parse(localStorage.getItem('kullka_paginas')) || [];
var idPaginaEdicao = null;
var categoriaSelecionadaId = null;

function sincronizarPaginas() {
  try {
    paginasDinamicas = JSON.parse(localStorage.getItem('kullka_paginas')) || [];
  } catch (error) {
    console.warn('Erro ao sincronizar páginas:', error);
    paginasDinamicas = [];
  }
}

function carregarTelaEmBranco() {
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  main.innerHTML = `
    <div class="flex flex-col items-center justify-center h-64 text-slate-400">
      <i class="fa-solid fa-boxes-stacked text-5xl mb-3 text-slate-300"></i>
      <p class="text-sm">Selecione uma opção no menu para iniciar.</p>
    </div>
  `;
}

function carregarTelaGestaoPaginas() {
  sincronizarPaginas();
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h1 class="text-2xl font-bold text-slate-800 mb-4">Gestão de Páginas</h1>
      <p class="text-slate-500">Gerencie páginas dinâmicas e vínculos no menu.</p>
    </div>
  `;
}

function abrirFormularioCategoria(categoria = null) {
  const form = document.getElementById('formCategoriaMenu');
  if (!form) return;

  form.classList.remove('hidden');

  const id = document.getElementById('categoriaMenuId');
  const nome = document.getElementById('categoriaMenuNome');

  if (categoria && categoria.id) {
    id.value = categoria.id;
    nome.value = categoria.nome || '';
  } else {
    id.value = '';
    nome.value = '';
  }
}

function fecharFormularioCategoria() {
  const form = document.getElementById('formCategoriaMenu');
  if (form) form.classList.add('hidden');

  const id = document.getElementById('categoriaMenuId');
  const nome = document.getElementById('categoriaMenuNome');

  if (id) id.value = '';
  if (nome) nome.value = '';
}

function salvarCategoriaMenu() {
  const id = document.getElementById('categoriaMenuId')?.value || '';
  const nome = document.getElementById('categoriaMenuNome')?.value?.trim() || '';

  if (!nome) {
    alert('Informe o nome da categoria.');
    return;
  }

  const menu = obterEstruturaMenu();
  const categoriaExistente = menu.find((item) => item.id === id);

  if (categoriaExistente) {
    categoriaExistente.nome = nome;
    categoriaExistente.ativo = true;
  } else {
    menu.push({
      id: gerarId('cat'),
      nome,
      ativo: true,
      ordem: menu.length + 1,
      itens: []
    });
  }

  salvarEstruturaMenu(menu);
  fecharFormularioCategoria();
  categoriaSelecionadaId = categoriaExistente ? categoriaExistente.id : menu[menu.length - 1].id;
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function removerCategoriaMenu(categoriaId) {
  const confirmar = confirm('Deseja excluir esta categoria do menu?');
  if (!confirmar) return;

  const menu = obterEstruturaMenu().filter((categoria) => categoria.id !== categoriaId);
  salvarEstruturaMenu(menu);

  const categoriasOrdenadas = menu
    .map((categoria, index) => ({ ...categoria, ordem: index + 1 }))
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  salvarEstruturaMenu(categoriasOrdenadas);

  if (categoriaSelecionadaId === categoriaId) {
    categoriaSelecionadaId = categoriasOrdenadas[0]?.id || null;
  }

  renderizarMenu();
  carregarTelaGestaoMenu();
}

function moverCategoriaEsquerda(categoriaId) {
  const menu = obterEstruturaMenu();
  const index = menu.findIndex((categoria) => categoria.id === categoriaId);
  if (index <= 0) return;

  const temp = menu[index];
  menu[index] = menu[index - 1];
  menu[index - 1] = temp;

  menu.forEach((categoria, idx) => {
    categoria.ordem = idx + 1;
  });

  salvarEstruturaMenu(menu);
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function moverCategoriaDireita(categoriaId) {
  const menu = obterEstruturaMenu();
  const index = menu.findIndex((categoria) => categoria.id === categoriaId);
  if (index === -1 || index >= menu.length - 1) return;

  const temp = menu[index];
  menu[index] = menu[index + 1];
  menu[index + 1] = temp;

  menu.forEach((categoria, idx) => {
    categoria.ordem = idx + 1;
  });

  salvarEstruturaMenu(menu);
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function selecionarCategoria(categoriaId) {
  categoriaSelecionadaId = categoriaId;
  carregarTelaGestaoMenu();
}

function abrirFormularioItem(categoriaId, itemId = null) {
  const form = document.getElementById('formItemMenu');
  if (!form) return;

  form.classList.remove('hidden');

  const categoriaSelect = document.getElementById('itemMenuCategoria');
  const itemIdInput = document.getElementById('itemMenuId');
  const nomeInput = document.getElementById('itemMenuNome');
  const paginaInput = document.getElementById('itemMenuPaginaId');
  const iconeInput = document.getElementById('itemMenuIcone');

  const menu = obterEstruturaMenu();

  categoriaSelect.innerHTML = menu.map((categoria) => `
    <option value="${categoria.id}" ${categoria.id === categoriaId ? 'selected' : ''}>
      ${categoria.nome}
    </option>
  `).join('');

  const categoria = menu.find((item) => item.id === categoriaId);
  const item = categoria && categoria.itens
    ? categoria.itens.find((sub) => sub.id === itemId) || null
    : null;

  if (item) {
    itemIdInput.value = item.id;
    categoriaSelect.value = categoriaId;
    nomeInput.value = item.nome || '';
    paginaInput.value = item.paginaId || '';
    iconeInput.value = item.icone || 'fa-file-lines';
  } else {
    itemIdInput.value = '';
    categoriaSelect.value = categoriaId;
    nomeInput.value = '';
    paginaInput.value = '';
    iconeInput.value = 'fa-file-lines';
  }
}

function fecharFormularioItem() {
  const form = document.getElementById('formItemMenu');
  if (form) form.classList.add('hidden');

  const categoriaSelect = document.getElementById('itemMenuCategoria');
  const itemIdInput = document.getElementById('itemMenuId');
  const nomeInput = document.getElementById('itemMenuNome');
  const paginaInput = document.getElementById('itemMenuPaginaId');
  const iconeInput = document.getElementById('itemMenuIcone');

  if (categoriaSelect) categoriaSelect.value = '';
  if (itemIdInput) itemIdInput.value = '';
  if (nomeInput) nomeInput.value = '';
  if (paginaInput) paginaInput.value = '';
  if (iconeInput) iconeInput.value = 'fa-file-lines';
}

function salvarItemMenu() {
  const menu = obterEstruturaMenu();
  const categoriaId = document.getElementById('itemMenuCategoria')?.value;
  const itemId = document.getElementById('itemMenuId')?.value || '';
  const nome = document.getElementById('itemMenuNome')?.value?.trim() || '';
  const paginaId = document.getElementById('itemMenuPaginaId')?.value?.trim() || '';
  const icone = document.getElementById('itemMenuIcone')?.value || 'fa-file-lines';

  if (!categoriaId || !nome || !paginaId) {
    alert('Preencha categoria, nome e página do item.');
    return;
  }

  const categoria = menu.find((item) => item.id === categoriaId);
  if (!categoria) return;

  categoria.itens = categoria.itens || [];

  if (itemId) {
    const itemExistente = categoria.itens.find((sub) => sub.id === itemId);
    if (itemExistente) {
      itemExistente.nome = nome;
      itemExistente.paginaId = paginaId;
      itemExistente.icone = icone;
      itemExistente.ordem = 1;
      itemExistente.ativo = true;
    }
  } else {
    const novoItem = {
      id: gerarId('item'),
      nome,
      paginaId,
      icone,
      ativo: true,
      ordem: (categoria.itens.length || 0) + 1
    };

    categoria.itens.push(novoItem);
  }

  salvarEstruturaMenu(menu);
  fecharFormularioItem();
  categoriaSelecionadaId = categoriaId;
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function removerItemMenu(categoriaId, itemId) {
  const confirmar = confirm('Deseja excluir este item do menu?');
  if (!confirmar) return;

  const menu = obterEstruturaMenu();
  const categoria = menu.find((item) => item.id === categoriaId);
  if (!categoria) return;

  categoria.itens = (categoria.itens || []).filter((sub) => sub.id !== itemId);
  salvarEstruturaMenu(menu);
  categoriaSelecionadaId = categoriaId;
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function carregarTelaGestaoMenu() {
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  const menu = obterEstruturaMenu();
  const categoriasOrdenadas = [...menu].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  if (!categoriaSelecionadaId && categoriasOrdenadas.length > 0) {
    categoriaSelecionadaId = categoriasOrdenadas[0].id;
  }

  const categoriaAtual = categoriasOrdenadas.find((categoria) => categoria.id === categoriaSelecionadaId) || categoriasOrdenadas[0] || null;

  main.innerHTML = `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Configuração</p>
            <h1 class="text-2xl font-bold text-slate-800">Gestão de Menu</h1>
          </div>
          <button
            type="button"
            onclick="abrirFormularioCategoria()"
            class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <i class="fa-solid fa-plus"></i>
            Nova Categoria
          </button>
        </div>
      </div>

      <div id="formCategoriaMenu" class="hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Categoria</h2>
        <input type="hidden" id="categoriaMenuId" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Nome</span>
            <input id="categoriaMenuNome" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>

          <div class="flex items-end">
            <button type="button" onclick="salvarCategoriaMenu()" class="w-full px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              Salvar categoria
            </button>
          </div>
        </div>
      </div>

      <div id="formItemMenu" class="hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Submenu / Item</h2>
        <input type="hidden" id="itemMenuId" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Categoria</span>
            <select id="itemMenuCategoria" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"></select>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Nome</span>
            <input id="itemMenuNome" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Página</span>
            <input id="itemMenuPaginaId" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="produtos" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Ícone</span>
            <input id="itemMenuIcone" type="text" value="fa-file-lines" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>

          <div class="md:col-span-2 flex justify-end">
            <button type="button" onclick="salvarItemMenu()" class="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
              Salvar item
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-800">Menus principais</h2>
            <span class="text-xs text-slate-500">${categoriasOrdenadas.length} itens</span>
          </div>

          <div class="space-y-3">
            ${categoriasOrdenadas.length === 0 ? `
              <div class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
                Nenhum menu principal cadastrado.
              </div>
            ` : categoriasOrdenadas.map((categoria, index) => `
              <div class="rounded-xl border ${categoria.id === categoriaAtual?.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'} p-3">
                <div class="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onclick="selecionarCategoria('${categoria.id}')"
                    class="flex-1 text-left text-sm font-semibold ${categoria.id === categoriaAtual?.id ? 'text-emerald-700' : 'text-slate-700'}"
                  >
                    ${categoria.nome}
                  </button>

                  <div class="flex gap-1">
                    <button
                      type="button"
                      onclick="moverCategoriaEsquerda('${categoria.id}')"
                      class="w-8 h-8 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300"
                      title="Mover para esquerda"
                    >
                      <i class="fa-solid fa-arrow-left"></i>
                    </button>

                    <button
                      type="button"
                      onclick="moverCategoriaDireita('${categoria.id}')"
                      class="w-8 h-8 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300"
                      title="Mover para direita"
                    >
                      <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>

                <div class="mt-3 flex gap-2">
                  <button
                    type="button"
                    onclick="abrirFormularioCategoria({ id: '${categoria.id}', nome: '${categoria.nome.replace(/'/g, "\\'")}' })"
                    class="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onclick="removerCategoriaMenu('${categoria.id}')"
                    class="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-800">
              ${categoriaAtual ? `Submenus de "${categoriaAtual.nome}"` : 'Submenus'}
            </h2>

            ${categoriaAtual ? `
              <button
                type="button"
                onclick="abrirFormularioItem('${categoriaAtual.id}')"
                class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm"
              >
                <i class="fa-solid fa-plus"></i>
                Novo submenu
              </button>
            ` : ''}
          </div>

          ${!categoriaAtual ? `
            <div class="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-400">
              Selecione um menu principal para visualizar os submenus.
            </div>
          ` : `
            <div class="space-y-3">
              ${(categoriaAtual.itens || []).length === 0 ? `
                <div class="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400">
                  Nenhum submenu cadastrado neste menu principal.
                </div>
              ` : (categoriaAtual.itens || []).map((item) => `
                <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div class="flex items-center gap-3">
                    <i class="fa-solid ${item.icone || 'fa-file-lines'} text-slate-500"></i>
                    <div>
                      <div class="text-sm font-semibold text-slate-800">${item.nome}</div>
                      <div class="text-[11px] text-slate-500">${item.paginaId}</div>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <button
                      type="button"
                      onclick="abrirFormularioItem('${categoriaAtual.id}', '${item.id}')"
                      class="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onclick="removerItemMenu('${categoriaAtual.id}', '${item.id}')"
                      class="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs hover:bg-red-200"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function exibirPaginaDinamica(idPagina) {
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  main.innerHTML = `
    <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <h1 class="text-2xl font-bold text-slate-800 mb-2">Página dinâmica</h1>
      <p class="text-slate-500">ID: ${idPagina}</p>
    </div>
  `;
}