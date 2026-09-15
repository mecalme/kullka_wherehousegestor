const MENU_STORAGE_KEY = 'kullka_menu';

const MENU_TEMPLATE = [
  {
    id: 'cat_manutencao',
    nome: 'Manutenção',
    ativo: true,
    ordem: 1,
    itens: [
      { id: 'item_produtos', nome: 'Produtos', paginaId: 'produtos', icone: 'fa-boxes-stacked', ativo: true, ordem: 1 },
      { id: 'item_gestao_paginas', nome: 'Gestão de Páginas', paginaId: 'gestao_paginas', icone: 'fa-file-code', ativo: true, ordem: 2 },
      { id: 'item_gerenciar_menu', nome: 'Gestão de Menu', paginaId: 'gerenciar_menu', icone: 'fa-sliders', ativo: true, ordem: 3 }
    ]
  },
  {
    id: 'cat_operacao',
    nome: 'Gestão Operacional',
    ativo: true,
    ordem: 2,
    itens: [
      { id: 'item_layout', nome: 'Layout Logístico', paginaId: 'layout_logistico', icone: 'fa-map-location-dot', ativo: true, ordem: 1 }
    ]
  }
];

function gerarId(prefixo) {
  return `${prefixo}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function obterEstruturaMenu() {
  try {
    const menuSalvo = localStorage.getItem(MENU_STORAGE_KEY);
    if (!menuSalvo) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(MENU_TEMPLATE));
      return MENU_TEMPLATE;
    }

    const parsed = JSON.parse(menuSalvo);
    return Array.isArray(parsed) ? parsed : MENU_TEMPLATE;
  } catch (error) {
    console.warn('Menu inválido. Usando padrão.', error);
    return MENU_TEMPLATE;
  }
}

function salvarEstruturaMenu(menu) {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
}

function renderizarMenu() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const menu = obterEstruturaMenu();

  nav.innerHTML = menu
    .filter((categoria) => categoria.ativo !== false)
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
    .map((categoria) => {
      const itensAtivos = (categoria.itens || [])
        .filter((item) => item.ativo !== false)
        .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

      return `
        <div class="relative group">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <span>${categoria.nome}</span>
            <i class="fa-solid fa-chevron-down text-[10px] opacity-70"></i>
          </button>

          <div class="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1 hidden group-hover:block group-focus-within:block z-50">
            ${itensAtivos.length === 0
              ? `<span class="block px-4 py-2 text-xs text-slate-400 italic">Nenhuma opção</span>`
              : itensAtivos.map((item) => `
                  <a href="#"
                     onclick="carregarPagina('${item.paginaId || item.url || '#'}'); return false;"
                     class="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition">
                    <i class="fa-solid ${item.icone || 'fa-file-lines'} text-slate-400"></i>
                    <span>${item.nome}</span>
                  </a>
                `).join('')
            }
          </div>
        </div>
      `;
    })
    .join('');
}

function carregarPagina(idPagina) {
  if (!idPagina || idPagina === '#') {
    if (typeof carregarTelaEmBranco === 'function') carregarTelaEmBranco();
    return;
  }

  if (idPagina === 'produtos') {
    if (typeof carregarTelaProdutos === 'function') carregarTelaProdutos();
    return;
  }

  if (idPagina === 'gestao_paginas') {
    if (typeof carregarTelaGestaoPaginas === 'function') carregarTelaGestaoPaginas();
    return;
  }

  if (idPagina === 'gerenciar_menu') {
    if (typeof carregarTelaGestaoMenu === 'function') carregarTelaGestaoMenu();
    return;
  }

  if (idPagina === 'layout_logistico') {
    if (typeof carregarTelaLayout === 'function') carregarTelaLayout();
    return;
  }

  if (typeof exibirPaginaDinamica === 'function') {
    exibirPaginaDinamica(idPagina);
  }
}