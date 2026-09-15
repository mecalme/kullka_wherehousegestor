document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderizarMenu === 'function') {
    renderizarMenu();
  } else {
    console.error('Erro: menu.js não foi carregado antes do main.js');
  }

  if (typeof carregarTelaEmBranco === 'function') {
    carregarTelaEmBranco();
  }
});
