(function () {
  const STORAGE_MENU = 'kullka_menu';

  function gerarId(prefix = 'menu') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function padronizarEstruturaMenu(menu) {
    const lista = Array.isArray(menu) ? menu : [];

    return lista.map((categoria, indiceCategoria) => {
      const categoriaNormalizada = {
        id: categoria.id || gerarId('cat'),
        nome: categoria.nome || `Menu ${indiceCategoria + 1}`,
        ativo: categoria.ativo !== false,
        ordem: categoria.ordem || indiceCategoria + 1,
        itens: Array.isArray(categoria.itens) ? categoria.itens : []
      };

      categoriaNormalizada.itens = categoriaNormalizada.itens.map((item, indiceItem) => ({
        id: item.id || gerarId('item'),
        nome: item.nome || `Item ${indiceItem + 1}`,
        paginaId: item.paginaId || '',
        icone: item.icone || 'fa-file-lines',
        ativo: item.ativo !== false,
        ordem: item.ordem || indiceItem + 1,
        itens: Array.isArray(item.itens) ? item.itens : []
      }));

      return categoriaNormalizada;
    });
  }

  function criarMenuPadrao() {
    const menuPadrao = [
      {
        id: 'cat_operacao',
        nome: 'Operações',
        ativo: true,
        ordem: 1,
        itens: [
          { id: 'op_recebimento', nome: 'Recebimento', paginaId: 'recepcao', icone: 'fa-truck-ramp-box', ativo: true, ordem: 1 },
          { id: 'op_guardagem', nome: 'Guardagem', paginaId: 'guardagem_enderecamento', icone: 'fa-warehouse', ativo: true, ordem: 2 },
          { id: 'op_movimentacao', nome: 'Movimentação', paginaId: 'movimentacao_estoque', icone: 'fa-arrows-left-right', ativo: true, ordem: 3 },
          { id: 'op_separacao', nome: 'Separação', paginaId: 'separacao_preparacao', icone: 'fa-list-check', ativo: true, ordem: 4 },
          { id: 'op_expedicao', nome: 'Expedição', paginaId: 'expedicao', icone: 'fa-truck-fast', ativo: true, ordem: 5 },
          { id: 'op_inventario', nome: 'Inventário', paginaId: 'inventario_acuracidade', icone: 'fa-clipboard-list', ativo: true, ordem: 6 },
          { id: 'op_kpis', nome: 'Indicadores', paginaId: 'painel_kpis', icone: 'fa-chart-line', ativo: true, ordem: 7 }
        ]
      },
      {
        id: 'cat_manutencao',
        nome: 'Manutenção',
        ativo: true,
        ordem: 2,
        itens: [
          { id: 'man_produtos', nome: 'Produtos', paginaId: 'cadastro_produtos', icone: 'fa-boxes-stacked', ativo: true, ordem: 1 },
          { id: 'man_fator', nome: 'Fator de Conversão', paginaId: 'fator_conversao', icone: 'fa-arrows-rotate', ativo: true, ordem: 2 },
          { id: 'man_unidades', nome: 'Unidades', paginaId: 'unidades_medida', icone: 'fa-ruler-combined', ativo: true, ordem: 3 },
          { id: 'man_paginas', nome: 'Gestão de Páginas', paginaId: 'gestao_paginas', icone: 'fa-file-code', ativo: true, ordem: 4 },
          { id: 'man_menu', nome: 'Gestão de Menu', paginaId: 'gerenciar_menu', icone: 'fa-sliders', ativo: true, ordem: 5 }
        ]
      }
    ];

    return padronizarEstruturaMenu(menuPadrao);
  }

  function obterEstruturaMenu() {
    try {
      const salvo = JSON.parse(localStorage.getItem(STORAGE_MENU));
      if (Array.isArray(salvo) && salvo.length > 0) {
        return padronizarEstruturaMenu(salvo);
      }
    } catch (error) {
      console.warn('Erro ao ler menu salvo:', error);
    }

    const padrao = criarMenuPadrao();
    salvarEstruturaMenu(padrao);
    return padrao;
  }

  function salvarEstruturaMenu(menu) {
    const estrutura = padronizarEstruturaMenu(menu);
    localStorage.setItem(STORAGE_MENU, JSON.stringify(estrutura));
    return estrutura;
  }

  function percorrerItensMenu(itens, callback) {
    if (!Array.isArray(itens)) return;

    itens.forEach((item) => {
      if (callback(item) === false) return;
      if (Array.isArray(item.itens)) {
        percorrerItensMenu(item.itens, callback);
      }
    });
  }

  function obterColecaoFilhosMenu(menu, paiId) {
    for (const categoria of menu) {
      if (categoria.id === paiId) return categoria.itens || [];

      const encontrado = percorrerEEncontrar(item => item.id === paiId, categoria.itens);
      if (encontrado) return encontrado.itens || [];
    }

    return null;
  }

  function percorrerEEncontrar(predicado, itens) {
    if (!Array.isArray(itens)) return null;

    for (const item of itens) {
      if (predicado(item)) return item;
      const achado = percorrerEEncontrar(predicado, item.itens || []);
      if (achado) return achado;
    }

    return null;
  }

  function encontrarItemMenu(menu, itemId) {
    for (const categoria of menu) {
      const item = percorrerEEncontrar((node) => node.id === itemId, categoria.itens || []);
      if (item) {
        return { categoria, item, pai: categoria };
      }
    }

    return null;
  }

  function obterOpcoesPaisMenu(menu, itemId) {
    return menu.map((categoria) => ({ id: categoria.id, nome: categoria.nome }));
  }

  function removerItemMenuDaEstrutura(menu, itemId) {
    for (const categoria of menu) {
      if (categoria.id === itemId) {
        categoria.ativo = false;
        categoria.nome = categoria.nome || 'Menu removido';
        return true;
      }

      const itens = categoria.itens || [];
      const indice = itens.findIndex((item) => item.id === itemId);
      if (indice >= 0) {
        itens.splice(indice, 1);
        return true;
      }

      const encontrado = removerItemMenuDaEstruturaRecursivo(itens, itemId);
      if (encontrado) return true;
    }

    return false;
  }

  function removerItemMenuDaEstruturaRecursivo(itens, itemId) {
    for (let index = 0; index < itens.length; index += 1) {
      const item = itens[index];
      if (item.id === itemId) {
        itens.splice(index, 1);
        return true;
      }

      if (Array.isArray(item.itens) && removerItemMenuDaEstruturaRecursivo(item.itens, itemId)) {
        return true;
      }
    }

    return false;
  }

  function escaparHtml(valor) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderizarSubmenuItens(itens, nivel = 0) {
    if (!Array.isArray(itens) || itens.length === 0) return '';

    return itens
      .filter((item) => item.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
      .map((item) => {
        const filhos = renderizarSubmenuItens(item.itens || [], nivel + 1);
        const temFilhos = Array.isArray(item.itens) && item.itens.length > 0;
        const itemLabel = item.paginaId ? `onclick="abrirPaginaMenu('${item.paginaId}')"` : 'onclick="return false;"';

        return `
          <div class="relative ${nivel > 0 ? 'ml-3' : ''}">
            <button type="button" ${itemLabel} class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <span class="flex items-center gap-2 truncate">
                <i class="fa-solid ${item.icone || 'fa-file-lines'} text-slate-500"></i>
                <span class="truncate">${escaparHtml(item.nome)}</span>
              </span>
              ${temFilhos ? '<i class="fa-solid fa-chevron-down text-[10px] text-slate-400"></i>' : ''}
            </button>
            ${filhos ? `<div class="mt-1 space-y-1 border-l border-slate-200 pl-2">${filhos}</div>` : ''}
          </div>
        `;
      })
      .join('');
  }

  function aplicarComportamentoMenu() {
    const grupos = document.querySelectorAll('[data-menu-group]');
    grupos.forEach((grupo) => {
      const trigger = grupo.querySelector('[data-menu-trigger]');
      const panel = grupo.querySelector('[data-menu-panel]');
      if (!trigger || !panel) return;

      let timerFechar = null;

      const abrir = () => {
        window.clearTimeout(timerFechar);
        panel.classList.remove('opacity-0', 'pointer-events-none');
        panel.classList.add('opacity-100', 'pointer-events-auto');
        trigger.setAttribute('aria-expanded', 'true');
      };

      const fechar = () => {
        timerFechar = window.setTimeout(() => {
          panel.classList.add('opacity-0', 'pointer-events-none');
          panel.classList.remove('opacity-100', 'pointer-events-auto');
          trigger.setAttribute('aria-expanded', 'false');
        }, 1200);
      };

      trigger.addEventListener('mouseenter', abrir);
      trigger.addEventListener('pointerenter', abrir);
      trigger.addEventListener('focus', abrir);
      trigger.addEventListener('mouseleave', fechar);
      trigger.addEventListener('pointerleave', fechar);
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const aberto = panel.classList.contains('opacity-100');
        if (aberto) {
          panel.classList.add('opacity-0', 'pointer-events-none');
          panel.classList.remove('opacity-100', 'pointer-events-auto');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          abrir();
        }
      });

      panel.addEventListener('mouseenter', () => window.clearTimeout(timerFechar));
      panel.addEventListener('pointerenter', () => window.clearTimeout(timerFechar));
      panel.addEventListener('mouseleave', fechar);
      panel.addEventListener('pointerleave', fechar);
      grupo.addEventListener('mouseleave', fechar);
      grupo.addEventListener('pointerleave', fechar);
      grupo.addEventListener('focusout', (event) => {
        if (!grupo.contains(event.relatedTarget)) {
          fechar();
        }
      });
    });
  }

  function renderizarMenu() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    const categorias = obterEstruturaMenu()
      .filter((categoria) => categoria.ativo !== false)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

    nav.innerHTML = categorias.map((categoria) => {
      const itens = (categoria.itens || []).filter((item) => item.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

      return `
        <div class="group relative" data-menu-group>
          <button
            type="button"
            data-menu-trigger
            aria-expanded="false"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700 hover:text-white"
          >
            <span>${escaparHtml(categoria.nome)}</span>
            <i class="fa-solid fa-chevron-down text-[10px] opacity-80"></i>
          </button>
          <div
            data-menu-panel
            class="pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl opacity-0 transition duration-150 ease-out"
          >
            <div class="space-y-1">
              ${renderizarSubmenuItens(itens)}
            </div>
          </div>
        </div>
      `;
    }).join('');

    aplicarComportamentoMenu();
  }

  function abrirPaginaMenu(idPagina) {
    if (!idPagina) return;

    if (typeof window.carregarTelaProdutos === 'function' && idPagina === 'cadastro_produtos') {
      window.carregarTelaProdutos();
      return;
    }

    if (typeof window.carregarTelaGestaoPaginas === 'function' && idPagina === 'gestao_paginas') {
      window.carregarTelaGestaoPaginas();
      return;
    }

    if (typeof window.carregarTelaGestaoMenu === 'function' && idPagina === 'gerenciar_menu') {
      window.carregarTelaGestaoMenu();
      return;
    }

    if (typeof window.exibirPaginaDinamica === 'function' && (idPagina in (window.DEFINICOES_PAGINAS_WMS || {}))) {
      window.exibirPaginaDinamica(idPagina);
      return;
    }

    if (typeof window.carregarTelaEmBranco === 'function') {
      window.carregarTelaEmBranco();
    }
  }

  window.gerarId = gerarId;
  window.obterEstruturaMenu = obterEstruturaMenu;
  window.salvarEstruturaMenu = salvarEstruturaMenu;
  window.obterOpcoesPaisMenu = obterOpcoesPaisMenu;
  window.encontrarItemMenu = encontrarItemMenu;
  window.removerItemMenuDaEstrutura = removerItemMenuDaEstrutura;
  window.obterColecaoFilhosMenu = obterColecaoFilhosMenu;
  window.percorrerItensMenu = percorrerItensMenu;
  window.renderizarMenu = renderizarMenu;
  window.abrirPaginaMenu = abrirPaginaMenu;
})();
