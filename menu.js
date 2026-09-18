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

      categoriaNormalizada.itens = normalizarItensMenu(categoriaNormalizada.itens);

      return categoriaNormalizada;
    });
  }

  function normalizarItensMenu(itens, nivel = 0) {
    return (Array.isArray(itens) ? itens : []).map((item, indiceItem) => ({
      id: item.id || gerarId('item'),
      nome: item.nome || `Item ${indiceItem + 1}`,
      paginaId: item.paginaId || '',
      icone: item.icone || 'fa-file-lines',
      ativo: item.ativo !== false,
      ordem: item.ordem || indiceItem + 1,
      nivel,
      itens: normalizarItensMenu(item.itens, nivel + 1)
    }));
  }

  function migrarMenuProdutos(menu) {
    const manutencao = menu.find((categoria) => categoria.id === 'cat_manutencao');
    if (!manutencao) return false;

    manutencao.itens = manutencao.itens || [];
    let grupoProdutos = manutencao.itens.find((item) => item.id === 'man_produtos_grupo');
    const itemCadastro = manutencao.itens.find((item) => item.id === 'man_produtos' || item.paginaId === 'cadastro_produtos');

    if (!grupoProdutos) {
      grupoProdutos = {
        id: 'man_produtos_grupo',
        nome: 'Produtos',
        paginaId: '',
        icone: 'fa-boxes-stacked',
        ativo: true,
        ordem: 1,
        itens: []
      };
      manutencao.itens.push(grupoProdutos);
    }

    grupoProdutos.itens = grupoProdutos.itens || [];
    if (itemCadastro && itemCadastro !== grupoProdutos) {
      const indice = manutencao.itens.indexOf(itemCadastro);
      manutencao.itens.splice(indice, 1);
      itemCadastro.id = 'man_cadastro_produtos';
      itemCadastro.nome = 'Cadastro de Produtos';
      itemCadastro.paginaId = 'cadastro_produtos';
      itemCadastro.ordem = 1;
      grupoProdutos.itens.unshift(itemCadastro);
    }

    if (!grupoProdutos.itens.some((item) => item.paginaId === 'cadastro_produtos')) {
      grupoProdutos.itens.push({
        id: 'man_cadastro_produtos',
        nome: 'Cadastro de Produtos',
        paginaId: 'cadastro_produtos',
        icone: 'fa-box-open',
        ativo: true,
        ordem: 1,
        itens: []
      });
    }

    manutencao.itens.forEach((item, indice) => { item.ordem = indice + 1; });
    grupoProdutos.itens.forEach((item, indice) => { item.ordem = indice + 1; });
    return true;
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
          { id: 'man_produtos_grupo', nome: 'Produtos', paginaId: '', icone: 'fa-boxes-stacked', ativo: true, ordem: 1, itens: [
            { id: 'man_cadastro_produtos', nome: 'Cadastro de Produtos', paginaId: 'cadastro_produtos', icone: 'fa-box-open', ativo: true, ordem: 1, itens: [] }
          ] },
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
        const menuSalvo = padronizarEstruturaMenu(salvo);
        migrarMenuProdutos(menuSalvo);
        salvarEstruturaMenu(menuSalvo);
        return menuSalvo;
      }
    } catch (error) {
      console.warn('Erro ao ler menu salvo:', error);
    }

    const padrao = criarMenuPadrao();
    migrarMenuProdutos(padrao);
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
    const opcoes = [];
    const idsDescendentes = new Set();
    const itemAtual = encontrarItemMenu(menu, itemId)?.item;

    function marcarDescendentes(item) {
      (item?.itens || []).forEach((filho) => {
        idsDescendentes.add(filho.id);
        marcarDescendentes(filho);
      });
    }

    if (itemAtual) marcarDescendentes(itemAtual);
    menu.forEach((categoria) => {
      opcoes.push({ id: categoria.id, nome: categoria.nome });
      percorrerItensMenu(categoria.itens, (item) => {
        if (!itemAtual || (item.id !== itemId && !idsDescendentes.has(item.id))) {
          opcoes.push({ id: item.id, nome: `${'  '.repeat(item.nivel || 0)}-> ${item.nome}` });
        }
      });
    });
    return opcoes;
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
            <button
              type="button"
              ${itemLabel}
              role="menuitem"
              tabindex="0"
              data-menu-item
              class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
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
        document.querySelectorAll('[data-menu-panel]').forEach((outroPainel) => {
          if (outroPainel !== panel) {
            outroPainel.classList.add('opacity-0', 'pointer-events-none');
            outroPainel.classList.remove('opacity-100', 'pointer-events-auto');
          }
        });
        document.querySelectorAll('[data-menu-trigger]').forEach((outroTrigger) => {
          if (outroTrigger !== trigger) outroTrigger.setAttribute('aria-expanded', 'false');
        });
        panel.classList.remove('opacity-0', 'pointer-events-none');
        panel.classList.add('opacity-100', 'pointer-events-auto');
        trigger.setAttribute('aria-expanded', 'true');
      };

      const fechar = () => {
        timerFechar = window.setTimeout(() => {
          panel.classList.add('opacity-0', 'pointer-events-none');
          panel.classList.remove('opacity-100', 'pointer-events-auto');
          trigger.setAttribute('aria-expanded', 'false');
        }, 700);
      };

      const alternar = (event) => {
        event.preventDefault();
        const aberto = panel.classList.contains('opacity-100');
        if (aberto) {
          fechar();
        } else {
          abrir();
        }
      };

      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-controls', `menu-${Math.random().toString(36).slice(2, 8)}`);
      panel.setAttribute('role', 'menu');

      trigger.addEventListener('mouseenter', abrir);
      trigger.addEventListener('pointerenter', abrir);
      trigger.addEventListener('focus', abrir);
      trigger.addEventListener('mouseleave', fechar);
      trigger.addEventListener('pointerleave', fechar);
      trigger.addEventListener('click', alternar);
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          fecharTodosMenus();
          trigger.focus();
          return;
        }

        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          abrir();
          const primeiroItem = panel.querySelector('[data-menu-item]');
          if (primeiroItem) primeiroItem.focus();
        }
      });

      panel.addEventListener('mouseenter', () => window.clearTimeout(timerFechar));
      panel.addEventListener('pointerenter', () => window.clearTimeout(timerFechar));
      panel.addEventListener('mouseleave', fechar);
      panel.addEventListener('pointerleave', fechar);
      panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          fecharTodosMenus();
          trigger.focus();
        }
      });
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

  function fecharTodosMenus() {
    document.querySelectorAll('[data-menu-panel]').forEach((panel) => {
      panel.classList.add('opacity-0', 'pointer-events-none');
      panel.classList.remove('opacity-100', 'pointer-events-auto');
    });

    document.querySelectorAll('[data-menu-trigger]').forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  function abrirPaginaMenu(idPagina) {
    if (!idPagina) return;

    fecharTodosMenus();

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
