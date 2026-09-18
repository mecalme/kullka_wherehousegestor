var paginasDinamicas = [];
var idPaginaEdicao = null;
var categoriaSelecionadaId = null;

const DEFINICOES_PAGINAS_WMS = {
  recepcao: {
    titulo: 'Recebimento',
    subtitulo: 'Inbound: entrada, conferência e devoluções',
    secoes: [
      { titulo: 'Agendamento e doca', campos: [
        ['fornecedor', 'Fornecedor', 'Selecione o fornecedor e a nota fiscal prevista para a chegada.', 'select'],
        ['data_chegada', 'Data e hora de chegada', 'Horário agendado para o veículo chegar ao armazém.', 'datetime-local'],
        ['doca', 'Doca de recebimento', 'Doca física onde o veículo será descarregado.', 'text']
      ]},
      { titulo: 'Portaria e conferência', campos: [
        ['placa', 'Placa do veículo', 'Identificação do veículo que entrou na portaria.', 'text'],
        ['nota_fiscal', 'Nota fiscal', 'Número da NF-e usada para conferir a entrada da mercadoria.', 'text'],
        ['status_checkin', 'Status do check-in', 'Registre se o veículo está aguardando, em conferência ou liberado.', 'select']
      ]},
      { titulo: 'Conferência física e devolução', campos: [
        ['volume', 'Volumes recebidos', 'Quantidade física de caixas, paletes ou unidades recebidas.', 'number'],
        ['avarias', 'Avarias', 'Informe danos encontrados durante a inspeção.', 'textarea'],
        ['tipo_entrada', 'Tipo de entrada', 'Escolha recebimento normal, devolução de cliente ou entrega não realizada.', 'select']
      ]}
    ]
  },
  guardagem_enderecamento: {
    titulo: 'Guardagem e Endereçamento',
    subtitulo: 'Putaway: sugestão e transferência para o endereço definitivo',
    secoes: [{ titulo: 'Controle de putaway', campos: [
      ['produto', 'Produto ou EAN', 'Produto que será guardado no armazém.', 'text'],
      ['endereco_sugerido', 'Endereço sugerido', 'Posição calculada pelas regras de armazenagem.', 'text'],
      ['fila_pendente', 'Armazenagem pendente', 'Fila de paletes ou caixas que ainda aguardam movimentação.', 'select'],
      ['endereco_destino', 'Endereço definitivo', 'Rua, prateleira, nível e compartimento de destino.', 'text'],
      ['responsavel', 'Responsável pela transferência', 'Colaborador que executou a movimentação da doca.', 'text']
    ]}]
  },
  movimentacao_estoque: {
    titulo: 'Movimentação e Estoque Interno',
    subtitulo: 'Posições, transferências, reabastecimento e avarias',
    secoes: [{ titulo: 'Movimentação interna', campos: [
      ['endereco_origem', 'Endereço de origem', 'Posição atual: rua, prateleira, nível ou compartimento.', 'text'],
      ['endereco_destino', 'Endereço de destino', 'Nova posição para onde o estoque será transferido.', 'text'],
      ['lote', 'Lote', 'Lote usado para rastrear validade e bloqueios.', 'text'],
      ['tipo_movimento', 'Tipo de movimento', 'Escolha transferência, reabastecimento, bloqueio ou avaria.', 'select'],
      ['motivo', 'Motivo ou observação', 'Justifique a movimentação ou o bloqueio do produto.', 'textarea']
    ]}]
  },
  separacao_preparacao: {
    titulo: 'Separação e Preparação',
    subtitulo: 'Outbound: ondas, picking, packing e consolidação',
    secoes: [{ titulo: 'Execução outbound', campos: [
      ['onda', 'Onda de separação', 'Agrupe pedidos por rota, transportadora ou prioridade.', 'text'],
      ['metodo_picking', 'Método de picking', 'Escolha picking discreto, por lote ou por zona.', 'select'],
      ['pedido', 'Pedido', 'Pedido que será separado e preparado.', 'text'],
      ['embalagem', 'Embalagem', 'Caixa, etiqueta e conferência final do volume.', 'text'],
      ['consolidacao', 'Consolidação', 'Indique os volumes que pertencem ao mesmo pedido.', 'textarea']
    ]}]
  },
  expedicao: {
    titulo: 'Expedição',
    subtitulo: 'Shipping: carregamento, manifesto e baixa de saída',
    secoes: [{ titulo: 'Controle de saída', campos: [
      ['doca_saida', 'Doca de saída', 'Doca onde a carga será carregada no veículo.', 'text'],
      ['romaneio', 'Romaneio', 'Lista organizada de volumes e pedidos da carga.', 'text'],
      ['transportadora', 'Transportadora', 'Empresa responsável pelo transporte da entrega.', 'text'],
      ['manifesto', 'Manifesto de transporte', 'Documento que vincula a carga à transportadora.', 'text'],
      ['baixa_saida', 'Baixa de saída', 'Confirmação da liberação física do veículo.', 'select']
    ]}]
  },
  inventario_acuracidade: {
    titulo: 'Inventário e Acuracidade',
    subtitulo: 'Contagens cíclicas, inventário geral e ajustes',
    secoes: [{ titulo: 'Contagem e ajustes', campos: [
      ['tipo_inventario', 'Tipo de inventário', 'Escolha inventário cíclico ou inventário geral.', 'select'],
      ['curva_abc', 'Curva ou área', 'Defina a curva ABC, rua ou área que será contada.', 'text'],
      ['data_contagem', 'Data da contagem', 'Dia planejado para realizar a contagem física.', 'date'],
      ['divergencia', 'Divergência encontrada', 'Diferença entre o saldo físico e o saldo no sistema.', 'number'],
      ['ajuste', 'Ajuste de estoque', 'Registre perdas, sobras ou correções aprovadas.', 'textarea']
    ]}]
  },
  painel_kpis: {
    titulo: 'Painel e Indicadores',
    subtitulo: 'KPIs de ocupação, docas e acuracidade do estoque',
    secoes: [{ titulo: 'Filtros do painel', campos: [
      ['periodo', 'Período', 'Intervalo usado no cálculo dos indicadores.', 'date'],
      ['area', 'Área do armazém', 'Filtre os indicadores por área, rua ou operação.', 'text'],
      ['indicador', 'Indicador', 'Escolha ocupação, gargalos de doca ou acuracidade.', 'select']
    ]}]
  }
};

const PAGINAS_SISTEMA = [
  ['cadastro_produtos', 'Cadastros de produtos', 'item_produto', 'fa-boxes-stacked', 'cat_manutencao'],
  ['fator_conversao', 'Fator de Conversão', 'item_produto', 'fa-arrows-rotate', 'cat_manutencao'],
  ['unidades_medida', 'Unidades de medida', 'item_produto', 'fa-ruler-combined', 'cat_manutencao'],
  ['gestao_paginas', 'Gestão de Páginas', 'cat_manutencao', 'fa-file-code', 'cat_manutencao'],
  ['gerenciar_menu', 'Gestão de Menu', 'cat_manutencao', 'fa-sliders', 'cat_manutencao'],
  ['recepcao', 'Recebimento', 'grupo_recebimento', 'fa-truck-ramp-box'],
  ['guardagem_enderecamento', 'Guardagem e Endereçamento', 'grupo_guardagem', 'fa-warehouse'],
  ['movimentacao_estoque', 'Movimentação e Estoque Interno', 'grupo_movimentacao', 'fa-arrows-left-right'],
  ['separacao_preparacao', 'Separação e Preparação', 'grupo_separacao', 'fa-list-check'],
  ['expedicao', 'Expedição', 'grupo_expedicao', 'fa-truck-fast'],
  ['inventario_acuracidade', 'Inventário e Acuracidade', 'grupo_inventario', 'fa-clipboard-list'],
  ['painel_kpis', 'Painel e Indicadores', 'grupo_kpis', 'fa-chart-line']
];

function sincronizarPaginas() {
  try {
    paginasDinamicas = JSON.parse(localStorage.getItem('kullka_paginas')) || [];
    const idsRegistrados = new Set(paginasDinamicas.map((pagina) => obterPaginaId(pagina)));
    PAGINAS_SISTEMA.forEach(([id, nome, submenuPaiId, icone, menuId = 'cat_operacao']) => {
      if (!idsRegistrados.has(id)) {
        paginasDinamicas.push({ id, nome, menuId, submenuPaiId, icone, sistema: true, podeExcluir: false });
      }
    });
    const menuAtual = obterEstruturaMenu();
    paginasDinamicas.forEach((pagina) => {
      const caminho = localizarPaginaNoMenu(menuAtual, obterPaginaId(pagina));
      if (caminho) {
        pagina.menuId = caminho.menuId;
        pagina.submenuPaiId = caminho.paiId || '';
      }
    });
    localStorage.setItem('kullka_paginas', JSON.stringify(paginasDinamicas));
  } catch (error) {
    console.warn('Erro ao sincronizar páginas:', error);
    paginasDinamicas = [];
  }
}

function carregarTelaEmBranco() {
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  const cards = [
    { id: 'recepcao', titulo: 'Recebimento', descricao: 'Agendamento, conferência e entrada de mercadorias.', icone: 'fa-truck-ramp-box', cor: 'emerald' },
    { id: 'guardagem_enderecamento', titulo: 'Guardagem', descricao: 'Posicionamento e endereçamento do estoque.', icone: 'fa-warehouse', cor: 'sky' },
    { id: 'movimentacao_estoque', titulo: 'Movimentação', descricao: 'Transferências internas e ajustes de estoque.', icone: 'fa-arrows-left-right', cor: 'violet' },
    { id: 'separacao_preparacao', titulo: 'Separação', descricao: 'Picking, embalagem e preparação de pedidos.', icone: 'fa-list-check', cor: 'amber' },
    { id: 'expedicao', titulo: 'Expedição', descricao: 'Carregamento, romaneio e saída da carga.', icone: 'fa-truck-fast', cor: 'rose' },
    { id: 'inventario_acuracidade', titulo: 'Inventário', descricao: 'Contagem cíclica e ajustes de acuracidade.', icone: 'fa-clipboard-list', cor: 'slate' },
    { id: 'painel_kpis', titulo: 'KPIs', descricao: 'Indicadores de desempenho e ocupação do armazém.', icone: 'fa-chart-line', cor: 'teal' }
  ];

  main.innerHTML = `
    <div class="space-y-6">
      <div class="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-lg shadow-emerald-500/20">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">Dashboard WMS</p>
            <h1 class="mt-2 text-3xl font-black tracking-tight">Operação em tempo real</h1>
          </div>
          <div class="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur-sm">
            <div class="text-emerald-100">Status geral</div>
            <strong class="text-lg">Armazém ativo</strong>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        ${cards.map(({ id, titulo, descricao, icone, cor }) => `
          <button type="button" onclick="abrirPaginaMenu('${id}')" class="group text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
            <div class="mb-4 flex items-center justify-between">
              <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-${cor}-100 text-${cor}-600">
                <i class="fa-solid ${icone} text-xl"></i>
              </span>
              <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Abrir</span>
            </div>
            <h2 class="text-lg font-bold text-slate-800">${titulo}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">${descricao}</p>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function carregarTelaGestaoPaginas() {
  sincronizarPaginas();
  const main = document.getElementById('conteudoPrincipal');
  if (!main) return;

  main.innerHTML = `
    <div class="space-y-6">
      <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 mb-2">Gestão de Páginas</h1>
          <p class="text-slate-500">Gerencie páginas dinâmicas e vínculos no menu.</p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <button type="button" onclick="abrirFormularioPagina()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
            <i class="fa-solid fa-plus"></i>
            Nova página
          </button>
          <button type="button" onclick="organizarPaginasNoMenu()" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            <i class="fa-solid fa-list-check"></i>
            Organizar no menu
          </button>
        </div>
      </div>

      <div id="formPagina" class="hidden p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Página</h2>
        <input type="hidden" id="paginaIdOriginal" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="block">
            <span class="text-sm font-medium text-slate-700">ID da página</span>
            <input id="paginaIdInput" type="text" placeholder="cadastro_produto" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Nome</span>
            <input id="paginaNomeInput" type="text" placeholder="Cadastro de produto" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Menu principal</span>
            <select id="paginaMenuInput" onchange="atualizarSubmenusPagina()" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"></select>
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Submenu pai (opcional)</span>
            <select id="paginaSubmenuInput" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"></select>
          </label>
          <label class="block">
            <span class="text-sm font-medium text-slate-700">Ícone</span>
            <input id="paginaIconeInput" type="text" value="fa-file-lines" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <div class="md:col-span-2 flex justify-end gap-2">
            <button type="button" onclick="fecharFormularioPagina()" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700">Cancelar</button>
            <button type="button" onclick="salvarPagina()" class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Salvar página</button>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Páginas existentes</h2>
        ${paginasDinamicas.length === 0 ? `
          <p class="text-sm text-slate-500">Nenhuma página dinâmica cadastrada.</p>
        ` : `
          <div class="space-y-2">
            ${paginasDinamicas.map((pagina) => `
              <div class="flex items-center justify-between border-b border-slate-100 py-3">
                <div>
                  <span class="block text-sm font-medium text-slate-700">${escaparHtml(obterPaginaNome(pagina))}</span>
                  <span class="text-xs text-slate-500">${escaparHtml(obterPaginaId(pagina))} ${pagina.sistema ? '· Sistema' : '· Personalizada'}</span>
                </div>
                <div class="flex flex-nowrap items-center gap-2">
                  <button type="button" onclick="editarPagina('${encodeURIComponent(obterPaginaId(pagina))}')" class="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs hover:bg-blue-200">Editar</button>
                  ${pagina.sistema ? '' : `<button type="button" onclick="excluirPagina('${encodeURIComponent(obterPaginaId(pagina))}')" class="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs hover:bg-red-200">Excluir</button>`}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
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

  const encontrado = itemId ? encontrarItemMenu(menu, itemId) : null;
  const item = encontrado?.item || null;
  const paiAtual = encontrado?.pai?.id || encontrado?.categoria?.id || categoriaId;
  categoriaSelect.innerHTML = obterOpcoesPaisMenu(menu, itemId).map((opcao) => `
    <option value="${opcao.id}" ${opcao.id === paiAtual ? 'selected' : ''}>
      ${opcao.nome}
    </option>
  `).join('');

  if (item) {
    itemIdInput.value = item.id;
    categoriaSelect.value = paiAtual;
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
  const paiId = document.getElementById('itemMenuCategoria')?.value;
  const itemId = document.getElementById('itemMenuId')?.value || '';
  const nome = document.getElementById('itemMenuNome')?.value?.trim() || '';
  const paginaId = document.getElementById('itemMenuPaginaId')?.value?.trim() || '';
  const icone = document.getElementById('itemMenuIcone')?.value || 'fa-file-lines';

  if (!paiId || !nome) {
    alert('Preencha o menu pai e o nome do item.');
    return;
  }

  const destino = obterColecaoFilhosMenu(menu, paiId);
  if (!destino) return;

  if (itemId) {
    const encontrado = encontrarItemMenu(menu, itemId);
    if (!encontrado) return;
    const itemExistente = encontrado.item;
    removerItemMenuDaEstrutura(menu, itemId);
    itemExistente.nome = nome;
    itemExistente.paginaId = paginaId || '';
    itemExistente.icone = icone;
    itemExistente.ativo = true;
    itemExistente.ordem = destino.length + 1;
    destino.push(itemExistente);
  } else {
    const novoItem = {
      id: gerarId('item'),
      nome,
      paginaId: paginaId || '',
      icone,
      ativo: true,
      ordem: destino.length + 1,
      itens: []
    };

    destino.push(novoItem);
  }

  salvarEstruturaMenu(menu);
  fecharFormularioItem();
  categoriaSelecionadaId = menu.find((categoria) => categoria.id === paiId)?.id || categoriaSelecionadaId;
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function removerItemMenu(categoriaId, itemId) {
  const confirmar = confirm('Deseja excluir este item do menu?');
  if (!confirmar) return;

  const menu = obterEstruturaMenu();
  if (!removerItemMenuDaEstrutura(menu, itemId)) return;
  salvarEstruturaMenu(menu);
  categoriaSelecionadaId = categoriaId;
  renderizarMenu();
  carregarTelaGestaoMenu();
}

function renderizarItensGestaoMenu(itens, categoriaId, nivel = 0) {
  return (itens || [])
    .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
    .map((item) => `
      <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3" style="margin-left: ${nivel * 24}px">
        <div class="flex min-w-0 items-center gap-3">
          <i class="fa-solid ${item.icone || 'fa-folder'} text-slate-500"></i>
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold text-slate-800">${item.nome}</div>
            <div class="text-[11px] text-slate-500">${item.paginaId || 'Agrupador de submenu'}</div>
          </div>
        </div>
        <div class="flex flex-nowrap items-center gap-2 shrink-0">
          <button type="button" onclick="editarItemMenu('${categoriaId}', '${item.id}')" class="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs hover:bg-blue-200">Editar</button>
          <button type="button" onclick="removerItemMenu('${categoriaId}', '${item.id}')" class="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs hover:bg-red-200">Excluir</button>
        </div>
      </div>
      ${renderizarItensGestaoMenu(item.itens, categoriaId, nivel + 1)}
    `).join('');
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
          <div class="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onclick="abrirFormularioCategoria()"
              class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <i class="fa-solid fa-plus"></i>
              Nova Categoria
            </button>
            <button
              type="button"
              onclick="organizarPaginasNoMenu()"
              class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <i class="fa-solid fa-list-check"></i>
              Organizar páginas
            </button>
          </div>
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
            <span class="text-sm font-medium text-slate-700">Menu pai</span>
            <select id="itemMenuCategoria" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"></select>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Nome</span>
            <input id="itemMenuNome" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Página (opcional)</span>
            <input id="itemMenuPaginaId" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="produtos; vazio = agrupador" />
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

                <div class="mt-3 flex flex-nowrap items-center gap-2">
                  <button
                    type="button"
                    onclick="editarCategoriaMenu('${categoria.id}')"
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
              ` : renderizarItensGestaoMenu(categoriaAtual.itens, categoriaAtual.id)}
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

  const definicao = DEFINICOES_PAGINAS_WMS[idPagina];
  if (!definicao) {
    main.innerHTML = `
      <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Página dinâmica</h1>
        <p class="text-slate-500">ID: ${escaparHtml(idPagina)}</p>
      </div>
    `;
    return;
  }

  const tiposSelect = ['select'];
  const renderizarCampo = ([id, nome, ajuda, tipo]) => `
    <label class="block">
      <span class="flex items-center gap-2 text-sm font-medium text-slate-700">
        ${escaparHtml(nome)}
        <button type="button" title="${escaparHtml(ajuda)}" aria-label="Ajuda sobre ${escaparHtml(nome)}" class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-500 hover:bg-slate-100" onclick="mostrarAjudaCampo('${encodeURIComponent(nome)}', '${encodeURIComponent(ajuda)}')">?</button>
      </span>
      ${tiposSelect.includes(tipo) ? `
        <select id="${escaparHtml(id)}" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          <option value="">Selecione</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
        </select>
      ` : tipo === 'textarea' ? `
        <textarea id="${escaparHtml(id)}" rows="3" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"></textarea>
      ` : `
        <input id="${escaparHtml(id)}" type="${escaparHtml(tipo)}" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      `}
    </label>
  `;

  main.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Operação WMS</p>
          <h1 class="text-2xl font-bold text-slate-800">${escaparHtml(definicao.titulo)}</h1>
          <p class="mt-1 text-slate-500">${escaparHtml(definicao.subtitulo)}</p>
        </div>
        <button type="button" title="Ajuda sobre esta página" aria-label="Ajuda sobre esta página" onclick="mostrarAjudaCampo('${encodeURIComponent(definicao.titulo)}', '${encodeURIComponent(definicao.subtitulo)}')" class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100">?</button>
      </div>
      ${definicao.secoes.map((secao) => `
        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-bold text-slate-800">${escaparHtml(secao.titulo)}</h2>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            ${secao.campos.map(renderizarCampo).join('')}
          </div>
        </section>
      `).join('')}
      <div class="flex justify-end">
        <button type="button" onclick="guardarFormularioWms('${encodeURIComponent(idPagina)}')" class="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">Guardar registro</button>
      </div>
    </div>
  `;
}


function mostrarAjudaCampo(nomeCodificado, ajudaCodificada) {
  const nome = decodeURIComponent(nomeCodificado);
  const ajuda = decodeURIComponent(ajudaCodificada);
  const existente = document.getElementById('ajudaCampoModal');
  if (existente) existente.remove();
  document.body.insertAdjacentHTML('beforeend', `
    <div id="ajudaCampoModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4" onclick="if (event.target === this) this.remove()">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-lg font-bold text-slate-800">${escaparHtml(nome)}</h2>
          <button type="button" aria-label="Fechar ajuda" onclick="document.getElementById('ajudaCampoModal').remove()" class="text-xl text-slate-400 hover:text-slate-700">&times;</button>
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-600">${escaparHtml(ajuda)}</p>
      </div>
    </div>
  `);
}

function guardarFormularioWms(idPaginaCodificado) {
  const idPagina = decodeURIComponent(idPaginaCodificado);
  const dados = {};
  (DEFINICOES_PAGINAS_WMS[idPagina]?.secoes || []).forEach((secao) => {
    secao.campos.forEach(([id]) => {
      dados[id] = document.getElementById(id)?.value || '';
    });
  });
  localStorage.setItem(`kullka_wms_${idPagina}`, JSON.stringify(dados));
  alert('Registro guardado localmente.');
}

function obterPaginaId(pagina) {
  return String(pagina?.id || pagina?.paginaId || pagina?.slug || pagina?.nome || '').trim();
}

function obterPaginaNome(pagina) {
  return String(pagina?.nome || pagina?.titulo || pagina?.name || obterPaginaId(pagina)).trim();
}

function abrirFormularioPagina(paginaId = '') {
  const form = document.getElementById('formPagina');
  const menuSelect = document.getElementById('paginaMenuInput');
  const submenuSelect = document.getElementById('paginaSubmenuInput');
  if (!form || !menuSelect || !submenuSelect) return;

  const pagina = paginasDinamicas.find((item) => obterPaginaId(item) === paginaId);
  const menu = obterEstruturaMenu().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  menuSelect.innerHTML = menu.map((categoria) => `
    <option value="${escaparHtml(categoria.id)}">${escaparHtml(categoria.nome)}</option>
  `).join('');
  submenuSelect.innerHTML = '<option value="">Diretamente no menu principal</option>';

  document.getElementById('paginaIdOriginal').value = pagina ? obterPaginaId(pagina) : '';
  document.getElementById('paginaIdInput').value = pagina ? obterPaginaId(pagina) : '';
  document.getElementById('paginaNomeInput').value = pagina ? obterPaginaNome(pagina) : '';
  document.getElementById('paginaIconeInput').value = pagina?.icone || 'fa-file-lines';
  menuSelect.value = pagina?.menuId || menu[0]?.id || '';
  atualizarSubmenusPagina(pagina?.submenuPaiId || '');
  submenuSelect.value = pagina?.submenuPaiId || '';
  form.classList.remove('hidden');
}

function atualizarSubmenusPagina(valorSelecionado = '') {
  const menuSelect = document.getElementById('paginaMenuInput');
  const submenuSelect = document.getElementById('paginaSubmenuInput');
  if (!menuSelect || !submenuSelect) return;

  const categoria = obterEstruturaMenu().find((item) => item.id === menuSelect.value);
  submenuSelect.innerHTML = '<option value="">Diretamente no menu principal</option>';
  percorrerItensMenu(categoria?.itens, (item) => {
    if (!item.paginaId && item.id !== document.getElementById('paginaIdOriginal')?.value) {
      const prefixo = '  '.repeat(item.nivel || 0);
      submenuSelect.insertAdjacentHTML('beforeend', `<option value="${item.id}">${escaparHtml(prefixo + '-> ' + item.nome)}</option>`);
    }
  });
  submenuSelect.value = valorSelecionado;
}

function fecharFormularioPagina() {
  const form = document.getElementById('formPagina');
  if (form) form.classList.add('hidden');
  idPaginaEdicao = null;
}

function sincronizarPaginaComMenu(pagina, idAnterior = '') {
  const menu = obterEstruturaMenu();
  let itemExistente = null;

  function removerVinculos(itens) {
    for (let index = (itens || []).length - 1; index >= 0; index -= 1) {
      const item = itens[index];
      if (item.paginaId === idAnterior || item.paginaId === pagina.id) {
        if (!itemExistente) itemExistente = item;
        itens.splice(index, 1);
      } else {
        removerVinculos(item.itens);
      }
    }
  }

  menu.forEach((categoria) => removerVinculos(categoria.itens));

  const categoria = menu.find((item) => item.id === pagina.menuId);
  if (!categoria) return;
  const destino = pagina.submenuPaiId
    ? obterColecaoFilhosMenu(menu, pagina.submenuPaiId)
    : (categoria.itens = categoria.itens || [], categoria.itens);
  if (!destino) return;

  destino.push({
    ...(itemExistente || {}),
    id: itemExistente?.id || gerarId('item'),
    nome: pagina.nome,
    paginaId: pagina.id,
    icone: pagina.icone || 'fa-file-lines',
    ativo: true,
    ordem: destino.length + 1
  });

  destino.forEach((item, index) => {
    item.ordem = index + 1;
  });
  salvarEstruturaMenu(menu);
}

function salvarPagina() {
  const idOriginal = document.getElementById('paginaIdOriginal')?.value?.trim() || '';
  const id = document.getElementById('paginaIdInput')?.value?.trim() || '';
  const nome = document.getElementById('paginaNomeInput')?.value?.trim() || '';
  const menuId = document.getElementById('paginaMenuInput')?.value || '';
  const submenuPaiId = document.getElementById('paginaSubmenuInput')?.value || '';
  const icone = document.getElementById('paginaIconeInput')?.value?.trim() || 'fa-file-lines';

  if (!id || !nome || !menuId) {
    alert('Informe o ID, o nome da página e o menu principal.');
    return;
  }

  const paginaDuplicada = paginasDinamicas.find((pagina) => obterPaginaId(pagina) === id && obterPaginaId(pagina) !== idOriginal);
  if (paginaDuplicada) {
    alert('Já existe uma página com este ID.');
    return;
  }

  const paginaAtualizada = { id, nome, menuId, submenuPaiId, icone };
  const paginaIndex = paginasDinamicas.findIndex((pagina) => obterPaginaId(pagina) === idOriginal);
  if (paginaIndex >= 0) {
    paginasDinamicas[paginaIndex] = { ...paginasDinamicas[paginaIndex], ...paginaAtualizada };
  } else {
    paginasDinamicas.push(paginaAtualizada);
  }

  salvarPaginas();
  sincronizarPaginaComMenu(paginaAtualizada, idOriginal);
  fecharFormularioPagina();
  renderizarMenu();
  carregarTelaGestaoPaginas();
}

function editarPagina(paginaIdCodificado) {
  sincronizarPaginas();
  abrirFormularioPagina(decodeURIComponent(paginaIdCodificado));
}

function excluirPagina(paginaIdCodificado) {
  const paginaId = decodeURIComponent(paginaIdCodificado);
  sincronizarPaginas();
  const pagina = paginasDinamicas.find((item) => obterPaginaId(item) === paginaId);
  if (!pagina || pagina.sistema) {
    alert('Páginas de sistema não podem ser excluídas.');
    return;
  }
  if (!confirm(`Deseja excluir a página "${obterPaginaNome(pagina)}"?`)) return;

  paginasDinamicas = paginasDinamicas.filter((item) => obterPaginaId(item) !== paginaId);
  const menu = obterEstruturaMenu();
  removerItemMenuDaEstrutura(menu, paginaId);
  salvarEstruturaMenu(menu);
  salvarPaginas();
  renderizarMenu();
  carregarTelaGestaoPaginas();
}

function organizarPaginasNoMenu() {
  sincronizarPaginas();

  if (!paginasDinamicas.length) {
    alert('Não existem páginas dinâmicas para organizar.');
    return;
  }

  let menuIdPadrao = obterEstruturaMenu()[0]?.id || '';
  paginasDinamicas.forEach((pagina) => {
    if (!pagina.menuId) {
      pagina.menuId = menuIdPadrao;
      pagina.submenuPaiId = '';
    }
    sincronizarPaginaComMenu(pagina, pagina.id);
  });
  salvarPaginas();
  renderizarMenu();
  carregarTelaGestaoPaginas();
  alert('Páginas organizadas no menu com sucesso.');
}

function editarCategoriaMenu(categoriaId) {
  const categoria = obterEstruturaMenu().find((item) => item.id === categoriaId);
  if (categoria) abrirFormularioCategoria(categoria);
}

function editarItemMenu(categoriaId, itemId) {
  abrirFormularioItem(categoriaId, itemId);
}

function salvarPaginas() {
  localStorage.setItem('kullka_paginas', JSON.stringify(paginasDinamicas));
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function localizarPaginaNoMenu(menu, paginaId) {
  for (const categoria of menu || []) {
    const procurar = (itens, paiId = '') => {
      for (const item of itens || []) {
        if (item.paginaId === paginaId) return { menuId: categoria.id, paiId };
        const encontrado = procurar(item.itens, item.id);
        if (encontrado) return encontrado;
      }
      return null;
    };
    const encontrado = procurar(categoria.itens);
    if (encontrado) return encontrado;
  }
  return null;
}